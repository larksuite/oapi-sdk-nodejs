import {Config, Context} from "@larksuite/oapi-core";
import {Card} from "./model/card";

export type Handler = (ctx: Context, card: Card) => Promise<any> | any | undefined

const appID2Handler = new Map<string, Handler>()

export const setHandler = (conf: Config, handler: Handler): void => {
    appID2Handler.set(conf.getAppSettings().appID, handler)
}

export const getHandler = (conf: Config): Handler => {
    return appID2Handler.get(conf.getAppSettings().appID)
}