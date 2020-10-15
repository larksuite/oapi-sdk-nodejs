import {setTypeHandler} from "../../event";
import {AppType, Config, Context, getAppTicketKey, getConfigByCtx} from "@larksuite/oapi-core";
import {BaseEvent, V1} from "../../core/model/event";

const EventType = "app_ticket"

interface EventData extends BaseEvent {
    app_ticket: string
}

interface Event extends V1<EventData> {
}

export const setHandler = (conf: Config) => {
    setTypeHandler(conf, EventType, (ctx: Context, event: Event) => {
        let conf = getConfigByCtx(ctx)
        if (conf.getAppSettings().appType == AppType.Internal) {
            return
        }
        return conf.getStore().put(getAppTicketKey(event.event.app_id), event.event.app_ticket, 24 * 3600)
    })
}




