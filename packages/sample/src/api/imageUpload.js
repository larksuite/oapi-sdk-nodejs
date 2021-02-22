const OapiCore = require("@larksuiteoapi/core");
const OapiApi = require("@larksuiteoapi/api")
const fs = require("fs")
// for online
// import {GetConfig} from "../config/config";
// const conf = GetConfig(...)

// for test
const conf = OapiCore.getTestInternalConf("online")

// upload image
// use stream
// let data = fs.createReadStream('./test.png');
// use byte[]
let data = fs.readFileSync('./test.png');
let formData = new OapiApi.FormData()
formData.setField("image_type", "message")
formData.appendFile(new OapiApi.File().setContent(data).setFieldName("image").setType("image/jpeg"))
let req = OapiApi.newRequest("image/v4/put", "POST", OapiApi.AccessTokenType.Tenant, formData)
OapiApi.sendRequest(conf, req).then(r => {
    console.debug(r.getRequestID())
    console.debug(r.getHTTPStatusCode())
    console.log(r)
}).catch(e => {
    console.error(e)
})