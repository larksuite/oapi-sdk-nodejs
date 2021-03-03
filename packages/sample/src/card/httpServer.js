const lark = require("@larksuiteoapi/allcore");

// for test
const conf = lark.core.getTestInternalConf("online")

// set handler
lark.card.setHandler(conf, (ctx, card) => {
    let conf = lark.core.getConfigByCtx(ctx);
    console.log(conf);
    console.log(card.action)
    return "{\"config\":{\"wide_screen_mode\":true},\"i18n_elements\":{\"zh_cn\":[{\"tag\":\"div\",\"text\":{\"tag\":\"lark_md\",\"content\":\"[飞书](https://www.feishu.cn)整合即时沟通、日历、音视频会议、云文档、云盘、工作台等功能于一体，成就组织和个人，更高效、更愉悦。\"}}]}}";
})

// startup card http server by express, port: 8089
lark.card.startServer(conf, 8089)