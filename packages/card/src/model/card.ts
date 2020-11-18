import {CallbackType, Request, Response} from "@larksuiteoapi/core";

export enum HeaderKey {
    LarkRequestTimestamp = "X-Lark-Request-Timestamp",
    LarkRequestRequestNonce = "X-Lark-Request-Nonce",
    LarkSignature = "X-Lark-Signature",
    LarkRefreshToken = "X-Refresh-Token",
}

export interface Header {
    timestamp: string
    nonce: string
    signature: string
    refresh_token: string
}

export class HTTPCard {
    header: Header
    request: Request
    response: Response
    input: object
    output: any
    type: CallbackType
    challenge: string
    err: any
}

export interface Action {
    value?: object
    tag?: string
    option?: string
    timezone?: string

    [propName: string]: any
}

export interface Base {
    open_id?: string
    user_id?: string
    open_message_id?: string
    tenant_key?: string
    token?: string
    timezone?: string
}

export interface Card extends Base {
    action?: Action

    [propName: string]: any
}



