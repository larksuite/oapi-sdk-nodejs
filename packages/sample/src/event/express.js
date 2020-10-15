const OapiCore = require("@larksuite/oapi-core");
const OapiEvent = require("@larksuite/oapi-event")
const express = require('express');
const bodyParser = require('body-parser');
import {GetConfig} from "../config/config";

const conf = GetConfig(...)

OapiEvent.setTypeHandler(conf, "app_status_change", (ctx, event) => {
    let conf = OapiCore.getConfigByCtx(ctx);
    console.log(conf);
    console.log("----------------");
    console.log(ctx.getRequestID());
    console.log(event);
})

// startup event http server by express, port: 8080
const app = express();

app.use(bodyParser());

app.post('/webhook/event', (req, res) => {
    const request = new OapiCore.Request()
    Object.entries(req.headers).forEach(([k, v]) => {
        request.headers[k] = v
    })
    request.body = req.body
    OapiEvent.httpHandle(conf, request, undefined).then(response => {
        res.status(response.statusCode).send(response.body)
    })
});

app.listen(8089, () => {
    console.log(`listening at :8089`)
})