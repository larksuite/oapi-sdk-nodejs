const lark = require("@larksuiteoapi/allcore");
const fs = require("fs")

const appSettings = lark.getInternalAppSettingsByEnv()
const conf = lark.newConfig(lark.Domain.FeiShu, appSettings, {
    loggerLevel: lark.LoggerLevel.ERROR,
})

let queryParams = {
    image_key: "img_v2_332fc963-94f6-4147-ba3a-c8f5f745d6fg"
}

let req = lark.api.newRequest("image/v4/get", "GET",  lark.api.AccessTokenType.Tenant, undefined)
req.setQueryParams(queryParams)
req.setIsResponseStream()
lark.api.sendRequest(conf, req).then(resp => {
    fs.writeFileSync("./test.0.png", resp.data)
    console.log(resp.getRequestID())
    console.log(resp.getHTTPStatusCode())
    console.log(resp.getHeader())
}).catch(e => {
    console.error(e)
})


let req2 = lark.api.newRequest("image/v4/get", "GET",  lark.api.AccessTokenType.Tenant, undefined)
req2.setQueryParams(queryParams)
req2.setResponseStream(fs.createWriteStream("./test.1.png"))
lark.api.sendRequest(conf, req2).then(resp => {
    console.log(resp.getRequestID())
    console.log(resp.getHTTPStatusCode())
    console.log(resp.getHeader())
}).catch(e => {
    console.error(e)
})
