# larksuit open api sdk

| 模块    | 描述 | 
|--------------|--------------|
|  core    | 应用信息配置及一些通用的方法  | 
|  api     | 发送请求获取larksuite/feishu的业务开放能力  |  
|  event   | 监听larksuite/feishu的业务数据发生变化，产生的事件  |  
|  card    | 监听消息卡片交互时的动作  | 
|  sample  | 示例代码 |     |

## 安装
npm install @larksuiteoapi/allcore

## core

- 使用说明
    - 获取应用的配置
        - 方便开发提供了[代码样例](https://github.com/larksuite/oapi-sdk-nodejs/blob/main/packages/sample/src/config/config.ts)
            - 使用 redis 实现 Store接口，用于维护 `app_access_token`、`tenant_access_token` 的生命周期
        - 方法使用说明，如下：
    ```javascript
      
      const lark = require("@larksuiteoapi/allcore")
      // 创建应用配置，防止泄漏，建议将应用信息放在环境变量中。
      // appID：应用凭证中的App ID
      // appSecret：应用凭证中的App Secret
      // verificationToken：事件订阅中的Verification Token
      // encryptKey：事件订阅中的Encrypt Key，可以为""，表示事件内容不加密
      // 企业自建应用的配置
      let appSettings = lark.core.newInternalAppSettings("[appID]", "[appSecret]", "[verificationToken]", "[encryptKey]")
      // 应用商店应用的配置
      let appSettings = lark.core.newISVAppSettings("[appID]", "[appSecret]", "[verificationToken]", "[encryptKey]")
      
      
      // 创建Config
      // domain：域名http地址：lark.core.Domain.FeiShu / lark.core.Domain.LarkSuite
      // appSettings：应用配置
      // logger：[日志接口](https://github.com/larksuite/oapi-sdk-nodejs/blob/main/packages/core/src/log/log.ts)
      // loggerLevel：输出的日志级别 lark.core.LoggerLevel.DEBUG/INFO/WARN/ERROR (packages/core/src/log/log.ts)
      // store: [存储接口](https://github.com/larksuite/oapi-sdk-nodejs/blob/main/packages/core/src/store/store.ts)，用来存储app_ticket/app_access_token/tenant_access_token
      // 用于线上的config
      let conf = lark.core.newConfig(domain,appSettings,logger,loggerLevel,store)    
      
      // 用于开发测试的Config
      // logger：使用默认实现(packages/core/src/log/log.ts)
      // loggerLevel：Debug级别
      // store：使用默认实现（Map）
      let conf = lark.core.newTestConfig(domain, appSettings)
      
    ```

  ## api

    - 处理流程
        - 对`app_access_token`、`tenant_access_token`的获取及生命周期的维护做了封装，**开发者可直接访问业务接口**
          ![Processing flow](api_process.jpg)

- 使用说明
    - 对于`应用商店应用`，在获取`app_access_token`时，需要 `app_ticket`，需要启动事件订阅服务（event模块）
    - 封装请求，如下：
      ```javascript
      
        const lark.api = require("@larksuiteoapi/allcore")
        
        // 创建请求
        // httpPath：API路径（`open-apis/`之后的路径），例如：https://{domain}/open-apis/authen/v1/user_info，则 httpPath："authen/v1/user_info"
        // httpMethod: GET/POST/PUT/BATCH/DELETE
        // accessTokenType：API使用哪种token访问，取值范围：lark.api.AccessTokenType.App/Tenant/User，例如：lark.api.AccessTokenType.Tenant
        // input：请求体（可能是formdata（例如：文件上传））,如果不需要请求体（例如一些GET请求），则传：undefined
        // optFns：扩展函数，一些不常用的参数封装，如下：
          // lark.api.setPathParams({"user_id":4})：设置URL Path参数（有:前缀）值，当httpPath="users/:user_id"时，请求的URL="https://{domain}/open-apis/users/4"
          // lark.api.setQueryParams({"age":4,"types":[1,2]})：设置 URL qeury，会在url追加?age=4&types=1&types=2
          // lark.api.setTimeoutOfMs(1000)，设置http请求，超时时间毫秒值
          // lark.api.setIsResponseStream()，设置响应的是否是流，例如下载文件，这时：output值是Buffer类型
          // lark.api.setIsNotDataField(),设置响应的是否 没有`data`字段，业务接口都是有`data`字段，所以不需要设置
          // lark.api.setTenantKey("TenantKey")，以`ISV应用`身份，表示使用`tenant_access_token`访问API，需要设置
          // lark.api.setUserAccessToken("UserAccessToken")，表示使用`user_access_token`访问API，需要设置
        let req = lark.api.newRequest(httpPath: string, httpMethod: string, accessTokenType: AccessTokenType, input: any, ...optFns: OptFn[]))
      
      ```
    - 发送请求，如下：
        - 可以参考开发者文档，知道 result（ = http response body，非文件下载接口）有哪些字段
        - lark.api.sendRequestRequest，可能会 throw error
  ```javascript
      
      const lark.api = require("@larksuiteoapi/api")
      const lark.core = require("@larksuiteoapi/core")
     
      let conf = xxx //lark.core.Config
      
      // 发送消息
      let ctx = new lark.core.Context()
      let req = lark.api.newRequest("message/v4/send", "POST", lark.api.AccessTokenType.Tenant, {
            open_id: "open_id",
            msg_type: "text",
            content: {
              text: "test"
            }
        }, 
      // 应用商店应用，lark.api.setTenantKey("TenantKey"),
      )
      lark.api.sendRequest(conf, req).then(resp => {
          console.log(resp.getRequestID())
          console.log(resp.getHTTPStatusCode())
          console.log(resp)
      }).catch(e => {
          console.error(e)
      })
  
  
      const fs = require("fs")
      // 上传图片
      // 使用流的方式
      // let data = fs.createReadStream('./test.png');
      // 使用字节的方式
      let data = fs.readFileSync('./test.png');
      let formData = new lark.api.FormData()
      formData.setField("image_type", "message")
      // 追加文件，如果接口支持多个文件上传，可以多次调用 formData.appendFile
      formData.appendFile(new lark.api.File().setContent(data).setFieldName("image").setType("image/jpeg"))
      let req = lark.api.newRequest("image/v4/put", "POST", lark.api.AccessTokenType.Tenant, formData)
      lark.api.sendRequest(conf, req).then(resp => {
          console.log(resp.getRequestID())
          console.log(resp.getHTTPStatusCode())
          console.log(resp)
      }).catch(e => {
          console.error(e)
      })
      
      // 下载图片
      let queryParams = {
          image_key: "img_xxxxxxxxxxxxxxxxxx"
      }
      let req = lark.api.newRequest("image/v4/get", "GET",
          lark.api.AccessTokenType.Tenant, undefined, lark.api.setQueryParams(queryParams), lark.api.setIsResponseStream())
      lark.api.sendRequest(conf, req).then(resp=>{
          console.debug(ctx.getRequestID())
          console.debug(ctx.getHTTPStatusCode())
          fs.writeFileSync("./test.0.png", resp.data)
      }).catch(e => {
          console.error(e)
      })
      
  ```
    - 批量发送请求
        - [示例代码](https://github.com/larksuite/oapi-sdk-nodejs/blob/main/packages/sample/src/api/batchReqCall.js)
- 工具
    - 下载文件（例如：图片）
  ```javascript
      const fs = require("fs")
      const lark = require("@larksuiteoapi/allcore")
      // 参数一：文件的URL
      // 参数二：请求超时时间（单位：毫秒）
      lark.api.downloadFile("https://s0.pstatp.com/ee/lark-open/web/static/apply.226f11cb.png", 3000).then(buf => {
          fs.writeFileSync("./test.png", buf)
      })
  ```   

## event

- 处理流程
    - 封装了`应用商店应用`的`app_ticket`事件（需要再次设置该事件的处理者），将其存入 lark.core.Store
    - 事件数据的解密与来源可靠性的验证
    - 使用说明
        - 事件监听服务启动
            - [使用原生的http server启动](https://github.com/larksuite/oapi-sdk-nodejs/blob/main/packages/sample/src/event/httpServer.js)
            - [使用Express启动](https://github.com/larksuite/oapi-sdk-nodejs/blob/main/packages/sample/src/event/express.js)
        - 设置事件的处理者，样例如下：
      ```javascript
      
      const lark = require("@larksuiteoapi/allcore")
      const conf = xxx //lark.core.Config
      
      // 处理 "app_status_change" 事件
      // 如果处理其他事件，只需把 "app_status_change" 修改了，event里有哪些字段，请参考开放平台文档
      lark.event.setTypeHandler(conf, "app_status_change", (ctx, event) => {
          let conf = lark.core.getConfigByCtx(ctx);
          console.log(conf);
          console.log("----------------");
          console.log(ctx.getRequestID());
          console.log(event);
      })
      
      ```

## card

- 封装了
    - 卡片数据的有效性、来源可靠性的验证

- 使用说明
    - 消息卡片回调服务启动
        - [使用原生的http server启动](https://github.com/larksuite/oapi-sdk-nodejs/blob/main/packages/sample/src/card/httpServer.js)
        - [使用Express启动](https://github.com/larksuite/oapi-sdk-nodejs/blob/main/packages/sample/src/card/express.js)
    - 设置卡片的处理者，样例如下：
  ```javascript
  
  const lark = require("@larksuiteoapi/allcore")
  const conf = xxx //lark.core.Config
  
  // 处理消息卡片回调，card里有哪些字段，请参考开放平台文档
  // return:
     // interface: 可以是string（消息卡片 的json字符串），也可以是object（消息卡片 的json object）
  lark.card.setHandler(conf, (ctx, card) => {
     console.log("----------------");
     console.log(card.action);
  })
      
  ```
    
    
