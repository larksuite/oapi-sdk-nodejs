const lark = require("@larksuiteoapi/allcore");
const express = require('express');

const appSettings = lark.getInternalAppSettingsByEnv()
const conf = lark.newConfig(lark.Domain.FeiShu, appSettings, {
    loggerLevel: lark.LoggerLevel.ERROR,
})

// set handler
lark.card.setHandler(conf, (ctx, card) => {
    let conf = lark.core.getConfigByCtx(ctx);
    console.log(conf);
    console.log("----------------");
    console.log(ctx.getHeader());
    console.log(ctx.getRequestID());
    console.log(card)
    return "{\"config\":{\"wide_screen_mode\":true},\"i18n_elements\":{\"zh_cn\":[{\"tag\":\"div\",\"text\":{\"tag\":\"lark_md\",\"content\":\"[飞书](https://www.feishu.cn)整合即时沟通、日历、音视频会议、云文档、云盘、工作台等功能于一体，成就组织和个人，更高效、更愉悦。\"}}]}}";
})

const app = express();
app.use(express.json())

// Start the httpserver, "Developer Console" -> "Features" -> "Bot", setting Message Card Request URL: https://domain/webhook/card
app.post('/webhook/card', (req, res) => {
    const request = new lark.core.Request()
    Object.entries(req.headers).forEach(([k, v]) => {
        request.headers[k] = v
    })
    request.body = req.body
    lark.card.httpHandle(conf, request, undefined).then(response => {
        console.log("=================\n", response.body);
        res.status(response.statusCode).send(response.body)
    })
});

// startup event http server, port: 8089
app.listen(8089, () => {
    console.log(`listening at :8089`)
})