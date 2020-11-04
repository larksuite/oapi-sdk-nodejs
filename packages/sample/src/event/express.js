const OapiCore = require("@larksuiteoapi/core");
const OapiEvent = require("@larksuiteoapi/event")
const express = require('express');
const bodyParser = require('body-parser');
// for online
// import {GetConfig} from "../config/config";
// const conf = GetConfig(...)

// for test
const conf = OapiCore.getTestISVConf("staging")

console.log(conf)

OapiEvent.setTypeHandler(conf, "app_status_change", (ctx, event) => {
    let conf = OapiCore.getConfigByCtx(ctx);
    console.log(conf);
    console.log("----------------");
    console.log(ctx.getRequestID());
    console.log(event);
})

OapiEvent.setTypeHandler(conf, "user.created_v2", (ctx, event) => {
    let conf = OapiCore.getConfigByCtx(ctx);
    console.log(conf);
    console.log("----------------");
    console.log(ctx.getRequestID());
    console.log(event);
})

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

// startup event http server by express, port: 8089
app.listen(8089, () => {
    console.log(`listening at :8089`)
})