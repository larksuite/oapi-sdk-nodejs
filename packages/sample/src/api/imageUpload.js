const lark = require("@larksuiteoapi/allcore");
const fs = require("fs")

const appSettings = lark.core.getInternalAppSettingsByEnv()
// const conf = lark.core.newConfig("https://open.feishu.cn", appSettings, new lark.core.ConsoleLogger(), lark.core.LoggerLevel.INFO, new lark.core.DefaultStore())
const conf = lark.core.newConfig(lark.core.Domain.FeiShu, appSettings, new lark.core.ConsoleLogger(), lark.core.LoggerLevel.INFO, new lark.core.DefaultStore())

// upload image
// use stream
// let data = fs.createReadStream('./test.png');
// use byte[]
let data = fs.readFileSync('./test.png');
let formData = new lark.api.FormData()
formData.addField("image_type", "message")
formData.addFile("image", new lark.api.File().setContent(data).setType("image/jpeg"))
let req = lark.api.newRequest("image/v4/put", "POST", lark.api.AccessTokenType.Tenant, formData)
lark.api.sendRequest(conf, req).then(r => {
    console.debug(r.getRequestID())
    console.debug(r.getHTTPStatusCode())
    console.log(r)
}).catch(e => {
    console.error(e)
})