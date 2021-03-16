const lark = require("@larksuiteoapi/allcore");

const appSettings = lark.core.getInternalAppSettingsByEnv()
// const conf = lark.core.newConfig("https://open.feishu.cn", appSettings, new lark.core.ConsoleLogger(), lark.core.LoggerLevel.INFO, new lark.core.DefaultStore())
const conf = lark.core.newConfig(lark.core.Domain.FeiShu, appSettings, new lark.core.ConsoleLogger(), lark.core.LoggerLevel.INFO, new lark.core.DefaultStore())

let reqCall1 = new lark.api.APIReqCall(conf, lark.api.newRequest("message/v4/send", "POST", lark.api.AccessTokenType.Tenant, {
    "user_id": "77bbc392",
    msg_type: "text",
    content: {
        text: "test"
    }
}));

let reqCall2 = new lark.api.APIReqCall(conf, lark.api.newRequest("message/v4/send", "POST", lark.api.AccessTokenType.Tenant, {
    "user_id": "77bbc392",
    msg_type: "text",
    content: {
        text: "test2"
    }
}));

let batchReqCall = new lark.api.BatchAPIReqCall(reqCall1, reqCall2);

batchReqCall.do().then(function (batchReqCall) {
    for (let result of batchReqCall.reqCallResults) {
        console.log("--------------------------")
        console.log(result.response.getRequestID())
        console.log(result.response.getHTTPStatusCode())
        console.log(result.response)
        //console.log(done.err)
    }
})

