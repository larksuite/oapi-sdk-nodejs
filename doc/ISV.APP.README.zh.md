# 使用应用商店应用调用服务端API

---

- 如何获取app_access_token，请看：[获取app_access_token](https://open.feishu.cn/document/ukTMukTMukTM/uEjNz4SM2MjLxYzM) （应用商店应用）
    - 与企业自建应用相比，应用商店应用的获取app_access_token的流程复杂一些。
        - 需要开放平台下发的app_ticket，通过订阅事件接收。SDK已经封装了app_ticket事件的处理，只需要启动事件订阅服务。
        - 使用SDK调用服务端API时，如果当前还没有收到开发平台下发的app_ticket，会报错且向开放平台申请下发app_ticket，可以尽快的收到开发平台下发的app_ticket，保证再次调用服务端API的正常。
        - 使用SDK调用服务端API时，需要使用tenant_access_token访问凭证时，需要 tenant_key ，来表示当前是哪个租户使用这个应用调用服务端API。
            - tenant_key，租户安装启用了这个应用，开放平台发送的服务端事件，事件内容中都含有tenant_key。

### 使用`应用商店应用`访问 [发送文本消息API](https://open.feishu.cn/document/ukTMukTMukTM/uUjNz4SN2MjL1YzM) 示例

- 第一步：启动启动事件订阅服务，用于接收`app_ticket`。

```javascript
const lark = require("@larksuiteoapi/allcore");

// 应用商店应用的配置
// appID、appSecret: "开发者后台" -> "凭证与基础信息" -> 应用凭证（App ID、App Secret）
// verificationToken、encryptKey："开发者后台" -> "事件订阅" -> 事件订阅（Verification Token、Encrypt Key）。
// helpDeskID、helpDeskToken, 服务台 token：https://open.feishu.cn/document/ukTMukTMukTM/ugDOyYjL4gjM24CO4IjN
const appSettings = lark.newISVAppSettings({
    appID: "App ID",
    appSecret: "App Secret",
    encryptKey: "Encrypt Key",
    verificationToken: "Verification Token",
    helpDeskID: "HelpDesk ID", // 非必需，使用服务台API时必需
    helpDeskToken: "HelpDesk Token", // 非必需，使用服务台API时必需
})

// 当前访问的是飞书，使用默认存储、默认日志（Error级别），更多可选配置，请看：README.zh.md -> 如何构建整体配置（Config）。
const conf = lark.newConfig(lark.Domain.FeiShu, appSettings, {
    loggerLevel: lark.LoggerLevel.ERROR,
    store: 需要使用分布式缓存实现, // 例如: packages/sample/src/config/config.ts 的 RedisStore
})

// 启动httpServer，"开发者后台" -> "事件订阅" 请求网址 URL：https://domain
// startup event http server, port: 8089
lark.event.startServer(conf, 8089)

```

- 第二步：调用服务端接口。

```javascript
const lark = require("@larksuiteoapi/allcore");

// 应用商店应用的配置
// appID、appSecret: "开发者后台" -> "凭证与基础信息" -> 应用凭证（App ID、App Secret）
// verificationToken、encryptKey："开发者后台" -> "事件订阅" -> 事件订阅（Verification Token、Encrypt Key）。
// helpDeskID、helpDeskToken, 服务台 token：https://open.feishu.cn/document/ukTMukTMukTM/ugDOyYjL4gjM24CO4IjN
const appSettings = lark.newISVAppSettings({
    appID: "App ID",
    appSecret: "App Secret",
    encryptKey: "Encrypt Key",
    verificationToken: "Verification Token",
    helpDeskID: "HelpDesk ID", // 非必需，使用服务台API时必需
    helpDeskToken: "HelpDesk Token", // 非必需，使用服务台API时必需
})

// 当前访问的是飞书，使用默认存储、默认日志（Error级别），更多可选配置，请看：README.zh.md -> 如何构建整体配置（Config）。
const conf = lark.newConfig(lark.Domain.FeiShu, appSettings, {
    loggerLevel: lark.LoggerLevel.ERROR,
    store: 需要使用分布式缓存实现, // 例如: packages/sample/src/config/config.ts 的 RedisStore
})

// 发送消息的内容
const body = {
    open_id: "user open id",
    msg_type: "text",
    content: {
        text: "test send message",
    },
}
// 构建请求 && 设置企业标识 Tenant key
const req = lark.api.newRequest("/open-apis/message/v4/send", "POST", lark.api.AccessTokenType.Tenant, body, lark.api.setTenantKey("Tenant key"))
// 发送请求
lark.api.sendRequest(conf, req).then(r => {
    // 打印请求的RequestID
    console.log(r.getRequestID())
    // 打印请求的响应状态吗
    console.log(r.getHTTPStatusCode())
    console.log(r) // r = response.body
}).catch(e => {
    // 请求的error处理
    console.log(e)
})
```
