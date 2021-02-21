const lark = require("@larksuiteoapi/allcore");
const fs = require("fs")

// for test
const conf = lark.core.getTestInternalConf("online")
let queryParams = {
    image_key: "img_5ac0852d-b3f2-4dc8-9dde-c5135cabe13g"
}

let req = lark.api.newRequest("image/v4/get", "GET",
    lark.api.AccessTokenType.Tenant, undefined, lark.api.setQueryParams(queryParams), lark.api.setIsResponseStream())
lark.api.sendRequest(conf, req).then(r => {
    fs.writeFileSync("./test.0.png", r.data)
    console.debug(r.getRequestID())
    console.debug(r.getHTTPStatusCode())
}).catch(e => {
    console.error(e)
})
