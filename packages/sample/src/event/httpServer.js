const lark = require("@larksuiteoapi/allcore");

const appSettings = lark.core.getInternalAppSettingsByEnv()
// const conf = lark.core.newConfig("https://open.feishu.cn", appSettings, new lark.core.ConsoleLogger(), lark.core.LoggerLevel.INFO, new lark.core.DefaultStore())
const conf = lark.core.newConfig(lark.core.Domain.FeiShu, appSettings, new lark.core.ConsoleLogger(), lark.core.LoggerLevel.INFO, new lark.core.DefaultStore())

lark.event.setTypeHandler(conf, "app_status_change", (ctx, event) => {
    let conf = lark.core.getConfigByCtx(ctx);
    console.log(conf);
    console.log("----------------");
    console.log(ctx.getRequestID());
    console.log(event);
})

// startup event http server, port: 8089
lark.event.startServer(conf, 8089)