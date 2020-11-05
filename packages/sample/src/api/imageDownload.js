const OapiCore = require("@larksuiteoapi/core");
const OapiApi = require("@larksuiteoapi/api")
const fs = require("fs")
// for online
// import {GetConfig} from "../config/config";
// const conf = GetConfig(...)

// for test
const conf = OapiCore.getTestInternalConf("online")
let queryParams = {
    image_key: "img_xxxxxxxxxxxxxxxxxxxxx"
}
let req = OapiApi.newRequest("image/v4/get", "GET",
    OapiApi.AccessTokenType.Tenant, undefined, OapiApi.setQueryParams(queryParams), OapiApi.setIsResponseStream())
let ctx = new OapiCore.Context()
OapiApi.send(ctx, conf, req).then(buf => {
    fs.writeFileSync("./test.0.png", buf)
    console.debug(ctx.getRequestID())
    console.debug(ctx.getHTTPStatusCode())
}).catch(e => {
    console.error(ctx.getRequestID())
    console.error(ctx.getHTTPStatusCode())
    console.error(e.code)
    console.error(e.msg)
    console.error(e)
})
