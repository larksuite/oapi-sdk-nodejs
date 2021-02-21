import {Request} from "./core/request/request";
import {handle} from "./core/handlers/handlers";
import {newErr, ErrCode, instanceOfError} from "./core/response/error";
import {Config, Context} from "@larksuiteoapi/core";
import {Response} from "./core/response/response";

export const send = async <T>(ctx: Context, conf: Config, req: Request<T>) => {
    let response
    try {
        response = await _sendRequest(ctx, conf, req)
    } catch (e) {
        if (instanceOfError(e)) {
            throw e
        }
        throw newErr(e)
    }
    if (response.code == ErrCode.Ok) {
        return response.data
    }
    throw response
}

export const sendRequest = async <T>(conf: Config, req: Request<T>) => {
    return _sendRequest(new Context(), conf, req)
}


const _sendRequest = async <T>(ctx: Context, conf: Config, req: Request<T>) => {
    conf.withContext(ctx)
    req.withContext(ctx)
    return handle(ctx, req)
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
    ctx?: Context

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


export class ReqCallResult<T> {
    reqCall: IReqCall<T>
    response: Response<T>
    err: any

    constructor(reqCall: IReqCall<T>) {
        this.reqCall = reqCall
    }
}

export interface IReqCall<T> {
    do(): Promise<Response<T>>
}

export class APIReqCall<T> implements IReqCall<T> {
    conf: Config
    req: Request<T>

    constructor(conf: Config, req: Request<T>) {
        this.conf = conf;
        this.req = req;
    }

    do() {
        return sendRequest(this.conf, this.req);
    }
}

export class BatchAPIReqCall<T> {
    private readonly reqCalls: IReqCall<T>[]
    readonly reqCallResults: ReqCallResult<T>[]

    constructor(reqCalls: IReqCall<T>[]) {
        this.reqCalls = reqCalls
        this.reqCallResults = []
        for (let v of this.reqCalls) {
            this.reqCallResults.push(new ReqCallResult(v))
        }
    }

    do = async () => {
        await Promise.all(this.reqCalls.map((reqCall: IReqCall<T>, index: number) => {
            return reqCall.do().then(result => {
                this.reqCallResults[index].response = result
            }).catch(e => {
                this.reqCallResults[index].err = e
            })
        }))
        return this
    }
}

