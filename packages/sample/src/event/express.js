const lark = require("@larksuiteoapi/allcore");
const express = require('express');

const appSettings = lark.getInternalAppSettingsByEnv()
const conf = lark.newConfig(lark.Domain.FeiShu, appSettings, {
    loggerLevel: lark.LoggerLevel.ERROR,
})

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