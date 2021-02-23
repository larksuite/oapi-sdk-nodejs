const lark = require("@larksuiteoapi/allcore");
// for online
// import {GetConfig} from "../config/config";
// const conf = GetConfig(...)

// for test
const conf = lark.core.getTestISVConf("staging")

lark.event.setTypeHandler(conf, "app_status_change", (ctx, event) => {
    let conf = lark.core.getConfigByCtx(ctx);
    console.log(conf);
    console.log("----------------");
    console.log(ctx.getRequestID());
    console.log(event);
})

// startup event http server, port: 8089
lark.event.startServer(conf, 8089)