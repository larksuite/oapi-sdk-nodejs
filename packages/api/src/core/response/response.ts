import {Err} from "./error";
import {Context} from "@larksuiteoapi/core";
import util from "util";

export class Response<T> {
    private readonly context: Context
    code: number
    msg: string
    error: Err
    data: T

    [propName: string]: any


    constructor(context: Context) {
        this.context = context;
        this.code = 0
        this.msg = ""
    }

    getHeader(): { [key: string]: any } {
        return this.context.getHeader()
    }

    getRequestID(): string {
        return this.context.getRequestID()
    }

    getHTTPStatusCode(): number {
        return this.context.getHTTPStatusCode()
    }

    toString(): string {
        return util.format("http_status_code:%s, request_id:%s, response:{'code':%d, 'msg':%s, data omit...}", this.getHTTPStatusCode(), this.getRequestID(), this.code, this.msg)
    }
}