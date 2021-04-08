import {
    CallbackType,
    ContentType,
    Context,
    DefaultContentType,
    getConfigByCtx,
    HTTPHeaderKey,
    Response,
    throwTokenInvalidErr
} from "@larksuiteoapi/core";
import {Card, Header, HeaderKey, HTTPCard} from "../model/card";
import {NotFoundHandlerErr, SignatureErr} from "./err";
import * as util from 'util'
import {getHandler} from "../card";

const crypto = require('crypto')
const responseFormat = `{"codemsg":"%s"}`
const challengeResponseFormat = `{"challenge":"%s"}`


type handler = (ctx: Context, httpCard: HTTPCard) => Promise<void>

class Handlers {
    init: handler
    validate: handler
    unmarshal: handler
    handler: handler
    complement: handler

    constructor(init: handler, validate: handler, unmarshal: handler, handler: handler, complement: handler) {
        this.init = init
        this.validate = validate
        this.unmarshal = unmarshal
        this.handler = handler
        this.complement = complement
    }
}

const initFunc = async (ctx: Context, httpCard: HTTPCard) => {
    let request = httpCard.request
    ctx.set(HTTPHeaderKey, request.headers)
    httpCard.header = {
        timestamp: <string>request.headers[HeaderKey.LarkRequestTimestamp.toLowerCase()],
        nonce: <string>request.headers[HeaderKey.LarkRequestRequestNonce.toLowerCase()],
        signature: <string>request.headers[HeaderKey.LarkSignature.toLowerCase()],
        refresh_token: <string>request.headers[HeaderKey.LarkRefreshToken.toLowerCase()],
    }
}

const validateFunc = async (ctx: Context, httpCard: HTTPCard) => {
    let conf = getConfigByCtx(ctx)
    let body = httpCard.request.body
    let json: object
    if (typeof body == "string") {
        if (httpCard.header.signature) {
            verify(httpCard.header, conf.getAppSettings().verificationToken, body)
        }
        json = JSON.parse(body)
    } else {
        json = <object>body
    }
    conf.getLogger().debug("[validate] card:", json)
    httpCard.input = json
}

const unmarshalFunc = async (ctx: Context, httpCard: HTTPCard) => {
    let conf = getConfigByCtx(ctx)
    httpCard.type = httpCard.input["type"] as CallbackType
    httpCard.challenge = httpCard.input["challenge"]
    if (httpCard.type == CallbackType.Challenge) {
        let appSettings = conf.getAppSettings()
        if (appSettings.verificationToken != httpCard.input["token"]) {
            throwTokenInvalidErr()
        }
    }
}

const verify = (header: Header, verifyToken: string, body: string): void => {
    let targetSig = signature(header, verifyToken, body)
    if (header.signature != targetSig) {
        throw new SignatureErr()
    }
}

const signature = (header: Header, verifyToken: string, body: string): string => {
    let r = header.timestamp + header.nonce + verifyToken + body
    let hash = crypto.createHash('sha1')
    hash.update(r)
    return hash.digest('hex')
}

const handlerFunc = async (ctx: Context, httpCard: HTTPCard) => {
    if (httpCard.type == CallbackType.Challenge) {
        return
    }
    let conf = getConfigByCtx(ctx)
    let h = getHandler(conf)
    if (!h) {
        throw new NotFoundHandlerErr();
    }
    httpCard.output = await h(ctx, <Card>httpCard.input)
}

const writeHTTPResponse = (httpCard: HTTPCard, statusCode: number, body: string) => {
    let response = new Response()
    response.statusCode = statusCode
    response.headers[ContentType.toLowerCase()] = DefaultContentType
    response.body = body
    httpCard.response = response
}

const complementFunc = async (ctx: Context, httpCard: HTTPCard) => {
    let conf = getConfigByCtx(ctx)
    let err = httpCard.err
    if (err) {
        if (err instanceof NotFoundHandlerErr) {
            conf.getLogger().error(err)
            writeHTTPResponse(httpCard, 500, util.format(responseFormat, err))
            return;
        }
        conf.getLogger().error(err)
        writeHTTPResponse(httpCard, 500, util.format(responseFormat, err))
        return;
    }
    if (httpCard.type == CallbackType.Challenge) {
        writeHTTPResponse(httpCard, 200, util.format(challengeResponseFormat, httpCard.challenge))
        return
    }
    if (httpCard.output) {
        let output = ""
        if (typeof httpCard.output == "string") {
            output = httpCard.output
        } else {
            output = JSON.stringify(httpCard.output)
        }
        writeHTTPResponse(httpCard, 200, output)
        return
    }
    writeHTTPResponse(httpCard, 200, util.format(responseFormat, "success"))
}

const defaultHandlers = new Handlers(initFunc, validateFunc, unmarshalFunc, handlerFunc, complementFunc)

export const handle = async (ctx: Context, httpCard: HTTPCard) => {
    try {
        await defaultHandlers.init(ctx, httpCard)
        await defaultHandlers.validate(ctx, httpCard)
        await defaultHandlers.unmarshal(ctx, httpCard)
        await defaultHandlers.handler(ctx, httpCard)
    } catch (e) {
        httpCard.err = e
    } finally {
        await defaultHandlers.complement(ctx, httpCard)
    }
}




