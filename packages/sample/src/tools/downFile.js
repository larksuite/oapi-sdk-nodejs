const fs = require("fs")

const lark = require("@larksuiteoapi/allcore")

lark.api.downloadFile("https://s0.pstatp.com/ee/lark-open/web/static/apply.226f11cb.png", 3000).then(buf => {
    fs.writeFileSync("./test.png", buf)
})

