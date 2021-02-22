const OapiCore = require("@larksuiteoapi/core");
const OapiApi = require("@larksuiteoapi/api")

// for test
const conf = OapiCore.getTestInternalConf("online")

OapiApi.sendRequest(conf, OapiApi.newRequest("message/v4/send", "POST", OapiApi.AccessTokenType.Tenant, {
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

