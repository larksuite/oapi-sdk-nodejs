import * as util from "util"
import * as request from "../request/request"
import * as formdata from "../request/formData"

import {
    AppTicketIsEmptyErr,
    throwAccessTokenTypeIsInValidErr,
    throwTenantKeyIsEmptyErr,
    throwUserAccessTokenKeyIsEmptyErr
} from "../errors/errors";
import fetch from 'node-fetch';
import FormData from "form-data";
import {ErrCode, instanceOfError, newErrorOfInvalidResp, retryable} from "../response/error";
import {ApplyAppTicketReq} from "../token/token";
import {setAppAccessToken, setTenantAccessToken, setUserAccessToken} from "./accessToken";
import {URL} from "../constants/constants";
import {
    AppType,
    ContentType,
    ContentTypeJson,
    Context,
    DefaultContentType,
    getConfigByCtx, HTTPHeaderKeyRequestID, HTTPHeaderKeyLogID, HTTPKeyStatusCode,
    SdkVersion
} from "@larksuiteoapi/core";
import * as fs from "fs";
import tempy from "tempy";
import * as stream from "stream";
import path from "path";

const defaultMaxRetryCount = 1

let defaultHTTPRequestHeader = new Map<string, string>()

defaultHTTPRequestHeader.set("User-Agent", util.format("oapi-sdk-nodejs/%s", SdkVersion))

type handler = <T>(ctx: Context, req: request.Request<T>) => Promise<void>

const initFunc = async <T>(_: Context, req: request.Request<T>) => {
    req.init()
}

const validateFunc = async <T>(ctx: Context, req: request.Request<T>) => {
    if (req.accessTokenType == request.AccessTokenType.None) {
        return
    }
    if (!req.accessibleTokenTypeSet.has(req.accessTokenType)) {
        throwAccessTokenTypeIsInValidErr()
    }
    if (getConfigByCtx(ctx).getAppSettings().appType === AppType.ISV) {
        if (req.accessTokenType === request.AccessTokenType.Tenant && !req.tenantKey) {
            throwTenantKeyIsEmptyErr()
        }
        if (req.accessTokenType === request.AccessTokenType.User && !req.userAccessToken && !req.userID) {
            throwUserAccessTokenKeyIsEmptyErr()
        }
    }
}

const reqBodyFromFormData = <T>(ctx: Context, req: request.Request<T>): void => {
    const form = new FormData();
    let fd = req.input as formdata.FormData
    Array.from(fd.getParams().entries()).forEach(([key, value]) => {
        form.append(key, value)
    })
    let hasStream = false
    for (let file of fd.getFiles()) {
        let opt = {
            filename: file.getName()
        }
        if (file.getType()) {
            opt["contentType"] = file.getType()
        }
        if (file.isStream()) {
            hasStream = true
        }
        form.append(file.getFieldName(), file.getContent(), opt)
    }
    Object.entries(form.getHeaders()).forEach(([key, value]) => {
        req.httpRequestOpts.headers[key] = value
    })
    if (hasStream) {
        let filePath = tempy.directory({
            prefix: "larksuiteoapi-",
        })
        filePath = path.join(filePath, "formdata")
        form.pipe(fs.createWriteStream(filePath))
        req.httpRequestOpts.bodySource = {
            isStream: true,
            filePath: filePath,
        }
        getConfigByCtx(ctx).getLogger().debug(util.format("[build]request:%s, formdata:%s", req, filePath))
    } else {
        req.httpRequestOpts.body = form.getBuffer()
        getConfigByCtx(ctx).getLogger().debug(util.format("[build]request:%s, formdata:", req), req.httpRequestOpts.body)
    }
}

const reqBodyFromInput = <T>(ctx: Context, req: request.Request<T>): void => {
    req.httpRequestOpts.headers[ContentType] = DefaultContentType
    let input: string
    if (typeof req.input == "string") {
        input = req.input
    } else {
        input = JSON.stringify(req.input)
    }
    req.httpRequestOpts.body = input
    getConfigByCtx(ctx).getLogger().debug(util.format("[build]request:%s, body:", req), req.httpRequestOpts.body)
}

const buildFunc = async <T>(ctx: Context, req: request.Request<T>) => {
    if (!req.retryable) {
        let conf = getConfigByCtx(ctx)
        let opts = {
            method: req.httpMethod,
            timeout: req.timeout,
            headers: {},
        }
        Array.from(defaultHTTPRequestHeader).forEach(([key, value]) => {
            opts.headers[key.toLowerCase()] = value
        })
        req.httpRequestOpts = opts
        if (req.input) {
            if (req.input instanceof formdata.FormData) {
                reqBodyFromFormData(ctx, req)
            } else {
                reqBodyFromInput(ctx, req)
            }
        } else {
            conf.getLogger().debug(util.format("[build]request:%s, not body", req))
        }
    }
}

const signFunc = async <T>(ctx: Context, req: request.Request<T>) => {
    switch (req.accessTokenType) {
        case request.AccessTokenType.App:
            return await setAppAccessToken(ctx, req.httpRequestOpts.headers)
        case request.AccessTokenType.Tenant:
            return await setTenantAccessToken(ctx, req.httpRequestOpts.headers)
        case request.AccessTokenType.User:
            return await setUserAccessToken(ctx, req.httpRequestOpts.headers)
    }
}

const validateResponseFunc = async <T>(_: Context, req: request.Request<T>) => {
    let resp = req.httpResponse
    let contentType = resp.headers.get(ContentType.toLowerCase())
    if (req.isResponseStream) {
        if (contentType && contentType.indexOf(ContentTypeJson) > -1) {
            req.isResponseStreamReal = false;
            return
        }
        if (!resp.ok) {
            throw newErrorOfInvalidResp(util.format("response is stream, but status code:%d", resp.status))
        }
        req.isResponseStreamReal = true;
        return
    }
    if (!contentType || contentType.indexOf(ContentTypeJson) === -1) {
        throw newErrorOfInvalidResp(util.format("content-type: %s, is not: %s, if is stream, please `OapiApi.setIsResponseStream()`, body:%s", contentType, ContentTypeJson, resp.body.toString()))
    }
}

export const unmarshalResponseFunc = async <T>(ctx: Context, req: request.Request<T>) => {
    let resp = req.httpResponse
    if (req.isResponseStreamReal) {
        if (req.output && req.output instanceof stream.Writable) {
            resp.body.pipe(req.output)
            return
        }
        let body = await resp.buffer()
        req.output = body as any
        return
    }
    let json = await resp.json()
    getConfigByCtx(ctx).getLogger().debug(util.format("[unmarshalResponse] request:%s, response:body:",
        req), JSON.stringify(json))
    if (req.isNotDataField) {
        req.output = json
    } else {
        req.output = json["data"]
    }
    if (json.code != ErrCode.Ok) {
        req.err = json
    }
}

// apply app ticket
export const applyAppTicket = async (ctx: Context) => {
    let conf = getConfigByCtx(ctx)
    let req = request.newRequestByAuth(URL.ApplyAppTicketPath, "POST",
        new ApplyAppTicketReq(conf.getAppSettings().appID, conf.getAppSettings().appSecret), {})
    await handle(ctx, req)
}

const complementFunc = async <T>(ctx: Context, req: request.Request<T>) => {
    let conf = getConfigByCtx(ctx)
    let bodySource = req.httpRequestOpts.bodySource
    if (bodySource && bodySource.isStream) {
        try {
            fs.unlinkSync(bodySource.filePath)
        } catch (err) {
            conf.getLogger().info(util.format("[complement] request:%s, delete tmp file(%s) err: ", req.toString()), bodySource.filePath, err)
        }
    }
    if (req.err && instanceOfError(req.err)) {
        switch (req.err.code) {
            case ErrCode.AppTicketInvalid:
                await applyAppTicket(ctx)
                break
        }
    } else {
        if (req.err instanceof AppTicketIsEmptyErr) {
            await applyAppTicket(ctx)
            return
        }
    }
}

export class Handlers {
    init: handler
    validate: handler
    build: handler
    sign: handler
    validateResponse: handler
    unmarshalResponse: handler
    complement: handler

    constructor(init: handler, validate: handler, build: handler, sign: handler, validateResponse: handler,
                unmarshalResponse: handler, complement: handler) {
        this.init = init
        this.validate = validate
        this.build = build
        this.sign = sign
        this.validateResponse = validateResponse
        this.unmarshalResponse = unmarshalResponse
        this.complement = complement
    }

    private send0 = async <T>(ctx: Context, req: request.Request<T>) => {
        let conf = getConfigByCtx(ctx)
        await this.build(ctx, req)
        await this.sign(ctx, req)
        let bodySource = req.httpRequestOpts.bodySource
        if (bodySource && bodySource.isStream) {
            req.httpRequestOpts.body = fs.createReadStream(bodySource.filePath)
        }
        req.httpResponse = await fetch(req.fullUrl(conf.getDomain()), req.httpRequestOpts)
        let logID = req.httpResponse.headers.get(HTTPHeaderKeyLogID.toLowerCase())
        let requestID = req.httpResponse.headers.get(HTTPHeaderKeyRequestID.toLowerCase())
        ctx.setRequestID(logID, requestID)
        ctx.set(HTTPKeyStatusCode, req.httpResponse.status)
        await this.validateResponse(ctx, req)
        await this.unmarshalResponse(ctx, req)
    }

    send = async <T>(ctx: Context, req: request.Request<T>) => {
        let i = 0
        let conf = getConfigByCtx(ctx)
        do {
            i++
            if (req.retryable) {
                conf.getLogger().debug(util.format("[retry] request:%s, err: ", req.toString()), req.err)
                req.err = undefined
            }
            await this.send0(ctx, req)
            if (req.err && instanceOfError(req.err)) {
                req.retryable = retryable(req.err)
            }
        } while (req.retryable && i <= defaultMaxRetryCount)
    }
}

export const Default = new Handlers(initFunc, validateFunc, buildFunc, signFunc, validateResponseFunc, unmarshalResponseFunc, complementFunc)

export const handle = async <T>(ctx: Context, req: request.Request<T>) => {
    try {
        await Default.init(ctx, req)
        await Default.validate(ctx, req)
        await Default.send(ctx, req)
    } catch (e) {
        req.err = e
    } finally {
        await Default.complement(ctx, req)
    }
    return req.output
}






