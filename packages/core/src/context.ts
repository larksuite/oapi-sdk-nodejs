import {HTTPHeaderKeyRequestID, HTTPKeyStatusCode} from "./constants/constants";

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

    getRequestID(): string {
        return this.get(HTTPHeaderKeyRequestID)
    }

    getHTTPStatusCode(): number {
        return this.get(HTTPKeyStatusCode)
    }
}