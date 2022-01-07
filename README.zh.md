[**README of Larksuite(Overseas)**](README.md) | 飞书

# 飞书开放接口SDK

## 概述

---

- 飞书开放平台，便于企业应用与飞书集成，让协同与管理更加高效，[概述](https://open.feishu.cn/document/uQjL04CN/ucDOz4yN4MjL3gzM)

- 飞书开发接口SDK，便捷调用服务端API与订阅服务端事件，例如：消息&群组、通讯录、日历、视频会议、云文档、 OKR等具体可以访问 [飞书开放平台文档](https://open.feishu.cn/document/) 看看【服务端
  API】。
  
## 问题反馈

如有任何SDK使用相关问题，请提交 [Github Issues](https://github.com/larksuite/oapi-sdk-nodejs/issues), 我们会在收到 Issues 的第一时间处理，并尽快给您答复。

## 安装方法

```shell script
  npm i @larksuiteoapi/allcore@1.0.13
```

## 术语解释

- 飞书（FeiShu）：Lark在中国的称呼，主要为国内的企业提供服务，拥有独立的[域名地址](https://www.feishu.cn)。
- LarkSuite：Lark在海外的称呼，主要为海外的企业提供服务，拥有独立的[域名地址](https://www.larksuite.com/) 。
- 开发文档：开放平台的开放接口的参考，**开发者必看，可以使用搜索功能，高效的查询文档**。[更多介绍说明](https://open.feishu.cn/document/) 。
- 开发者后台：开发者开发应用的管理后台，[更多介绍说明](https://open.feishu.cn/app/) 。
- 企业自建应用：应用仅仅可在本企业内安装使用，[更多介绍说明](https://open.feishu.cn/document/uQjL04CN/ukzM04SOzQjL5MDN) 。
- 应用商店应用：应用会在 [应用目录](https://app.feishu.cn/?lang=zh-CN)
  展示，各个企业可以选择安装，[更多介绍说明](https://open.feishu.cn/document/uQjL04CN/ugTO5UjL4kTO14CO5kTN) 。

![App type](doc/app_type.zh.png)

## 快速使用

---

### 调用服务端API

- **必看** [如何调用服务端API](https://open.feishu.cn/document/ukTMukTMukTM/uYTM5UjL2ETO14iNxkTN/guide-to-use-server-api)
  ，了解调用服务端API的过程及注意事项。
    -
    由于SDK已经封装了app_access_token、tenant_access_token的获取，所以在调业务API的时候，不需要去获取app_access_token、tenant_access_token。如果业务接口需要使用user_access_token，需要进行设置（lark.api.setUserAccessToken("
    UserAccessToken")），具体请看 README.zh.md -> 如何构建请求（Request）

- 更多使用示例，请看[packages/sample/src/api](packages/sample/src/api)

#### [使用`应用商店应用`调用 服务端API 示例](doc/ISV.APP.README.zh.md)

#### 使用`企业自建应用`访问 修改用户部分信息API 示例

```javascript
// import * as lark from "@larksuiteoapi/allcore";  // typescript
const lark = require("@larksuiteoapi/allcore");

// 企业自建应用的配置
// appID、appSecret: "开发者后台" -> "凭证与基础信息" -> 应用凭证（App ID、App Secret）
// verificationToken、encryptKey："开发者后台" -> "事件订阅" -> 事件订阅（Verification Token、Encrypt Key）。
// helpDeskID、helpDeskToken, 服务台 token：https://open.feishu.cn/document/ukTMukTMukTM/ugDOyYjL4gjM24CO4IjN
const appSettings = lark.newInternalAppSettings({
    appID: "App ID",
    appSecret: "App Secret",
    encryptKey: "Encrypt Key", // 非必需，订阅事件时必需
    verificationToken: "Verification Token", // 非必需，订阅事件、消息卡片时必需
    helpDeskID: "HelpDesk ID", // 非必需，使用服务台API时必需
    helpDeskToken: "HelpDesk Token", // 非必需，使用服务台API时必需
})

// 当前访问的是飞书，使用默认本地内存存储、默认控制台日志输出（Error级别），更多可选配置，请看：README.zh.md -> 如何构建整体配置（Config）。
const conf = lark.newConfig(lark.Domain.FeiShu, appSettings, {
    loggerLevel: lark.LoggerLevel.ERROR,
})

// 发送消息的内容
const body = {
    open_id: "user open id",
    msg_type: "text",
    content: {
        text: "test send message",
    },
}
// 构建请求
const req = lark.api.newRequest("/open-apis/message/v4/send", "POST", lark.api.AccessTokenType.Tenant, body)
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

### 订阅服务端事件

- [订阅事件概述](https://open.feishu.cn/document/ukTMukTMukTM/uUTNz4SN1MjL1UzM) ，了解订阅事件的过程及注意事项。
- 更多使用示例，请看[packages/sample/src/event](packages/sample/src/event)（含：结合express的使用）

#### 使用`企业自建应用` 订阅 [首次启用应用事件](https://open.feishu.cn/document/ukTMukTMukTM/uQTNxYjL0UTM24CN1EjN) 示例

```javascript
// import * as lark from "@larksuiteoapi/allcore";  // typescript
const lark = require("@larksuiteoapi/allcore");

// 企业自建应用的配置
// appID、appSecret: "开发者后台" -> "凭证与基础信息" -> 应用凭证（App ID、App Secret）
// verificationToken、encryptKey："开发者后台" -> "事件订阅" -> 事件订阅（Verification Token、Encrypt Key）。
const appSettings = lark.newInternalAppSettings({
    appID: "App ID",
    appSecret: "App Secret",
    encryptKey: "Encrypt Key",
    verificationToken: "Verification Token",
})

// 当前访问的是飞书，使用默认本地内存存储、默认控制台日志输出（Error级别），更多可选配置，请看：README.zh.md -> 如何构建整体配置（Config）。
const conf = lark.newConfig(lark.Domain.FeiShu, appSettings, {
    loggerLevel: lark.LoggerLevel.ERROR,
})

// 设置 首次启用应用 事件的处理者
lark.event.setTypeHandler(conf, "app_open", (ctx, event) => {
    // 打印请求的Request ID
    console.log(ctx.getRequestID());
    // 打印事件
    console.log(event);
})

// 启动httpServer，"开发者后台" -> "事件订阅" 请求网址 URL：https://domain
// startup event http server, port: 8089
lark.event.startServer(conf, 8089)

```

### 处理消息卡片回调

- [消息卡片开发流程](https://open.feishu.cn/document/ukTMukTMukTM/uAzMxEjLwMTMx4CMzETM) ，了解订阅事件的过程及注意事项
- 更多使用示例，请看[packages/sample/src/card](packages/sample/src/card)（含：结合express的使用）

#### 使用`企业自建应用`处理消息卡片回调示例

```javascript
// import * as lark from "@larksuiteoapi/allcore";  // typescript
const lark = require("@larksuiteoapi/allcore");

// 企业自建应用的配置
// appID、appSecret: "开发者后台" -> "凭证与基础信息" -> 应用凭证（App ID、App Secret）
// verificationToken、encryptKey："开发者后台" -> "事件订阅" -> 事件订阅（Verification Token、Encrypt Key）。
const appSettings = lark.newInternalAppSettings({
    appID: "App ID",
    appSecret: "App Secret",
    encryptKey: "Encrypt Key", // 非必需，订阅事件时必需
    verificationToken: "Verification Token",
})

// 当前访问的是飞书，使用默认本地内存存储、默认控制台日志输出（Error级别），更多可选配置，请看：README.zh.md -> 如何构建整体配置（Config）。
const conf = lark.newConfig(lark.Domain.FeiShu, appSettings, {
    loggerLevel: lark.LoggerLevel.ERROR,
})

// 设置 消息卡片 的处理者
// 返回值：可以为""、新的消息卡片的Json字符串 
lark.card.setHandler(conf, (ctx, card) => {
    // 打印消息卡片
    console.log(card)
    console.log(card.action)
    return "{\"config\":{\"wide_screen_mode\":true},\"i18n_elements\":{\"zh_cn\":[{\"tag\":\"div\",\"text\":{\"tag\":\"lark_md\",\"content\":\"[飞书](https://www.feishu.cn)整合即时沟通、日历、音视频会议、云文档、云盘、工作台等功能于一体，成就组织和个人，更高效、更愉悦。\"}}]}}";
})

// 设置 "开发者后台" -> "应用功能" -> "机器人" 消息卡片请求网址：https://domain
// startup event http server, port: 8089
lark.event.startServer(conf, 8089)
```

## 如何构建应用配置（AppSettings）

```javascript
// import * as lark from "@larksuiteoapi/allcore";  // typescript
const lark = require("@larksuiteoapi/allcore");

// 防止应用信息泄漏，配置环境变量中，变量（4个）说明：
// APP_ID："开发者后台" -> "凭证与基础信息" -> 应用凭证 App ID
// APP_SECRET："开发者后台" -> "凭证与基础信息" -> 应用凭证 App Secret
// VERIFICATION_TOKEN："开发者后台" -> "事件订阅" -> 事件订阅 Verification Token
// ENCRYPT_KEY："开发者后台" -> "事件订阅" -> 事件订阅 Encrypt Key
// HELP_DESK_ID: 服务台设置中心 -> ID
// HELP_DESK_TOKEN: 服务台设置中心 -> 令牌
// 企业自建应用的配置，通过环境变量获取应用配置
const appSettings = lark.getInternalAppSettingsByEnv()
// 应用商店应用的配置，通过环境变量获取应用配置
const appSettings = lark.getISVAppSettingsByEnv()


// 参数说明：
// appID、appSecret: "开发者后台" -> "凭证与基础信息" -> 应用凭证（App ID、App Secret）
// verificationToken、encryptKey："开发者后台" -> "事件订阅" -> 事件订阅（Verification Token、Encrypt Key）
// helpDeskID、helpDeskToken：服务台设置中心 -> ID、令牌, 服务台 token：https://open.feishu.cn/document/ukTMukTMukTM/ugDOyYjL4gjM24CO4IjN
// 企业自建应用的配置
const appSettings = lark.newInternalAppSettings({
    appID: "App ID",
    appSecret: "App Secret",
    encryptKey: "Encrypt Key", // 非必需，订阅事件时必需
    verificationToken: "Verification Token", // 非必需，订阅事件、消息卡片时必需
    helpDeskID: "HelpDesk ID", // 非必需，使用服务台API时必需
    helpDeskToken: "HelpDesk Token", // 非必需，使用服务台API时必需
})
// 应用商店应用的配置
const appSettings = lark.newISVAppSettings({
    appID: "App ID",
    appSecret: "App Secret",
    encryptKey: "Encrypt Key", // 非必需，订阅事件时必需
    verificationToken: "Verification Token", // 非必需，订阅事件、消息卡片时必需
    helpDeskID: "HelpDesk ID", // 非必需，使用服务台API时必需
    helpDeskToken: "HelpDesk Token", // 非必需，使用服务台API时必需
})

```

## 如何构建整体配置（Config）

- 访问 飞书、LarkSuite 或者 其他URL域名
- 应用的配置
- 日志接口（Logger）的实现，用于输出SDK处理过程中产生的日志，便于排查问题。
    - 可以使用业务系统的日志实现，请看示例代码：[packages/core/src/log/log.ts](packages/core/src/log/log.ts) ConsoleLogger
- 存储接口（Store）的实现，用于保存访问凭证（app/tenant_access_token）、临时凭证(app_ticket）
    - 推荐使用Redis实现，请看示例代码：[sample/config/redis_store.go](packages/sample/src/config/config.ts) RedisStore
        - 减少获取 访问凭证 的次数，防止调用访问凭证 接口被限频。
        - 应用商品应用，接受开放平台下发的app_ticket，会保存到存储中，所以存储接口（Store）的实现的实现需要支持分布式存储。

```javascript
// import * as lark from "@larksuiteoapi/allcore";  // typescript
const lark = require("@larksuiteoapi/allcore");

// 推荐使用Redis实现存储接口（Store），减少访问获取AccessToken接口的次数
// 参数说明：
// domain：URL域名地址，值范围：lark.Domain.FeiShu / lark.Domain.LarkSuite / 其他URL域名地址
// appSettings：应用配置
// opts: 配置选项
    // opts.logger: [日志接口](core/log/log.go)，默认：lark.ConsoleLogger
    // opts.loggerLevel: 日志级别，默认：错误级别（lark.LoggerLevel.ERROR）
    // opts.store: [存储接口](core/store/store.go)，用来存储 app_ticket/app_access_token/tenant_access_token。默认：lark.DefaultStore
lark.newConfig(domain: Domain, appSettings: AppSettings, opts: ConfigOpts): Config

// 例如：
const conf = lark.newConfig(lark.Domain.FeiShu, appSettings, {
    loggerLevel: lark.LoggerLevel.ERROR,
    logger: new lark.ConsoleLogger(),
    store: new lark.DefaultStore(),
})

```    

## 如何构建请求（Request）

- 更多使用示例，请看：[packages/sample/src/api](packages/sample/src/api)（含：文件的上传与下载）

```javascript
// import * as lark from "@larksuiteoapi/allcore";  // typescript
const lark = require("@larksuiteoapi/allcore");

// 创建请求
// httpPath：API路径
    // 例如：https://domain/open-apis/contact/v3/users/:user_id
    // 支持：域名之后的路径，则 httpPath："/open-apis/contact/v3/users/:user_id"（推荐）
    // 支持：全路径，则 httpPath："https://domain/open-apis/contact/v3/users/:user_id"
    // 支持：/open-apis/ 之后的路径，则 httpPath："contact/v3/users/:user_id"
// accessTokenType：API使用哪种token访问，取值范围：lark.api.AccessTokenType.App/Tenant/User，例如：lark.api.AccessTokenType.Tenant
// input：请求体（可能是lark.api.FormData()（例如：文件上传））,如果不需要请求体（例如一些GET请求），则传：undefined
const req = lark.api.newRequest(httpPath:string, httpMethod:string, accessTokenType:AccessTokenType, input:any)

// Request 的方法，SDK版本要求：1.0.9及以上

setPathParams(pathParams:{[key:string]:any}) // 设置URL Path参数（有:前缀）值
// 使用示例:
req.setPathParams({"user_id": 4}) // 当 httpPath = "/open-apis/contact/v3/users/:user_id" 时，请求的URL="https://{domain}/open-apis/contact/v3/users/4"


setQueryParams(queryParams:{[key:string]:any}) // 设置 URL qeury
// 使用示例:
req.setQueryParams({"age": 4, "types": [1, 2]}) // 会在url追加?age=4&types=1&types=2


setTenantKey(tenantKey:string) // 以`应用商店应用`身份，表示使用`tenant_access_token`访问API，需要设置
// 使用示例:
req.setTenantKey("68daYsd") // 设置TenantKey 为 "68daYsd"


setUserAccessToken(userAccessToken:string) // 表示使用`user_access_token`访问API，需要设置
// 使用示例:
req.setUserAccessToken("u-7f1bcd13fc57d46bac21793a18e560") // 设置 User access token 为 "u-7f1bcd13fc57d46bac21793a18e560"


setTimeoutOfMs(timeoutOfMs:number) // 设置http请求，超时时间毫秒值
// 使用示例:
req.setTimeoutOfMs(5000) // 设置请求超时时间为 5000 毫秒


setIsResponseStream() // 设置响应体的是否是流，例如下载文件，这时：output值是Buffer类型
// 使用示例:
req.setIsResponseStream() // 设置响应体是流


setResponseStream(responseStream:stream.Writable) // 设置响应体的是否是流，例如下载文件，这时会把响应流写入 responseStream 
// 使用示例:
req.setResponseStream(fs.createWriteStream("./test.1.png")) // 把响应流写入"./test.1.png"文件中

setNeedHelpDeskAuth() // 如果是服务台 API，需要设置 HelpDesk token
// 使用示例:
req.setNeedHelpDeskAuth() // 设置请求是否需要 HelpDesk token

setIsNotDataField() // 设置响应体的是否 没有`data`字段
// 使用示例:
req.setIsNotDataField() // 设置响应体没有`data`字段

```

## 如何发送请求

- 由于SDK已经封装了app_access_token、tenant_access_token的获取，所以在调业务API的时候，不需要去获取app_access_token、tenant_access_token。如果业务接口需要使用user_access_token，需要进行设置（lark.api.setUserAccessToken("
UserAccessToken")），具体请看 README.zh.md -> 如何构建请求（Request）
- 更多使用示例，请看：[packages/sample/src/api](packages/sample/src/api)（含：文件的上传与下载）

```javascript
// import * as lark from "@larksuiteoapi/allcore";  // typescript
const lark = require("@larksuiteoapi/allcore");

// 参数说明：
// conf：整体的配置（Config）
// req：请求（Request）
// 返回值说明：
// resp: http response body json
// err：发送请求，出现的错误
async lark.api.sendRequest(conf:lark.core.Config, req:lark.api.Request)

```

## lark.core.Context 常用方法

```javascript
// import * as lark from "@larksuiteoapi/allcore";  // typescript
const lark = require("@larksuiteoapi/allcore");

// 在事件订阅与消息卡片回调的处理者中，可以从lark.core.Context中获取 Config
const conf = lark.core.getConfigByCtx(ctx:lark.core.Context)

```

## 下载文件工具

- 通过网络请求下载文件
- 更多使用示例，请看：[packages/sample/src/tools/downFile.js](packages/sample/src/tools/downFile.js)

```javascript
// import * as lark from "@larksuiteoapi/allcore";  // typescript
const lark = require("@larksuiteoapi/allcore");

// 参数说明：
// url：文件的HTTP地址
// timeoutOfMs：请求超时的时间（毫秒）
// 返回值说明：
// resp: http response body binary
// err：发送请求，出现的错误
async lark.api.downloadFile(url:string, timeoutOfMs:number)

```

## License

---

- MIT

## 联系我们

---

- 飞书：[服务端SDK](https://open.feishu.cn/document/ukTMukTMukTM/uETO1YjLxkTN24SM5UjN) 页面右上角【这篇文档是否对你有帮助？】提交反馈
    
