import * as util from "util"
import * as request from "../request/request"
import * as formdata from "../request/formData"
import * as response from "../response/response"

import {
    AppTicketIsEmptyErr,
    throwAccessTokenTypeIsInValidErr, throwHelpDeskAuthorizationIsEmptyErr,
    throwTenantKeyIsEmptyErr,
    throwUserAccessTokenKeyIsEmptyErr
} from "../errors/errors";
import fetch from 'node-fetch';
import FormData from "form-data";
import {Error, ErrCode, newErrorOfInvalidResp} from "../response/error";
import {ApplyAppTicketReq} from "../token/token";
import {setAppAccessToken, setTenantAccessToken, setUserAccessToken} from "./accessToken";
import {URL} from "../constants/constants";
import {
    AppType,
    ContentType,
    ContentTypeJson,
    Context,
    DefaultContentType,
    getConfigByCtx, HTTPKeyStatusCode,
    SdkVersion, HTTPHeaderKey
} from "@larksuiteoapi/core";
import * as fs from "fs";
import tempy from "tempy";
import * as stream from "stream";
import path from "path";

const defaultMaxRetryCount = 1

let defaultHTTPRequestHeader = new Map<string, string>()

defaultHTTPRequestHeader.set("User-Agent", util.format("oapi-sdk-nodejs/%s", SdkVersion))

type handler = <T>(ctx: Context, req: request.Request<T>) => Promise<void>

const initFunc = async <T>(ctx: Context, req: request.Request<T>) => {
    let conf = getConfigByCtx(ctx)
    req.init(conf.getDomain())
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
        if (req.accessTokenType === request.AccessTokenType.User && !req.userAccessToken) {
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
            await setAppAccessToken(ctx, req.httpRequestOpts.headers)
            break
        case request.AccessTokenType.Tenant:
            await setTenantAccessToken(ctx, req.httpRequestOpts.headers)
            break
        case request.AccessTokenType.User:
            await setUserAccessToken(ctx, req.httpRequestOpts.headers)
            break
    }
    if (req.needHelpDeskAuth) {
        let helpDeskAuthorization = getConfigByCtx(ctx).getHelpDeskAuthorization()
        if (!helpDeskAuthorization) {
            throwHelpDeskAuthorizationIsEmptyErr()
        }
        req.httpRequestOpts.headers["X-Lark-Helpdesk-Authorization"] = helpDeskAuthorization
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
        throw newErrorOfInvalidResp(util.format("content-type: %s, is not: %s, if is stream, please `request.setIsResponseStream()`, body:%s", contentType, ContentTypeJson, resp.body.toString()))
    }
}

export const unmarshalResponseFunc = async <T>(ctx: Context, req: request.Request<T>) => {
    let resp = req.httpResponse
    if (req.isResponseStreamReal) {
        if (req.output && req.output instanceof stream.Writable) {
            resp.body.pipe(req.output)
            req.response.data = req.output
            return
        }
        let body = await resp.buffer()
        req.output = body as any
        req.response.data = req.output
        return
    }
    let json = await resp.json()
    getConfigByCtx(ctx).getLogger().debug(util.format("[unmarshalResponse] request:%s, response:body:",
        req), JSON.stringify(json))
    req.retryable = retryable(json.code)
    req.response.setBody(json)
    if (req.isNotDataField) {
        req.response.data = json
    } else {
        req.response.data = json["data"]
    }
}

const retryable = (code: number): boolean => {
    let b = false
    switch (code) {
        case ErrCode.AccessTokenInvalid:
        case ErrCode.AppAccessTokenInvalid:
        case ErrCode.TenantAccessTokenInvalid:
            b = true
            break
    }
    return b
}

// apply app ticket
export const applyAppTicket = async (ctx: Context) => {
    let conf = getConfigByCtx(ctx)
    let req = request.newRequestByAuth(URL.ApplyAppTicketPath, "POST",
        new ApplyAppTicketReq(conf.getAppSettings().appID, conf.getAppSettings().appSecret), {})
    await handle(ctx, req)
}

const deleteTmpFile = async <T>(ctx: Context, req: request.Request<T>) => {
    let conf = getConfigByCtx(ctx)
    let bodySource = req.httpRequestOpts.bodySource
    if (bodySource && bodySource.isStream) {
        try {
            fs.unlinkSync(bodySource.filePath)
        } catch (err) {
            conf.getLogger().info(util.format("[complement] request:%s, delete tmp file(%s) err: ", req.toString()), bodySource.filePath, err)
        }
    }
}

const complement = async <T>(ctx: Context, req: request.Request<T>, err: Error) => {
    await deleteTmpFile(ctx, req)
    if (err) {
        if (err instanceof AppTicketIsEmptyErr) {
            await applyAppTicket(ctx)
        }
        throw err
    }
    if (req.response && req.response.code == ErrCode.AppTicketInvalid) {
        await applyAppTicket(ctx)
        return
    }
}

export class Handlers {
    init: handler
    validate: handler
    build: handler
    sign: handler
    validateResponse: handler
    unmarshalResponse: handler

    constructor(init: handler, validate: handler, build: handler, sign: handler, validateResponse: handler,
                unmarshalResponse: handler) {
        this.init = init
        this.validate = validate
        this.build = build
        this.sign = sign
        this.validateResponse = validateResponse
        this.unmarshalResponse = unmarshalResponse
    }

    private _send = async <T>(ctx: Context, req: request.Request<T>) => {
        await this.build(ctx, req)
        await this.sign(ctx, req)
        let bodySource = req.httpRequestOpts.bodySource
        if (bodySource && bodySource.isStream) {
            req.httpRequestOpts.body = fs.createReadStream(bodySource.filePath)
        }
        req.httpResponse = await fetch(req.url(), req.httpRequestOpts)
        let header: { [key: string]: any } = {}
        req.httpResponse.headers.forEach((value, name) => {
            header[name.toLowerCase()] = value
        })
        ctx.set(HTTPHeaderKey, header)
        ctx.set(HTTPKeyStatusCode, req.httpResponse.status)
        req.response = new response.Response<T>(ctx)
        await this.validateResponse(ctx, req)
        await this.unmarshalResponse(ctx, req)
    }

    send = async <T>(ctx: Context, req: request.Request<T>) => {
        let i = 0
        let conf = getConfigByCtx(ctx)
        do {
            i++
            if (req.retryable) {
                conf.getLogger().debug(util.format("[retry] request:%s, response: ", req.toString()), req.response.toString())
            }
            await this._send(ctx, req)
        } while (req.retryable && i <= defaultMaxRetryCount)
    }
}

export const Default = new Handlers(initFunc, validateFunc, buildFunc, signFunc, validateResponseFunc, unmarshalResponseFunc)

export const handle = async <T>(ctx: Context, req: request.Request<T>) => {
    let err: Error
    try {
        await Default.init(ctx, req)
        await Default.validate(ctx, req)
        await Default.send(ctx, req)
    } catch (e) {
        err = e
    } finally {
        await complement(ctx, req, err)
    }
    return req.response
}






