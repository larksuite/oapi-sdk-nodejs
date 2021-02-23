const lark = require("@larksuiteoapi/allcore");
const fs = require("fs")

// for test
const conf = lark.core.getTestInternalConf("online")

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