import * as util from "util"

export class NotFoundHandlerErr {
    eventType: string

    constructor(eventType: string) {
        this.eventType = eventType
    }

    toString(): string {
        return util.format("event type:%s, not found handler", this.eventType)
    }
}