const OapiCore = require("@larksuiteoapi/core");
const OapiApi = require("@larksuiteoapi/api")
// for online
// import {GetConfig} from "../config/config";
// const conf = GetConfig(...)

// for test
const conf = OapiCore.getTestInternalConf("online")

// Two "OapiApi.ReqCall" cannot use the same "OapiCore.Context"
let reqCall1 = new OapiApi.APIReqCall(conf, OapiApi.newRequest("message/v4/send", "POST", OapiApi.AccessTokenType.Tenant, {
    "user_id": "77bbc392",
    msg_type: "text",
    content: {
        text: "test"
    }
}));

let reqCall2 = new OapiApi.APIReqCall(conf, OapiApi.newRequest("message/v4/send", "POST", OapiApi.AccessTokenType.Tenant, {
    "user_id": "77bbc392",
    msg_type: "text",
    content: {
        text: "test2"
    }
}));

let batchReqCall = new OapiApi.BatchAPIReqCall(reqCall1, reqCall2);

batchReqCall.do().then(function (batchReqCall) {
    for (let result of batchReqCall.reqCallResults) {
        console.log("--------------------------")
        console.log(result.response.getRequestID())
        console.log(result.response.getHTTPStatusCode())
        console.log(result.response)
        //console.log(done.err)
    }
})

