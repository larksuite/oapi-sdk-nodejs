import * as lark from "@larksuiteoapi/allcore";

const asyncRedis = require("async-redis");

const client = asyncRedis.createClient(6379, "127.0.0.1");

client.on("error", function (err) {
    console.log("Error " + err);
});

// use redis implement store
export class RedisStore {

    get = (key: string) => {
        return client.get(key)
    }

    put = (key: string, value: string, expire: number) => {
        return client.setex(key, expire, value)
    }

}




