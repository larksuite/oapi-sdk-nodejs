import {Err} from "./error";
import {Context, HTTPHeaderKeyRequestID, HTTPKeyStatusCode} from "@larksuiteoapi/core";
import util from "util";

export class Response<T> {
    private readonly context: Context
    code: number
    msg: string
    error: Err
    data: T

    constructor(context: Context) {
        this.context = context;
        this.code = 0
        this.msg = ""
    }

    getRequestID(): string {
        return this.context.get(HTTPHeaderKeyRequestID)
    }

    getHTTPStatusCode(): number {
        return this.context.get(HTTPKeyStatusCode)
    }

    setBody(json: any) {
        this.code = json.code
        this.msg = json.msg
        this.error = json.error
    }

    toString(): string {
        return util.format("http_status_code:%s, request_id:%s, response:{'code':%d, 'msg':%s, data omit...}", this.getHTTPStatusCode(), this.getRequestID(), this.code, this.msg)
    }
}