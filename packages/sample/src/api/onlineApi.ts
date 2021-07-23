import * as lark from "@larksuiteoapi/allcore"
import {RedisStore} from "../config/config";

const appSettings = lark.getInternalAppSettingsByEnv()
const conf = lark.newConfig(lark.Domain.FeiShu, appSettings, {
    loggerLevel: lark.LoggerLevel.ERROR,
    store: new RedisStore()
})

lark.api.sendRequest(conf, lark.api.newRequest("message/v4/send", "POST", lark.api.AccessTokenType.Tenant, {
    "user_id": "77bbc392",
    msg_type: "text",
    content: {
        text: "test"
    }
})).then(resp => {
    console.log("--------------------------")
    console.log(resp.getRequestID())
    console.log(resp.getHTTPStatusCode())
    console.log(resp) // r = response.body
}).catch(e => {
    console.log(e)
})