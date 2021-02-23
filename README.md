[**中文**](README.zh.md)

# larksuit open api sdk

| Module    | description |     
|--------------|--------------|
|  core    | Application information configuration and some general methods  | 
|  api     | Request the API of larksuite/feishu  | 
|  event   | Monitor the business data of larksuite/feishu changes and events generated |  
|  card    | Monitor the actions of message card interaction  |  
|  sample  | Example |   

## installation

```shell script
  npm i @larksuiteoapi/allcore
```

## core

- Instructions for use
    - Get application configuration
        - Provides [code samples to](packages/sample/src/config/config.ts) facilitate development
            - Use redis to implement Store interface for maintenance `app_access_token`、`tenant_access_token` life cycle
        - Instructions for the method are as follows:
    ```javascript
      
      const lark = require("@larksuiteoapi/allcore")
  
      // Create application configuration to prevent leakage. It is recommended to put application information in environment variables. 
      // appID: App ID in the application credential 
      // appSecret: App Secret in the application credential 
      // verificationToken: Verification Token in the event subscription 
      // encryptKey: Encrypt Key in the event subscription, can be "", indicating that the event content is not Encryption 
      // Settings of enterprise self-built apps
      let appSettings = lark.core.newInternalAppSettings("[appID]", "[appSecret]", "[verificationToken]", "[encryptKey]")
      // Settings of app store apps
      let appSettings = lark.core.newISVAppSettings("[appID]", "[appSecret]", "[verificationToken]", "[encryptKey]")
      
      
      // Create Config 
      // domain: domain name http address: lark.core.Domain.FeiShu/lark.core.Domain.LarkSuite 
      // appSettings: application configuration 
      // logger: [log interface](packages/core/src/log/log.ts) 
      // loggerLevel: output log level lark.core.LoggerLevel.DEBUG/INFO/WARN/ERROR (packages/core/src/log/log.ts) 
      // store: [Store interface](packages/core/src/store/store .ts), used to store app_ticket/app_access_token/tenant_access_token 
      // for online config
      let conf = lark.core.newConfig(domain,appSettings,logger,loggerLevel,store)    
      
      // Config for development and testing 
      // logger: use the default implementation (packages/core/src/log/log.ts) 
      // loggerLevel: Debug level 
      // store: use the default implementation (Map)
      let conf = lark.core.newTestConfig(domain, appSettings)
      
    ```

  ## api

    - Processing flow
        - For `app_access_token`、`tenant_access_token`maintain the life cycle of acquisition and made a package, **developers can directly access the service API**
          ![Processing flow](api_process.jpg)

    - Instructions for use
        - For `App Store application`, when acquiring `app_access_token` , you need `app_ticket` to start the event
          subscription service
        - The package request is as follows:
          ```javascript
          
            const lark = require("@larksuiteoapi/allcore")
                
            // Create request 
            // httpPath: (path after `open-apis/`) API path, for example: https://{domain}/open-apis/authen/v1/user_info, the httpPath: "authen/v1/user_info" 
            // httpMethod: GET/POST/PUT/BATCH/DELETE 
            // accessTokenType: What kind of token access the API uses, value range: lark.api.AccessTokenType.App/Tenant/User, for example: lark.api.AccessTokenType.Tenant 
            // input : The request body (may be formdata (for example: file upload)), if the request body is not needed (for example, some GET requests), pass: undefined 
            // optFns: extension function, some infrequently used parameter packages, as follows: 
                // lark.api.setPathParams({"user_id":4}): Set the URL Path parameter (with: prefix) value, when httpPath="users/:user_id", the requested URL="https://{domain}/open-apis/users/4" 
                // lark.api.setQueryParams({"age":4,"types":[1,2]}): Set the URL qeury, it will be appended to the url?age=4&types=1&types=2 
                // lark.api.setTimeoutOfMs(1000), set the http request, timeout time in milliseconds 
                // lark.api.setIsResponseStream(), set whether the response is a stream, such as downloading a file, at this time: the output value is of Buffer type
                // lark.api.setIsNotDataField (), set up in response to whether or not `data` field service interface are all` data` field, there is no need to set 
                // lark.api.setTenantKey("TenantKey"), to `` ISV application status, indication `tenant_access_token` access API, you need to set 
                // lark.api.setUserAccessToken("UserAccessToken"), represents the use of` user_access_token` access API, you need to set 
            let req = lark.api.newRequest(httpPath: string, httpMethod: string, accessTokenType: AccessTokenType, input: any, ...optFns: OptFn[]))
              
          ```
        - Send the request as follows:
            - You can refer to the developer's documentation to know what fields the result (=http response body,
              non-download file interface) has
            - lark.api.send, may throw error
      ```javascript
          
          const lark = require("@larksuiteoapi/allcore")
         
          let conf = xxx //lark.core.Config
          
          // Sending a message 
          let req = lark.api.newRequest("message/v4/send", "POST", lark.api.AccessTokenType.Tenant, {
                open_id: "open_id",
                msg_type: "text",
                content: {
                  text: "test"
                }
            }, 
          // If app is ISV, lark.api.setTenantKey("TenantKey"),
          )
          lark.api.sendRequest(conf, req).then(resp => {
              console.log(resp.getRequestID())
              console.log(resp.getHTTPStatusCode())
              console.log(resp)
          }).catch(e => {
              console.error(e)
          })
      
      
          const fs = require("fs")
          // Upload an image
          // use stream
          // let data = fs.createReadStream('./test.png');
          // use byte[]
          let data = fs.readFileSync('./test.png');
          let formData = new lark.api.FormData()
          formData.addField("image_type", "message")
          // add file, if the interface supports multiple file upload, you can call formData.addFile many times
          formData.addFile("image", new lark.api.File().setContent(data).setType("image/jpeg"))
          let req = lark.api.newRequest("image/v4/put", "POST", lark.api.AccessTokenType.Tenant, formData)
          lark.api.sendRequest(conf, req).then(resp=>{
              console.log(resp.getRequestID())
              console.log(resp.getHTTPStatusCode())
              console.log(resp)
          }).catch(e => {
              console.error(e)
          })
          
          // Download the image
          let queryParams = {
              image_key: "img_xxxxxxxxxxxxxxxxxx"
          }
          let req = lark.api.newRequest("image/v4/get", "GET",
              lark.api.AccessTokenType.Tenant, undefined, lark.api.setQueryParams(queryParams), lark.api.setIsResponseStream())
          lark.api.send(conf, req).then(resp=>{
              console.log(resp.getRequestID())
              console.log(resp.getHTTPStatusCode())
              fs.writeFileSync("./test.0.png", resp.data)
          }).catch(e => {
              console.error(e)
          })
          
      ```
        - batch request call
            - [code sample](https://github.com/larksuite/oapi-sdk-nodejs/blob/main/packages/sample/src/api/batchReqCall.js)
    - Tool
        - Download file (for example: picture)
      ```javascript
          const fs = require("fs")
          const lark = require("@larksuiteoapi/allcore")
          // Parameter 1: File URL
          // Parameter 2: Request timeout (unit: milliseconds) 
          lark.api.downloadFile("https://s0.pstatp.com/ee/lark-open/web/static/apply.226f11cb.png", 3000).then(buf => {
              fs.writeFileSync("./test.png", buf)
          })
      ```   

## event

- Processing flow
    - It encapsulates `App Store application(ISV)` the `app_ticket` event (the event handler needs to be set again), to
      save it Store
    - Decryption of event data and verification of source reliability

    - Instructions for use
        - Event monitoring service started
            - [Start with native http server](packages/sample/src/event/httpServer.js)
            - [Start with Express](packages/sample/src/event/express.js)
        - Set the event handler, for example:
      ```javascript
      
      const lark = require("@larksuiteoapi/coreall")
      const conf = xxx //lark.core.Config
      
      // Processing the "app_status_change" event 
      // If you are processing other events, you only need to modify the "app_status_change". For the fields in the event, please refer to the open platform document 
      lark.event.setTypeHandler(conf, "app_status_change", (ctx, event) => {
          let conf = lark.core.getConfigByCtx(ctx);
          console.log(conf);
          console.log("----------------");
          console.log(ctx.getRequestID());
          console.log(event);
      })
      
      ```

## card

- Encapsulated
    - Verification of the validity and source reliability of card data
- Instructions for use
    - Message card callback service started
        - [Start with native http server](packages/sample/src/card/httpServer.js)
        - [Start with Express](packages/sample/src/card/express.js)
    - Set the card processor, for example:
  ```javascript
  
  const lark = require("@larksuiteoapi/allcore")
  const conf = xxx //lark.core.Config
  
  // handle the message callback cards, card in what fields, please refer to the open platform document
  lark.card.setHandler(conf, (ctx, card) => {
     let conf = lark.core.getConfigByCtx(ctx);
     console.log(conf);
     console.log("----------------");
     console.log(ctx.getRequestID());
     console.log(card.action);
  })
      
  ```
    
    

