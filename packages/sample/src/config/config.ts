import * as lark from "@larksuiteoapi/allcore";

const asyncRedis = require("async-redis");

// get application config
export const getConfig = (domain: lark.core.Domain, appSetting: lark.core.AppSettings, logLevel: lark.core.LoggerLevel): lark.core.Config => {
    let logger = new lark.core.ConsoleLogger()
    let store = new RedisStore()
    return lark.core.newConfig(domain, appSetting, logger, logLevel, store)
}

const client = asyncRedis.createClient(6379, "127.0.0.1");
client.on("error", function (err) {
    console.log("Error " + err);
});

// use redis implement store
class RedisStore {

    get = (key: string) => {
        return client.get(key)
    }

    put = (key: string, value: string, expire: number) => {
        return client.setex(key, expire, value)
    }

}




