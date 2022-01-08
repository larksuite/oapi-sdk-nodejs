[**飞书，点这里**](README.zh.md) | Larksuite(Overseas)

- 如果使用的是飞书，请看 [**飞书，点这里**](README.zh.md) ，飞书与Larksuite使用的域名不一样，引用的文档地址也是不同的。(If you are using FeiShu, please see [**飞书，点这里**](README.zh.md) , Feishu and larksuite use different domain names and reference different document addresses.)

# LarkSuite open api SDK

## Overview

---

- Larksuite open platform facilitates the integration of enterprise applications and larksuite, making collaboration and
  management more efficient.

- Larksuite development interface SDK, convenient call server API and subscribe server events, such as: Message & group,
  address book, calendar, docs and others can visit [larksuite open platform document](https://open.larksuite.cn/document) ,Take a look at [REFERENCE].

## Problem feedback

If you encounter any problems during usage, please let us know by submitting  [Github Issues](https://github.com/larksuite/oapi-sdk-nodejs/issues). We will deal with these Issues and get back to you as soon as possible.


## installation

```shell script
  npm i @larksuiteoapi/allcore@1.0.14
```

## Explanation of terms
- Larksuite: the overseas name of lark, which mainly provides services for overseas enterprises and has an independent [domain name address](https://www.larksuite.com/) .
- Development documents: reference to the open interface of the open platform **developers must see, and can use search to query documents efficiently** . [more information](https://open.feishu.cn/document/) .
- Developer background: the management background for developers to develop applications, [more introduction](https://open.larksuite.cn/app/) .
- Cutome APP: the application can only be installed and used in the enterprise，[more introduction](https://open.larksuite.com/document/ukzMxEjL5MTMx4SOzETM/uEjNwYjLxYDM24SM2AjN) .
- Marketplace App：The app will be displayed in [App Directory](https://app.larksuite.com/) Display, each enterprise can choose to install.

![App type](doc/app_type.en.png)


## Quick use

---

### Call API

#### Example of using `Custom App` to access [send text message](https://open.larksuite.com/document/uMzMyEjLzMjMx4yMzITM/ugDN0EjL4QDNx4CO0QTM) API
- Since the SDK has encapsulated the app_access_token、tenant_access_token So when calling the business API, you don't need to get the app_access_token、tenant_access_token. If the business interface needs to use user_access_token, which needs to be set（lark.api.setUserAccessToken("UserAccessToken")), Please refer to README.md -> How to build a request(Request)
- For more use examples, please see: [packages/sample/src/api](packages/sample/src/api)

```javascript
// import * as lark from "@larksuiteoapi/allcore";  // typescript
const lark = require("@larksuiteoapi/allcore");     // javascript

// Configuration of custom app, parameter description:
// appID、appSecret: "Developer Console" -> "Credentials"（App ID、App Secret）
// verificationToken、encryptKey："Developer Console" -> "Event Subscriptions"（Verification Token、Encrypt Key）
// helpDeskID、helpDeskToken, Help Desk token：https://open.feishu.cn/document/ukTMukTMukTM/ugDOyYjL4gjM24CO4IjN
const appSettings = lark.newInternalAppSettings({
    appID: "App ID",
    appSecret: "App Secret",
    encryptKey: "Encrypt Key", // Not required. Required when subscribing to events
    verificationToken: "Verification Token", // Not required, required to subscribe to event and message cards
    helpDeskID: "HelpDesk ID", // Not required, required when using the help Desk API
    helpDeskToken: "HelpDesk Token", // Not required, required when using the help Desk API
})

// Currently, you are visiting larksuite, which uses default storage and default log (error level). For more optional configurations, see readme.md -> How to Build an overall Configuration (Config).
const conf = lark.newConfig(lark.Domain.FeiShu, appSettings, {
    loggerLevel: lark.LoggerLevel.ERROR,
})

// The content of the sent message
const body = {
    open_id: "user open id",
    msg_type: "text",
    content: {
        text: "test send message",
    },
}
// Build request
const req = lark.api.newRequest("/open-apis/message/v4/send", "POST", lark.api.AccessTokenType.Tenant, body)
// Send request 
lark.api.sendRequest(conf, req).then(r => {
    // Print the requestId of the request
    console.log(r.getRequestID())
    // Print the response status of the request
    console.log(r.getHTTPStatusCode())
    console.log(r) // r = response.body
}).catch(e => {
    // Error handling of request
    console.log(e)
})
```

### Subscribe to events

- [Subscribe to events](https://open.larksuite.com/document/uMzMyEjLzMjMx4yMzITM/uETM4QjLxEDO04SMxgDN) , to understand
  the process and precautions of subscribing to events.
- For more use examples, please refer to [packages/sample/src/event](packages/sample/src/event)（including: use in combination with express）

#### Example of using `Custom App` to subscribe [App First Enabled](https://open.larksuite.com/document/uMzMyEjLzMjMx4yMzITM/uYjMyYjL2IjM24iNyIjN) event.

```javascript
// import * as lark from "@larksuiteoapi/allcore";  // typescript
const lark = require("@larksuiteoapi/allcore");     // javascript

// Configuration of custom app, parameter description:
// appID、appSecret: "Developer Console" -> "Credentials"（App ID、App Secret）
// verificationToken、encryptKey："Developer Console" -> "Event Subscriptions"（Verification Token、Encrypt Key）
// helpDeskID、helpDeskToken, Help Desk token：https://open.feishu.cn/document/ukTMukTMukTM/ugDOyYjL4gjM24CO4IjN
const appSettings = lark.newInternalAppSettings({
    appID: "App ID",
    appSecret: "App Secret",
    encryptKey: "Encrypt Key",
    verificationToken: "Verification Token",
})

// Currently, you are visiting larksuite, which uses default storage and default log (error level). For more optional configurations, see readme.md -> How to Build an overall Configuration (Config).
const conf = lark.newConfig(lark.Domain.FeiShu, appSettings, {
    loggerLevel: lark.LoggerLevel.ERROR,
})

// Set the application event handler to be enabled for the first time
lark.event.setTypeHandler(conf, "app_open", (ctx, event) => {
    // Print the request ID of the request
    console.log(ctx.getRequestID());
    // Print event
    console.log(event);
})

// Start the httpserver, "Developer Console" -> "Event Subscriptions", setting Request URL：https://domain
// startup event http server, port: 8089
lark.event.startServer(conf, 8089)

```

### Processing message card callbacks

- [Message Card Development Process](https://open.larksuite.com/document/uMzMyEjLzMjMx4yMzITM/ukzM3QjL5MzN04SOzcDN) , to
  understand the process and precautions of processing message cards
- For more use examples, please refer to [packages/sample/src/card](packages/sample/src/card)（including: use in combination with express）

#### Example of using `Custom App` to handling message card callback.

```javascript
// import * as lark from "@larksuiteoapi/allcore";  // typescript
const lark = require("@larksuiteoapi/allcore");     // javascript

// Configuration of custom app, parameter description:
// appID、appSecret: "Developer Console" -> "Credentials"（App ID、App Secret）
// verificationToken、encryptKey："Developer Console" -> "Event Subscriptions"（Verification Token、Encrypt Key）
// helpDeskID、helpDeskToken, Help Desk token：https://open.feishu.cn/document/ukTMukTMukTM/ugDOyYjL4gjM24CO4IjN
const appSettings = lark.newInternalAppSettings({
    appID: "App ID",
    appSecret: "App Secret",
    encryptKey: "Encrypt Key", // Not required. Required when subscribing to events
    verificationToken: "Verification Token",
})

// Currently, you are visiting larksuite, which uses default storage and default log (error level). For more optional configurations, see readme.md -> How to Build an overall Configuration (Config).
const conf = lark.newConfig(lark.Domain.FeiShu, appSettings, {
    loggerLevel: lark.LoggerLevel.ERROR,
})

// Set the handler of the message card
// Return value: can be "", JSON string of new message card
lark.card.setHandler(conf, (ctx, card) => {
    // 打印消息卡片
    console.log(card)
    console.log(card.action)
    return "{\"config\":{\"wide_screen_mode\":true},\"i18n_elements\":{\"zh_cn\":[{\"tag\":\"div\",\"text\":{\"tag\":\"lark_md\",\"content\":\"[飞书](https://www.feishu.cn)整合即时沟通、日历、音视频会议、云文档、云盘、工作台等功能于一体，成就组织和个人，更高效、更愉悦。\"}}]}}";
})

// Start the httpserver, "Developer Console" -> "Features" -> "Bot", setting Message Card Request URL: https://domain
// startup event http server, port: 8089
lark.event.startServer(conf, 8089)
```

## How to build app settings(AppSettings)

```javascript
// import * as lark from "@larksuiteoapi/allcore";  // typescript
const lark = require("@larksuiteoapi/allcore");     // javascript

// To prevent application information leakage, in the configuration environment variables, the variables (4) are described as follows:
// APP_ID: "Developer Console" -> "Credentials"（App ID）
// APP_Secret: "Developer Console" -> "Credentials"（App Secret）
// VERIFICATION_Token: VerificationToken、EncryptKey："Developer Console" -> "Event Subscriptions"（Verification Token）
// ENCRYPT_Key: VerificationToken、EncryptKey："Developer Console" -> "Event Subscriptions"（Encrypt Key）
// HELP_DESK_ID: Service desk setup center -> ID
// HELP_DESK_TOKEN: Service desk setup center -> 令牌
// The configuration of "Custom App" is obtained through environment variables
const appSettings = lark.getInternalAppSettingsByEnv()
// The configuration of "Marketplace App" is obtained through environment variables
const appSettings = lark.getISVAppSettingsByEnv()


// Parameter description:
// appID、appSecret: "Developer Console" -> "Credentials"（App ID、App Secret）
// verificationToken、encryptKey："Developer Console" -> "Event Subscriptions"（Verification Token、Encrypt Key）
// helpDeskID、helpDeskToken, Help Desk token：https://open.feishu.cn/document/ukTMukTMukTM/ugDOyYjL4gjM24CO4IjN
// The Configuration of custom app, parameter description:
const appSettings = lark.newInternalAppSettings({
    appID: "App ID",
    appSecret: "App Secret",
    encryptKey: "Encrypt Key", // Not required. Required when subscribing to events
    verificationToken: "Verification Token", // Not required, required to subscribe to event and message cards
    helpDeskID: "HelpDesk ID", // Not required, required when using the help Desk API
    helpDeskToken: "HelpDesk Token", // Not required, required when using the help Desk API
})
// The configuration of "Marketplace App"
const appSettings = lark.newISVAppSettings({
    appID: "App ID",
    appSecret: "App Secret",
    encryptKey: "Encrypt Key", // Not required. Required when subscribing to events
    verificationToken: "Verification Token", // Not required, required to subscribe to event and message cards
    helpDeskID: "HelpDesk ID", // Not required, required when using the help Desk API
    helpDeskToken: "HelpDesk Token", // Not required, required when using the help Desk API
})

```

## How to build overall configuration(Config)

- Visit Larksuite, Feishu or others
- App settings
- The implementation of logger is used to output the logs generated in the process of SDK processing, which is
  convenient for troubleshooting.
    - You can use the log implementation of the business system, see the sample
      code: [packages/core/src/log/log.ts](packages/core/src/log/log.ts) ConsoleLogger
- The implementation of store is used to save the access credentials (app/tenant_access_token), temporary voucher (
  app_ticket）
    - Redis is recommended. Please see the example code: [sample/config/redis_store.go](packages/sample/src/config/config.ts) RedisStore
        - It can reduce the times of obtaining access credentials and prevent the frequency limit of calling access
          credentials interface.
        - "Marketplace App", accept open platform distributed `app_ticket` will be saved to the storage, so the
          implementation of the storage interface (store) needs to support distributed storage.

```javascript
// import * as lark from "@larksuiteoapi/allcore";  // typescript
const lark = require("@larksuiteoapi/allcore");

// It is recommended to use Redis to implement the storage interface (Store) to reduce the number of accesses to the AccessToken interface
// Parameter description:
// domain: URL Domain address. Value range: lark.Domain.FeiShu / lark.Domain.LarkSuite / Other URL domain name address
// appSettings: application configuration
// opts: configuration options
    // opts.logger: [log interface](core/log/log.go), default: lark.ConsoleLogger
    // opts.loggerlevel: log level. Default: ERROR level （lark.LoggerLevel.ERROR）
    // opts.store: [storage port](core/store/store.go), used to store app_ticket/app_access_token/tenant_access_token. Default: lark.DefaultStore
lark.newConfig(domain: Domain, appSettings: AppSettings, opts: ConfigOpts): Config

// Use example:
const conf = lark.newConfig(lark.Domain.FeiShu, appSettings, {
    loggerLevel: lark.LoggerLevel.ERROR,
    logger: new lark.ConsoleLogger(),
    store: new lark.DefaultStore(),
})
```    

## How to build a request(Request)

- For more examples, see[packages/sample/src/api](packages/sample/src/api)（including: file upload and download）

```javascript
// import * as lark from "@larksuiteoapi/allcore";  // typescript
const lark = require("@larksuiteoapi/allcore");

// Create request 
// httpPath: API path
    // such as: https://domain/open-apis/contact/v3/users/:user_id
    // support: the path of the domain name after, httpPath: "/open apis/contact/v3/users/:user_id" (recommended)
    // support: the full path, httpPath: "https://domain/open-apis/contact/v3/users/:user_id"
    // support: httpPath: "contact/v3/users/:user_id"
// httpMethod: GET/POST/PUT/BATCH/DELETE 
// accessTokenType: What kind of token access the API uses, value range: lark.api.AccessTokenType.App/Tenant/User, for example: lark.api.AccessTokenType.Tenant 
// input : The request body (may be formdata (for example: file upload)), if the request body is not needed (for example, some GET requests), pass: undefined
let req = lark.api.newRequest(httpPath: string, httpMethod: string, accessTokenType: AccessTokenType, input: any)

// Request method , SDK version requirements: 1.0.9 and above

setPathParams(pathParams: { [key: string]: any }) // Set the URL Path parameter (with: prefix) value
// Use example:
req.setPathParams({"user_id":4}) // when httpPath="users/:user_id", the requested URL="https://{domain}/open-apis/users/4" 


setQueryParams(queryParams: { [key: string]: any }) // Set the URL qeury
// Use example:
req.setQueryParams({"age":4,"types":[1,2]}) // it will be appended to the url?age=4&types=1&types=2 


setTenantKey(tenantKey: string) // to `ISV application` status, indication `tenant_access_token` access API, you need to set 
// Use example:
req.setTenantKey("68daYsd") // Set TenantKey to "68daysd"


setUserAccessToken(userAccessToken: string) // use of` user_access_token` access API, you need to set 
// Use example:
req.setUserAccessToken("u-7f1bcd13fc57d46bac21793a18e560") // Set the user access token to "u-7f1bcd13fc57d46bac21793a18e560"


setTimeoutOfMs(timeoutOfMs: number) // set the http request, timeout time in milliseconds 
// Use example:
req.setTimeoutOfMs(5000) // Set the request timeout to 5000 Ms


setIsResponseStream() // set whether the response is a stream, such as downloading a file, at this time: the output value is of Buffer type
// Use example:
req.setIsResponseStream() // set the response is a stream


setResponseStream(responseStream: stream.Writable) // Set whether the response body is a stream. For example, when downloading a file, the response stream will be written to the responsestream
// Use example:
req.setResponseStream(fs.createWriteStream("./test.1.png")) // Write the response stream to the "./test.1.png" file


setNeedHelpDeskAuth() // If it is a HelpDesk API, you need to set the HelpDesk token
// Use example:
req.setNeedHelpDeskAuth() // Sets whether the request requires a HelpDesk token


```

## How to send a request
- Since the SDK has encapsulated the app_access_token、tenant_access_token So when calling the business API, you don't need to get the app_access_token、tenant_access_token. If the business interface needs to use user_access_token, which needs to be set（lark.api.setUserAccessToken("UserAccessToken")), Please refer to README.md -> How to build a request(Request)
- For more use examples, please see: [packages/sample/src/api](packages/sample/src/api)（including: file upload and download）

```javascript
// import * as lark from "@larksuiteoapi/allcore";  // typescript
const lark = require("@larksuiteoapi/allcore");

// Parameter Description:
// conf：Overall configuration（Config）
// req：Request（Request）
// resp: http response body json
// err：Send request happen error 
async lark.api.sendRequest(conf: lark.core.Config, req: lark.api.Request)

```

## lark.core.Context common methods

```javascript
// import * as lark from "@larksuiteoapi/allcore";  // typescript
const lark = require("@larksuiteoapi/allcore");

// In the handler of event subscription and message card callback, you can lark.core.Context Get config from
const conf = lark.core.getConfigByCtx(ctx: lark.core.Context)

```

## Download File Tool

- Download files via network request
- For more use examples, please see: [packages/sample/src/tools/downFile.js](packages/sample/src/tools/downFile.js)

```javascript
// import * as lark from "@larksuiteoapi/allcore";  // typescript
const lark = require("@larksuiteoapi/allcore");

// Get the file content
// Parameter Description:
// url：The HTTP address of the file
// timeoutOfMs：Time the request timed out in milliseconds
// Return value Description:
// resp: http response body binary
// err：Send request happen error
async lark.api.downloadFile(url: string, timeoutOfMs: number)

```

## License

---

- MIT
    
