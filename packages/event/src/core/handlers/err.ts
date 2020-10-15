import * as util from "util"

export class NotHandlerErr {
    eventType: string

    constructor(eventType: string) {
        this.eventType = eventType
    }

    toString(): string {
        return util.format("event type:%s, not find handler", this.eventType)
    }
}