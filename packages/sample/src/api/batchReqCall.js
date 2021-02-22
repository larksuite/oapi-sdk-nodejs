const OapiCore = require("@larksuiteoapi/core");
const OapiApi = require("@larksuiteoapi/api")
// for online
// import {GetConfig} from "../config/config";
// const conf = GetConfig(...)

// for test
const conf = OapiCore.getTestInternalConf("online")

// Two "OapiApi.ReqCall" cannot use the same "OapiCore.Context"
let reqCall1 = new OapiApi.ReqCall(new OapiCore.Context(), conf, OapiApi.newRequest("message/v4/send", "POST", OapiApi.AccessTokenType.Tenant, {
    "user_id": "77bbc392",
    msg_type: "text",
    content: {
        text: "test"
    }
}));

let reqCall2 = new OapiApi.ReqCall(new OapiCore.Context(), conf, OapiApi.newRequest("message/v4/send", "POST", OapiApi.AccessTokenType.Tenant, {
    "user_id": "77bbc392",
    msg_type: "text",
    content: {
        text: "test2"
    }
}));

let batchReqCall = new OapiApi.BatchReqCall(function (reqCall, err) {
    console.log("error:", reqCall.ctx.getRequestID())
    console.log("error:", reqCall.ctx.getHTTPStatusCode())
    console.log("error:", err)
}, reqCall1, reqCall2);

batchReqCall.do().then(function (batchReqCall) {
    for (let done of batchReqCall.reqCallDos) {
        console.log("--------------------------")
        console.log(done.ctx.getRequestID())
        console.log(done.ctx.getHTTPStatusCode())
        console.log(done.result)
        //console.log(done.err)
    }
})

