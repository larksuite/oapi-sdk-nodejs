const fs = require("fs")

const OapiApi = require("@larksuiteoapi/api")

OapiApi.downloadFile("https://s0.pstatp.com/ee/lark-open/web/static/apply.226f11cb.png", 3000).then(buf => {
    fs.writeFileSync("./test.png", buf)
})

