import {ServerResponse} from "http";

export class Request {
    params: { [key: string]: any }
    headers: { [key: string]: any }
    body: string | object

    constructor() {
        this.headers = {}
        this.params = {}
    }
}

export class Response {
    headers: { [key: string]: any }
    statusCode: number
    body: string | object

    constructor() {
        this.headers = {}
    }

    writeResponse(res: ServerResponse) {
        res.statusCode = this.statusCode
        Object.entries(this.headers).forEach(([k, v]) => {
            res.setHeader(k, v)
        })
        if (typeof this.body == "string") {
            res.write(this.body)
        } else {
            res.write(JSON.stringify(this.body))
        }
        res.end();
    }

}