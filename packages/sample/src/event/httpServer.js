const OapiCore = require("@larksuiteoapi/core");
const OapiEvent = require("@larksuiteoapi/event")
// for online
// import {GetConfig} from "../config/config";
// const conf = GetConfig(...)

// for test
const conf = OapiCore.getTestInternalConf("online")

OapiEvent.setTypeHandler(conf, "app_status_change", (ctx, event) => {
    let conf = OapiCore.getConfigByCtx(ctx);
    console.log(conf);
    console.log("----------------");
    console.log(ctx.getRequestID());
    console.log(event);
})

// startup event http server, port: 8089
OapiEvent.startServer(conf, 8089)