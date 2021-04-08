import {HTTPHeaderKey, HTTPHeaderKeyLogID, HTTPHeaderKeyRequestID, HTTPKeyStatusCode} from "./constants/constants";

export class Context {

    private m: Map<string, any>

    constructor() {
        this.m = new Map<string, any>()
    }

    get(key: string): any {
        return this.m.get(key)
    }

    set(key: string, value: any): void {
        this.m.set(key, value)
    }

    getHeader(): { [key: string]: any } {
        return this.m.get(HTTPHeaderKey)
    }

    getRequestID(): string {
        let header = this.getHeader()
        let logID = header[HTTPHeaderKeyLogID.toLowerCase()]
        if (logID) {
            return logID
        }
        return header[HTTPHeaderKeyRequestID.toLowerCase()]
    }

    getHTTPStatusCode(): number {
        return this.get(HTTPKeyStatusCode)
    }
}