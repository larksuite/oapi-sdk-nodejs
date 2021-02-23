import * as lark from "@larksuiteoapi/allcore"
// for online, use redis store access token
import {getConfig} from "../config/config";

const conf = getConfig(lark.core.Domain.FeiShu, lark.core.getInternalAppSettingsByEnv(), lark.core.LoggerLevel.DEBUG)

// for test
// const conf = lark.core.getTestInternalConf("online")

lark.api.sendRequest(conf, lark.api.newRequest("message/v4/send", "POST", lark.api.AccessTokenType.Tenant, {
    "user_id": "77bbc392",
    msg_type: "text",
    content: {
        text: "test"
    }
})).then(r => {
    console.log("--------------------------")
    console.log(r.getRequestID())
    console.log(r.getHTTPStatusCode())
    console.log(r) // r = response.body
}).catch(e => {
    console.log(e)
})