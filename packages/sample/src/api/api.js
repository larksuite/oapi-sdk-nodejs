const OapiCore = require("@larksuiteoapi/core");
const OapiApi = require("@larksuiteoapi/api")

// for test
const conf = OapiCore.getTestInternalConf("online")

OapiApi.sendRequest(conf, OapiApi.newRequest("message/v4/send1", "POST", OapiApi.AccessTokenType.Tenant, {
    "user_id": "77bbc392",
    msg_type: "text",
    content: {
        text: "test"
    }
})).then(r => {
    console.log("--------------------------")
    console.log(r.getRequestID())
    console.log(r.getHTTPStatusCode())
    console.log(r)
}).catch(e => {
    console.log(e)
})

