import {HTTPHeaderKeyRequestID, HTTPKeyStatusCode} from "./constants/constants";

export class Context {

    private m: Map<string, any>

    constructor() {
        this.m = new Map<string, any>()
    }

    get(key: string): any {
        return this.m.get(key)
    }

    setRequestID(logID: string, requestID: string): void {
        if (logID) {
            this.set(HTTPHeaderKeyRequestID, logID)
            return
        }
        this.set(HTTPHeaderKeyRequestID, requestID)
    }

    set(key: string, value: any): void {
        this.m.set(key, value)
    }

    getRequestID(): string {
        return this.get(HTTPHeaderKeyRequestID)
    }

    getHTTPStatusCode(): number {
        return this.get(HTTPKeyStatusCode)
    }
}