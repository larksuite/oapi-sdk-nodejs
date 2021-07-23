const lark = require("@larksuiteoapi/allcore");
const fs = require("fs")

const appSettings = lark.getInternalAppSettingsByEnv()
const conf = lark.newConfig(lark.Domain.FeiShu, appSettings, {
    loggerLevel: lark.LoggerLevel.ERROR,
})

// upload image
// use stream
// let data = fs.createReadStream('./test.png');
// use byte[]
let data = fs.readFileSync('./test.png');
let formData = new lark.api.FormData()
formData.addField("image_type", "message")
formData.addFile("image", new lark.api.File().setContent(data).setType("image/jpeg"))
let req = lark.api.newRequest("image/v4/put", "POST", lark.api.AccessTokenType.Tenant, formData)
lark.api.sendRequest(conf, req).then(resp => {
    console.debug(resp.getRequestID())
    console.debug(resp.getHTTPStatusCode())
    console.debug(resp.getHeader())
    console.log(resp)
}).catch(e => {
    console.error(e)
})