const lark = require("@larksuiteoapi/allcore");

const appSettings = lark.getInternalAppSettingsByEnv()
const conf = lark.newConfig(lark.Domain.FeiShu, appSettings, {
    loggerLevel: lark.LoggerLevel.ERROR,
})

lark.event.setTypeHandler(conf, "user_update", (ctx, event) => {
    let conf = lark.core.getConfigByCtx(ctx);
    console.log(conf);
    console.log("----------------");
    console.log(ctx.getHeader());
    console.log(ctx.getRequestID());
    console.log(event);
})

// startup event http server, port: 8089
lark.event.startServer(conf, 8089)