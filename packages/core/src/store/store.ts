export interface Store {
    get(key: string): Promise<string> | string

    put(key: string, value: string, expire: number): Promise<void> | void

}

class V {
    value: string
    expireTime: Date

    constructor(value: string, expire: number) {
        this.value = value
        this.expireTime = new Date(new Date().getTime() + expire)
    }
}


export class DefaultStore implements Store {
    private data: Map<string, V>

    constructor() {
        this.data = new Map<string, V>()
    }

    get = (key: string) => {
        let v = this.data.get(key)
        if (!v) {
            return ""
        }
        let now = new Date().getTime()
        if (v.expireTime.getTime() < now) {
            return ""
        }
        return v.value
    }

    put = (key: string, value: string, expire: number) => {
        let v = new V(value, expire)
        this.data.set(key, v)
        console.debug("store put", key, v)
    }
}

