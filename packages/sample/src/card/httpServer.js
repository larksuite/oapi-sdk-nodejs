const OapiCore = require("@larksuite/oapi-core");
const OapiCard = require("@larksuite/oapi-card")
import {GetConfig} from "../config/config";

const conf = GetConfig(...)

// set handler
OapiCard.setHandler(conf, (ctx, card) => {
    let conf = OapiCore.getConfigByCtx(ctx);
    console.log(conf);
    console.log("----------------");
    console.log(ctx.getRequestID());
    console.log(card)
    return {
        "test": "1"
    }
})

// startup card http server by express, port: 8089
OapiCard.startServer(conf, 8089)