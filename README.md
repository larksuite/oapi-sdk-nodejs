# larksuit open api sdk
[中文](README.zh.md)

| Module    | description | NPM     |
|--------------|--------------|-------------------|
|  core    | Application information configuration and some general methods  |  `@larksuiteoapi/core`     |
|  api     | Request the API of larksuite/feishu  |  `@larksuiteoapi/api`      |
|  event   | Monitor the business data of larksuite/feishu changes and events generated |  `@larksuiteoapi/event`      |
|  card    | Monitor the actions of message card interaction  |  `@larksuiteoapi/card`   |
|  sample  | Example |     |

## @larksuiteoapi/core

- Npm not required to install, `@larksuiteoapi/api`、`@larksuiteoapi/event`、`@larksuiteoapi/card` we are dependent on the package

- Instructions for use
    - Get application configuration
        - Provides [code samples to](packages/sample/src/config/config.ts) facilitate development
            - Use redis to implement Store interface for maintenance `app_access_token`、`tenant_access_token` life cycle
        - Instructions for the method are as follows:
    ```javascript
      
      const OapiCore = require("@larksuiteoapi/core")
      // Create application configuration to prevent leakage. It is recommended to put application information in environment variables. 
      // appID: App ID in the application credential 
      // appSecret: App Secret in the application credential 
      // verificationToken: Verification Token in the event subscription 
      // encryptKey: Encrypt Key in the event subscription, can be "", indicating that the event content is not Encryption 
      // Settings of enterprise self-built apps
      let appSettings = OapiCore.newInternalAppSettings("[appID]", "[appSecret]", "[verificationToken]", "[encryptKey]")
      // Settings of app store apps
      let appSettings = OapiCore.newISVAppSettings("[appID]", "[appSecret]", "[verificationToken]", "[encryptKey]")
      
      
      // Create Config 
      // domain: domain name http address: OapiCore.Domain.FeiShu/OapiCore.Domain.LarkSuite 
      // appSettings: application configuration 
      // logger: [log interface](packages/core/src/log/log.ts) 
      // loggerLevel: output log level OapiCore.LoggerLevel.DEBUG/INFO/WARN/ERROR (packages/core/src/log/log.ts) 
      // store: [Store interface](packages/core/src/store/store .ts), used to store app_ticket/app_access_token/tenant_access_token 
      // for online config
      let conf = OapiCore.newConfig(domain, appSettings, logger, loggerLevel, store)    
      
      // Config for development and testing 
      // logger: use the default implementation (packages/core/src/log/log.ts) 
      // loggerLevel: Debug level 
      // store: use the default implementation (Map)
      let conf = OapiCore.newTestConfig(domain, appSettings)
      
      // Create Context for API requests, Event callbacks, Card callbacks, etc., as function parameters 
      // Use Map to implement
      let ctx = new OapiCore.Context()
      // Get the RequestID of API requests, Event callbacks, and Card callbacks ( string), used for problem feedback, open platform query related logs, you can quickly locate the problem 
      let requestID = ctx.getRequestID()
      // Get the response status code of the API request (number) 
      let statusCode = ctx.getHTTPStatusCode()
    ```
  
  ## @larksuiteoapi/api
  
  - Processing flow
    - For `app_access_token`、`tenant_access_token`maintain the life cycle of acquisition and made a package, **developers can directly access the service API**
    ![Processing flow](api_process_en.jpg)
  - installation
  ```shell script
  $  npm install @larksuiteoapi/api
  ``` 
  - Instructions for use
    - For `App Store application`, when acquiring `app_access_token` , you need `app_ticket` to start the event subscription service(`@larksuiteoapi/event`)
    - The package request is as follows:
      ```javascript
      
        const OapiApi = require("@larksuiteoapi/api")
            
        // Create request 
        // httpPath: (path after `open-apis/`) API path, for example: https://{domain}/open-apis/authen/v1/user_info, the httpPath: "authen/v1/user_info" 
        // httpMethod: GET/POST/PUT/BATCH/DELETE 
        // accessTokenType: What kind of token access the API uses, value range: OapiApi.AccessTokenType.App/Tenant/User, for example: OapiApi.AccessTokenType.Tenant 
        // input : The request body (may be formdata (for example: file upload)), if the request body is not needed (for example, some GET requests), pass: undefined 
        // optFns: extension function, some infrequently used parameter packages, as follows: 
            // OapiApi .setPathParams({"user_id":4}): Set the URL Path parameter (with: prefix) value, when httpPath="users/:user_id", the requested URL="https://{domain}/open-apis/users/4" 
            // OapiApi.setQueryParams({"age":4,"types":[1,2]}): Set the URL qeury, it will be appended to the url?age=4&types=1&types=2 
            // OapiApi. setTimeoutOfMs(1000), set the http request, timeout time in milliseconds 
            // OapiApi.setIsResponseStream(), set whether the response is a stream, such as downloading a file, at this time: the output value is of Buffer type
            // OapiApi.setIsNotDataField (), set up in response to whether or not `data` field service interface are all` data` field, there is no need to set 
            // OapiApi.setTenantKey("TenantKey"), to `` ISV application status, indication `tenant_access_token` access API, you need to set 
            // OapiApi.setUserAccessToken("UserAccessToken"), represents the use of` user_access_token` access API, you need to set 
        let req = OapiApi.newRequest(httpPath: string, httpMethod: string, accessTokenType: AccessTokenType, input: any, ...optFns: OptFn[]))
          
      ```
    - Send the request as follows:
        - You can refer to the developer's documentation to know what fields the result (= response.Body["data"], non-download file interface) has
        - OapiApi.send, may throw error (= response.Body[code,msg…])
    ```javascript
        
        const OapiApi = require("@larksuiteoapi/api")
        const OapiCore = require("@larksuiteoapi/core")
       
        let conf = xxx //OapiCore.Config
        
        // Sending a message 
        let ctx = new OapiCore.Context()
        let req = OapiApi.newRequest("message/v4/send", "POST", OapiApi.AccessTokenType.Tenant, {
              open_id: "open_id",
              msg_type: "text",
              content: {
                text: "test"
              }
          }, 
        // If app store application, OapiApi.setTenantKey("TenantKey"),
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
        // Upload an image
        let data = fs.readFileSync('./test.png');
        let formData = new OapiApi.FormData()
        formData.setField("image_type", "message")
        // append files, if the interface supports multiple file upload, you can call formData.appendFile many times
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
        
        // Download the image
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
  - Tool
    - Download file (for example: picture)
    ```javascript
        const fs = require("fs")
        const OapiApi = require("@larksuiteoapi/api")
        // Parameter 1: File URL
        // Parameter 2: Request timeout (unit: milliseconds) 
        OapiApi.downloadFile("https://s0.pstatp.com/ee/lark-open/web/static/apply.226f11cb.png", 3000).then(buf => {
            fs.writeFileSync("./test.png", buf)
        })
    ```   
    
## @larksuiteoapi/event

- Processing flow
    - It encapsulates `App Store application` the `app_ticket` event (the event handler needs to be set again), to save it Store, for`@larksuiteoapi/api` use
    - Decryption of event data and verification of source reliability
  - installation
  ```shell script
  $  npm install @larksuiteoapi/event
  ```
 
  - Instructions for use
    - Event monitoring service started
        - [Start with native http server](packages/sample/src/event/httpServer.js)  
        - [Start with Express](packages/sample/src/event/express.js)
    - Set the event handler, for example:
    ```javascript
    
    const OapiEvent = require("@larksuiteoapi/event")
    const conf = xxx //OapiCore.Config
    
    // Processing the "app_status_change" event 
    // If you are processing other events, you only need to modify the "app_status_change". For the fields in the event, please refer to the open platform document 
    OapiEvent.setTypeHandler(conf, "app_status_change", (ctx, event) => {
        let conf = OapiCore.getConfigByCtx(ctx);
        console.log(conf);
        console.log("----------------");
        console.log(ctx.getRequestID());
        console.log(event);
    })
    
    ```
    
## @larksuiteoapi/card

  - installation
  ```shell script
  $  npm install @larksuiteoapi/card
  ```
  - Encapsulated
    - Verification of the validity and source reliability of card data
  - Instructions for use
    - Message card callback service started
        - [Start with native http server](packages/sample/src/card/httpServer.js)  
        - [Start with Express](packages/sample/src/card/express.js)
    - Set the card processor, for example:
    ```javascript
    
    const OapiCard = require("@larksuiteoapi/card")
    const conf = xxx //OapiCore.Config
    
    // handle the message callback cards, card in what fields, please refer to the open platform document
    OapiCard.setHandler(conf, (ctx, card) => {
       let conf = OapiCore.getConfigByCtx(ctx);
       console.log(conf);
       console.log("----------------");
       console.log(ctx.getRequestID());
       console.log(card);
    })
        
    ```
    
    

