import {IncomingMessage, RequestListener, ServerResponse} from "http";
import {Config} from "../config/config";
import {Request} from "./model";
import {HTTPHandle} from "./handle";

const url = require('url');

export const requestListener = (conf: Config, httpHandle: HTTPHandle): RequestListener => {
    return (req: IncomingMessage, res: ServerResponse): void => {
        let body = []
        req.on('data', (chunk) => {
            body.push(chunk);
        }).on('end', () => {
            let request = new Request()
            request.params = url.parse(req.url, true).query
            Object.entries(req.headers).forEach(([k, v]) => {
                request.headers[k] = v
            })
            request.body = Buffer.concat(body).toString()
            httpHandle(conf, request, undefined).then(response => {
                response.writeResponse(res)
            })
        }).on('error', (e) => {
            httpHandle(conf, undefined, e).then(response => {
                response.writeResponse(res)
            })
        });
    }
}