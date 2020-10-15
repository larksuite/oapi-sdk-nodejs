import {Config, Context} from "@larksuiteoapi/core";
import {V1, V2} from "./core/model/event";

export type Handler = (ctx: Context, event: V1<any> | V2<any>) => Promise<void> | void


export class EventType2Handler {
    m: Map<string, Handler>

    constructor() {
        this.m = new Map<string, Handler>()
    }
}

const appID2EventType2Handler = new Map<string, EventType2Handler>()


export const setTypeHandler = (conf: Config, eventType: string, handler: Handler) => {
    let appID = conf.getAppSettings().appID
    let eventType2Handler = appID2EventType2Handler.get(appID)
    if (!eventType2Handler) {
        eventType2Handler = new EventType2Handler()
        appID2EventType2Handler.set(appID, eventType2Handler)
    }
    eventType2Handler.m.set(eventType, handler)
}

export const getEventType2Handler = (conf: Config): EventType2Handler => {
    return appID2EventType2Handler.get(conf.getAppSettings().appID)
}