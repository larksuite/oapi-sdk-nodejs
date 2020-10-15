import {Config, Context, Request} from "@larksuiteoapi/core";
import {HTTPCard} from "../model/card";
import {handle} from "../handlers/handlers";


export const httpHandle = async (conf: Config, request: Request, err: any) => {
    let httpCard = new HTTPCard()
    if (err) {
        httpCard.err = err
    }
    httpCard.request = request
    let ctx = new Context()
    conf.withContext(ctx)
    await handle(ctx, httpCard)
    return httpCard.response
}