const OapiCore = require("@larksuiteoapi/core");
const OapiApi = require("@larksuiteoapi/api")
const fs = require("fs")
// for online
// import {GetConfig} from "../config/config";
// const conf = GetConfig(...)

// for test
const conf = OapiCore.getTestInternalConf("online")
let queryParams = {
    image_key: "img_c1dc601a-9af7-4f03-95d3-00e84d5f5deg"
}

let req = OapiApi.newRequest("image/v4/get", "GET",
    OapiApi.AccessTokenType.Tenant, undefined, OapiApi.setQueryParams(queryParams), OapiApi.setIsResponseStream())
OapiApi.sendRequest(conf, req).then(r => {
    fs.writeFileSync("./test.0.png", r.data)
    console.debug(r.getRequestID())
    console.debug(r.getHTTPStatusCode())
}).catch(e => {
    console.error(e)
})
