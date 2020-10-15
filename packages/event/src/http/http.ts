import {HTTPEvent} from "../core/model/event";
import {handle} from "../core/handlers/handlers";
import * as AppTicketEvent from "../app/v1/appTicket";
import {Config, Context, Request} from "@larksuiteoapi/core";


export const httpHandle = async (conf: Config, request: Request, err: any) => {
    AppTicketEvent.setHandler(conf)
    let httpEvent = new HTTPEvent()
    if (err) {
        httpEvent.err = err
    }
    httpEvent.request = request
    let ctx = new Context()
    conf.withContext(ctx)
    await handle(ctx, httpEvent)
    return httpEvent.response
}