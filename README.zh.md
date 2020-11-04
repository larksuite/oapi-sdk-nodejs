# larksuit open api sdk

| 模块    | 描述 | NPM 包名      |
|--------------|--------------|-------------------|
|  core    | 应用信息配置及一些通用的方法  |  `@larksuiteoapi/core`     |
|  api     | 发送请求获取larksuite/feishu的业务开放能力  |  `@larksuiteoapi/api`      |
|  event   | 监听larksuite/feishu的业务数据发生变化，产生的事件  |  `@larksuiteoapi/event`      |
|  card    | 监听消息卡片交互时的动作  |  `@larksuiteoapi/card`   |
|  sample  | 示例代码 |     |

## @larksuiteoapi/core

- 不需要npm安装，`@larksuiteoapi/api`、`@larksuiteoapi/event`、`@larksuiteoapi/card` 都依赖了该包

- 使用说明
    - 获取应用的配置
        - 方便开发提供了[代码样例](https://github.com/larksuite/oapi-sdk-nodejs/blob/main/packages/sample/src/config/config.ts)
            - 使用 redis 实现 Store接口，用于维护 `app_access_token`、`tenant_access_token` 的生命周期
        - 方法使用说明，如下：
    ```javascript
      
      const OapiCore = require("@larksuiteoapi/core")
      // 创建应用配置，防止泄漏，建议将应用信息放在环境变量中。
      // appID：应用凭证中的App ID
      // appSecret：应用凭证中的App Secret
      // verificationToken：事件订阅中的Verification Token
      // encryptKey：事件订阅中的Encrypt Key，可以为""，表示事件内容不加密
      // 企业自建应用的配置
      let appSettings = OapiCore.newInternalAppSettings("[appID]", "[appSecret]", "[verificationToken]", "[encryptKey]")
      // 应用商店应用的配置
      let appSettings = OapiCore.newISVAppSettings("[appID]", "[appSecret]", "[verificationToken]", "[encryptKey]")
      
      
      // 创建Config
      // domain：域名http地址：OapiCore.Domain.FeiShu / OapiCore.Domain.LarkSuite
      // appSettings：应用配置
      // logger：[日志接口](https://github.com/larksuite/oapi-sdk-nodejs/blob/main/packages/core/src/log/log.ts)
      // loggerLevel：输出的日志级别 OapiCore.LoggerLevel.DEBUG/INFO/WARN/ERROR (packages/core/src/log/log.ts)
      // store: [存储接口](https://github.com/larksuite/oapi-sdk-nodejs/blob/main/packages/core/src/store/store.ts)，用来存储app_ticket/app_access_token/tenant_access_token
      // 用于线上的config
      let conf = OapiCore.newConfig(domain, appSettings, logger, loggerLevel, store)    
      
      // 用于开发测试的Config
      // logger：使用默认实现(packages/core/src/log/log.ts)
      // loggerLevel：Debug级别
      // store：使用默认实现（Map）
      let conf = OapiCore.newTestConfig(domain, appSettings)
      
      // 创建Context，用于API请求、Event回调、Card回调等，作为函数的参数
      // 使用Map进行实现
      let ctx = new OapiCore.Context()
      // 获取 API请求、Event回调、Card回调的RequestID（string），用于问题反馈时，开放平台查询相关日志，可以快速的定位问题
      let requestID = ctx.getRequestID()
      // 获取 API请求的响应状态码（number）
      let statusCode = ctx.getHTTPStatusCode()
    ```
  
  ## @larksuiteoapi/api
  
  - 处理流程
    - 对`app_access_token`、`tenant_access_token`的获取及生命周期的维护做了封装，**开发者可直接访问业务接口**
	
![图片名称](//sf1-ttcdn-tos.pstatp.com/obj/website-img/588c0b73ff89ed27fab8c9655c43d2fe_XJnx5vPsEo.png)

  - 安装
  ```shell script
  $  npm install @larksuiteoapi/api
  ``` 
  - 使用说明
    - 对于`应用商店应用`，在获取`app_access_token`时，需要 `app_ticket`，需要启动事件订阅服务（`@larksuiteoapi/event`）
    - 封装请求，如下：
      ```javascript
      
        const OapiApi = require("@larksuiteoapi/api")
        
        // 创建请求
        // httpPath：API路径（`open-apis/`之后的路径），例如：https://{domain}/open-apis/authen/v1/user_info，则 httpPath："authen/v1/user_info"
        // httpMethod: GET/POST/PUT/BATCH/DELETE
        // accessTokenType：API使用哪种token访问，取值范围：OapiApi.AccessTokenType.App/Tenant/User，例如：OapiApi.AccessTokenType.Tenant
        // input：请求体（可能是formdata（例如：文件上传））,如果不需要请求体（例如一些GET请求），则传：undefined
        // optFns：扩展函数，一些不常用的参数封装，如下：
          // OapiApi.setPathParams({"user_id":4})：设置URL Path参数（有:前缀）值，当httpPath="users/:user_id"时，请求的URL="https://{domain}/open-apis/users/4"
          // OapiApi.setQueryParams({"age":4,"types":[1,2]})：设置 URL qeury，会在url追加?age=4&types=1&types=2
          // OapiApi.setTimeoutOfMs(1000)，设置http请求，超时时间毫秒值
          // OapiApi.setIsResponseStream()，设置响应的是否是流，例如下载文件，这时：output值是Buffer类型
          // OapiApi.setIsNotDataField(),设置响应的是否 没有`data`字段，业务接口都是有`data`字段，所以不需要设置
          // OapiApi.setTenantKey("TenantKey")，以`ISV应用`身份，表示使用`tenant_access_token`访问API，需要设置
          // OapiApi.setUserAccessToken("UserAccessToken")，表示使用`user_access_token`访问API，需要设置
        let req = OapiApi.newRequest(httpPath: string, httpMethod: string, accessTokenType: AccessTokenType, input: any, ...optFns: OptFn[]))
      
      ```
    - 发送请求，如下：
        - 可以参考开发者文档，知道 result（ = response.Body["data"]，非下载文件接口）有哪些字段
        - OapiApi.send，可能会 throw error（ = response.Body[code，msg…]）
    ```javascript
        
        const OapiApi = require("@larksuiteoapi/api")
        const OapiCore = require("@larksuiteoapi/core")
       
        let conf = xxx //OapiCore.Config
        
        // 发送消息
        let ctx = new OapiCore.Context()
        let req = OapiApi.newRequest("message/v4/send", "POST", OapiApi.AccessTokenType.Tenant, {
              open_id: "open_id",
              msg_type: "text",
              content: {
                text: "test"
              }
          }, 
        // 应用商店应用，OapiApi.setTenantKey("TenantKey"),
        )
        OapiApi.send(ctx, conf, req).then(result => {
            console.log(result)
            console.log(ctx.getRequestID())
            console.log(ctx.getHTTPStatusCode())
        }).catch(e => {
            console.error(ctx.getRequestID())
            console.error(ctx.getHTTPStatusCode())
            console.error(e.code)
            console.error(e.msg)
            console.error(e)
        })
    
    
        const fs = require("fs")
        // 上传图片
        let data = fs.readFileSync('./test.png');
        let formData = new OapiApi.FormData()
        formData.setField("image_type", "message")
        // 追加文件，如果接口支持多个文件上传，可以多次调用 formData.appendFile
        formData.appendFile(new OapiApi.File().setContent(data).setFieldName("image").setType("image/jpeg"))
        let req = OapiApi.newRequest("image/v4/put", "POST", OapiApi.AccessTokenType.Tenant, formData)
        let ctx = new OapiCore.Context()
        OapiApi.send(ctx, conf, req).then(result=>{
            console.log(result)
            console.debug(ctx.getRequestID())
            console.debug(ctx.getHTTPStatusCode())
        }).catch(e => {
            console.error(ctx.getRequestID())
            console.error(ctx.getHTTPStatusCode())
            console.error(e.code)
            console.error(e.msg)
            console.error(e)
        })
        
        // 下载图片
        let queryParams = {
            image_key: "img_xxxxxxxxxxxxxxxxxx"
        }
        let req = OapiApi.newRequest("image/v4/get", "GET",
            OapiApi.AccessTokenType.Tenant, undefined, OapiApi.setQueryParams(queryParams), OapiApi.setIsResponseStream())
        let ctx = new OapiCore.Context()
        OapiApi.send(ctx, conf, req).then(buf=>{
            fs.writeFileSync("./test.0.png", buf)
            console.debug(ctx.getRequestID())
            console.debug(ctx.getHTTPStatusCode())
        }).catch(e => {
            console.error(ctx.getRequestID())
            console.error(ctx.getHTTPStatusCode())
            console.error(e.code)
            console.error(e.msg)
            console.error(e)
        })
        
    ```
    - 批量发送请求
        - [示例代码](https://github.com/larksuite/oapi-sdk-nodejs/blob/main/packages/sample/src/api/batchReqCall.js) 
  - 工具
    - 下载文件（例如：图片）
    ```javascript
        const fs = require("fs")
        const OapiApi = require("@larksuiteoapi/api")
        // 参数一：文件的URL
        // 参数二：请求超时时间（单位：毫秒）
        OapiApi.downloadFile("https://s0.pstatp.com/ee/lark-open/web/static/apply.226f11cb.png", 3000).then(buf => {
            fs.writeFileSync("./test.png", buf)
        })
    ```   
    
## @larksuiteoapi/event

- 处理流程
    - 封装了`应用商店应用`的`app_ticket`事件（需要再次设置该事件的处理者），将其存入Store，供`@larksuiteoapi/api`使用
    - 事件数据的解密与来源可靠性的验证
  - 安装
  ```shell script
  $  npm install @larksuiteoapi/event
  ```
  - 使用说明
    - 事件监听服务启动
        - [使用原生的http server启动](https://github.com/larksuite/oapi-sdk-nodejs/blob/main/packages/sample/src/event/httpServer.js)  
        - [使用Express启动](https://github.com/larksuite/oapi-sdk-nodejs/blob/main/packages/sample/src/event/express.js)
    - 设置事件的处理者，样例如下：
    ```javascript
    
    const OapiEvent = require("@larksuiteoapi/event")
    const conf = xxx //OapiCore.Config
    
    // 处理 "app_status_change" 事件
    // 如果处理其他事件，只需把 "app_status_change" 修改了，event里有哪些字段，请参考开放平台文档
    OapiEvent.setTypeHandler(conf, "app_status_change", (ctx, event) => {
        let conf = OapiCore.getConfigByCtx(ctx);
        console.log(conf);
        console.log("----------------");
        console.log(ctx.getRequestID());
        console.log(event);
    })
    
    ```
    
## @larksuiteoapi/card

  - 安装
  ```shell script
  $  npm install @larksuiteoapi/card
  ```
  - 封装了
    - 卡片数据的有效性、来源可靠性的验证
    
  - 使用说明
    - 消息卡片回调服务启动
        - [使用原生的http server启动](https://github.com/larksuite/oapi-sdk-nodejs/blob/main/packages/sample/src/card/httpServer.js)  
        - [使用Express启动](https://github.com/larksuite/oapi-sdk-nodejs/blob/main/packages/sample/src/card/express.js)
    - 设置卡片的处理者，样例如下：
    ```javascript
    
    const OapiCard = require("@larksuiteoapi/card")
    const conf = xxx //OapiCore.Config
    
    // 处理消息卡片回调，card里有哪些字段，请参考开放平台文档
    OapiCard.setHandler(conf, (ctx, card) => {
       let conf = OapiCore.getConfigByCtx(ctx);
       console.log(conf);
       console.log("----------------");
       console.log(ctx.getRequestID());
       console.log(card);
    })
        
    ```
    
    
