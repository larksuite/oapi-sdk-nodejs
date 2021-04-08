const lark = require("@larksuiteoapi/allcore");
const express = require('express');
const bodyParser = require('body-parser');

const appSettings = lark.core.getInternalAppSettingsByEnv()
// const conf = lark.core.newConfig("https://open.feishu.cn", appSettings, new lark.core.ConsoleLogger(), lark.core.LoggerLevel.INFO, new lark.core.DefaultStore())
const conf = lark.core.newConfig(lark.core.Domain.FeiShu, appSettings, new lark.core.ConsoleLogger(), lark.core.LoggerLevel.INFO, new lark.core.DefaultStore())

console.log(conf)

lark.event.setTypeHandler(conf, "app_status_change", (ctx, event) => {
    let conf = lark.core.getConfigByCtx(ctx);
    console.log(conf);
    console.log("----------------");
    console.log(ctx.getRequestID());
    console.log(event);
})

lark.event.setTypeHandler(conf, "user_update", (ctx, event) => {
    let conf = lark.core.getConfigByCtx(ctx);
    console.log(conf);
    console.log("----------------");
    console.log(ctx.getHeader());
    console.log(ctx.getRequestID());
    console.log(event);
})

const app = express();

app.use(express.json())

// Start the httpserver, "Developer Console" -> "Event Subscriptions", setting Request URL：https://{domain}/webhook/event
app.post('/webhook/event', function (req, res, next) {
    console.log(req.body)
    const request = new lark.core.Request()
    Object.entries(req.headers).forEach(([k, v]) => {
        request.headers[k] = v
    })
    request.body = req.body
    lark.event.httpHandle(conf, request, undefined).then(response => {
        res.status(response.statusCode).send(response.body)
    })
})

// startup event http server by express, port: 8089
app.listen(8089, () => {
    console.log(`listening at :8089`)
})