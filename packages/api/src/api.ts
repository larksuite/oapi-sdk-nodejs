import {Request} from "./core/request/request";
import {handle} from "./core/handlers/handlers";
import {newError, instanceOfError} from "./core/response/error";
import {Config, Context} from "@larksuite/oapi-core";

export const send = async <T>(ctx: Context, conf: Config, req: Request<T>) => {
    conf.withContext(ctx)
    req.withContext(ctx)
    let output = await handle(ctx, req)
    if (req.err) {
        if (instanceOfError(req.err)) {
            throw req.err
        }
        throw newError(req.err)
    }
    return output
}

export class ReqCallDone<T> {
    ctx: Context
    result: T
    err: any

    constructor(ctx: Context) {
        this.ctx = ctx
    }
}

export interface ReqCall<T> {
    ctx: Context

    do(): Promise<T> | T
}

export type ErrorCallback = (reqCall: ReqCall<any>, err: any) => Promise<void> | void

export class BatchReqCall {
    readonly reqCalls: ReqCall<any>[]
    readonly reqCallDos: ReqCallDone<any>[]
    readonly errorCallback: ErrorCallback

    constructor(errorCallback: ErrorCallback, ...reqCalls: ReqCall<any>[]) {
        this.reqCalls = reqCalls
        this.reqCallDos = []
        for (let v of this.reqCalls) {
            this.reqCallDos.push(new ReqCallDone(v.ctx))
        }
        this.errorCallback = errorCallback
    }

    do = async () => {
        await Promise.all(this.reqCalls.map((reqCall: ReqCall<any>, index: number) => {
            return reqCall.do().then(result => {
                this.reqCallDos[index].result = result
            }).catch(e => {
                this.reqCallDos[index].err = e
                this.errorCallback(reqCall, e)
            })
        }))
        return this
    }

}