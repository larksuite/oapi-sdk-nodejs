import {Request, Response} from "@larksuiteoapi/core";

export const Version1 = "1.0"
export const Version2 = "2.0"


export class HTTPEvent {
    request: Request
    response: Response
    input: object
    schema: string
    type: string
    eventType: string
    challenge: string
    err: any
}

export interface V1Header {
    ts: string
    uuid: string
    token: string
    type: string
}

export interface BaseEvent {
    app_id: string
    type: string
    tenant_key: string
}

export interface V1<T extends BaseEvent> extends V1Header {
    event: T

    [propName: string]: any
}

export interface V2Header {
    event_id: string
    event_type: string
    app_id: string
    tenant_key: string
    create_time: string
    token: string

    [propName: string]: any
}

export interface V2<T> {
    header: V2Header
    event: T

    [propName: string]: any
}