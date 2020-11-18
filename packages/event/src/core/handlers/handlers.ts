import * as util from "util";
import {getEventType2Handler, Handler} from "../../event";
import {NotFoundHandlerErr} from "./err";
import {
    AESCipher,
    CallbackType, ContentType,
    Context, DefaultContentType,
    getConfigByCtx,
    HTTPHeaderKeyRequestID, HTTPHeaderKeyLogID,
    Response, throwTokenInvalidErr
} from "@larksuiteoapi/core";
import {HTTPEvent, V1, V2, Version1} from "../model/event"

const responseFormat = `{"codemsg":"%s"}`
const challengeResponseFormat = `{"challenge":"%s"}`


type handler = (ctx: Context, httpEvent: HTTPEvent) => Promise<void>

const validateFunc = async (_: Context, httpEvent: HTTPEvent) => {
    if (httpEvent.err) {
        throw httpEvent.err
    }
}

const unmarshalFunc = async (ctx: Context, httpEvent: HTTPEvent) => {
    let conf = getConfigByCtx(ctx)
    let body = httpEvent.request.body
    let json: object
    if (typeof body == "string") {
        json = JSON.parse(body)
    } else {
        json = body
    }
    if (conf.getAppSettings().encryptKey) {
        let content = json["encrypt"]
        let cipher = new AESCipher(conf.getAppSettings().encryptKey)
        content = cipher.decrypt(content)
        json = JSON.parse(content)
    }
    conf.getLogger().debug(util.format("[unmarshal] event: %s", JSON.stringify(json)))
    httpEvent.input = json
    let schema = Version1
    let token = json["token"]
    if (json["schema"]) {
        schema = json["schema"]
    }
    let eventType: string
    if (json["event"]) {
        eventType = json["event"]["type"]
    }
    if (json["header"]) {
        token = json["header"]["token"]
        eventType = json["header"]["event_type"]
    }
    httpEvent.schema = schema
    httpEvent.eventType = eventType
    httpEvent.type = json["type"]
    httpEvent.challenge = json["challenge"]
    if (token != conf.getAppSettings().verificationToken) {
        throwTokenInvalidErr()
    }
}

const handlerFunc = async (ctx: Context, httpEvent: HTTPEvent) => {
    if (httpEvent.type == CallbackType.Challenge) {
        return
    }
    let conf = getConfigByCtx(ctx)
    let handler: Handler
    let eventType2Handler = getEventType2Handler(conf)
    if (eventType2Handler) {
        handler = eventType2Handler.m.get(httpEvent.eventType)
    }
    if (!handler) {
        throw new NotFoundHandlerErr(httpEvent.eventType)
    }
    let input: V1<any> | V2<any>
    if (httpEvent.schema == Version1) {
        input = httpEvent.input as V1<any>
    } else {
        input = httpEvent.input as V2<any>
    }
    await handler(ctx, input)
}

const writeHTTPResponse = (httpEvent: HTTPEvent, statusCode: number, body: string) => {
    let response = new Response()
    response.statusCode = statusCode
    response.headers[ContentType.toLowerCase()] = DefaultContentType
    response.body = body
    httpEvent.response = response
}

const complementFunc = async (ctx: Context, httpEvent: HTTPEvent) => {
    let conf = getConfigByCtx(ctx)
    if (httpEvent.err) {
        if (httpEvent.err instanceof NotFoundHandlerErr) {
            conf.getLogger().info(httpEvent.err)
            writeHTTPResponse(httpEvent, 200, util.format(responseFormat, httpEvent.err))
            return
        }
        writeHTTPResponse(httpEvent, 500, util.format(responseFormat, httpEvent.err))
        conf.getLogger().error(httpEvent.err)
        return
    }
    if (httpEvent.type == CallbackType.Challenge) {
        writeHTTPResponse(httpEvent, 200, util.format(challengeResponseFormat, httpEvent.challenge))
        return
    }
    writeHTTPResponse(httpEvent, 200, util.format(responseFormat, "successed"))
}

class Handlers {
    validate: handler
    unmarshal: handler
    handler: handler
    complement: handler

    constructor(validate: handler, unmarshal: handler, handler: handler, complement: handler) {
        this.validate = validate
        this.unmarshal = unmarshal
        this.handler = handler
        this.complement = complement
    }
}

const defaultHandlers = new Handlers(validateFunc, unmarshalFunc, handlerFunc, complementFunc)

export const handle = async (ctx: Context, httpEvent: HTTPEvent) => {
    try {
        let logID = <string>httpEvent.request.headers[HTTPHeaderKeyLogID.toLowerCase()]
        let requestID = <string>httpEvent.request.headers[HTTPHeaderKeyRequestID.toLowerCase()]
        ctx.setRequestID(logID, requestID)
        await defaultHandlers.validate(ctx, httpEvent)
        await defaultHandlers.unmarshal(ctx, httpEvent)
        await defaultHandlers.handler(ctx, httpEvent)
    } catch (e) {
        httpEvent.err = e
    } finally {
        await defaultHandlers.complement(ctx, httpEvent)
    }
}
