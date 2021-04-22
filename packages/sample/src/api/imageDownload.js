const lark = require("@larksuiteoapi/allcore");
const fs = require("fs")

const appSettings = lark.core.getInternalAppSettingsByEnv()
// const conf = lark.core.newConfig("https://open.feishu.cn", appSettings, new lark.core.ConsoleLogger(), lark.core.LoggerLevel.INFO, new lark.core.DefaultStore())
const conf = lark.core.newConfig(lark.core.Domain.FeiShu, appSettings, new lark.core.ConsoleLogger(), lark.core.LoggerLevel.INFO, new lark.core.DefaultStore())

let queryParams = {
    image_key: "img_5ac0852d-b3f2-4dc8-9dde-c5135cabe13g"
}

let req = lark.api.newRequest("image/v4/get", "GET",  lark.api.AccessTokenType.Tenant, undefined)
req.setQueryParams(queryParams)
req.setIsResponseStream()
lark.api.sendRequest(conf, req).then(resp => {
    fs.writeFileSync("./test.0.png", resp.data)
    console.debug(resp.getRequestID())
    console.debug(resp.getHTTPStatusCode())
    console.debug(resp.getHeader())
}).catch(e => {
    console.error(e)
})


let req2 = lark.api.newRequest("image/v4/get", "GET",  lark.api.AccessTokenType.Tenant, undefined)
req2.setQueryParams(queryParams)
req2.setResponseStream(fs.createWriteStream("./test.1.png"))
lark.api.sendRequest(conf, req2).then(resp => {
    console.debug(resp.getRequestID())
    console.debug(resp.getHTTPStatusCode())
    console.debug(resp.getHeader())
}).catch(e => {
    console.error(e)
})
