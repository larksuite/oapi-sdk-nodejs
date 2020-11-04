import {Request} from "./core/request/request";
import {handle} from "./core/handlers/handlers";
import {newError, instanceOfError} from "./core/response/error";
import {Config, Context} from "@larksuiteoapi/core";

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
    reqCall: ReqCaller<T>
    result: T
    err: any

    constructor(reqCall: ReqCaller<T>) {
        this.reqCall = reqCall
        this.ctx = reqCall.ctx
    }
}

export interface ReqCaller<T> {
    ctx: Context

    do(): Promise<T> | T
}

export class ReqCall<T> implements ReqCaller<T> {
    ctx: Context
    conf: Config
    req: Request<T>

    constructor(ctx: Context, conf: Config, req: Request<T>) {
        this.ctx = ctx;
        this.conf = conf;
        this.req = req;
    }

    do() {
        return send(this.ctx, this.conf, this.req);
    }

}

export type ErrorCallback = (reqCall: ReqCaller<any>, err: any) => Promise<void> | void

export class BatchReqCall {
    private readonly reqCalls: ReqCaller<any>[]
    private readonly errorCallback: ErrorCallback
    readonly reqCallDos: ReqCallDone<any>[]

    constructor(errorCallback: ErrorCallback, ...reqCalls: ReqCaller<any>[]) {
        this.reqCalls = reqCalls
        this.reqCallDos = []
        for (let v of this.reqCalls) {
            this.reqCallDos.push(new ReqCallDone(v))
        }
        this.errorCallback = errorCallback
    }

    do = async () => {
        await Promise.all(this.reqCalls.map((reqCall: ReqCaller<any>, index: number) => {
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