const lark = require("@larksuiteoapi/allcore");

const appSettings = lark.newInternalAppSettings({
    appID: "App ID",
    appSecret: "App Secret",
    helpDeskID: "HelpDesk ID",
    helpDeskToken: "HelpDesk Token",
})

const conf = lark.newConfig(lark.Domain.FeiShu, appSettings, {loggerLevel: lark.LoggerLevel.DEBUG})

console.log(conf.getHelpDeskAuthorization())

let req = lark.api.newRequest("/open-apis/helpdesk/v1/tickets/6971250929135779860", "GET", lark.api.AccessTokenType.Tenant, null)
req.setTimeoutOfMs(6000)
req.setNeedHelpDeskAuth()

lark.api.sendRequest(conf, req).then(resp => {
    console.log(resp.getHeader())
    console.log(resp.getRequestID())
    console.log(resp.getHTTPStatusCode())
    console.log(resp) // r = response.body
}).catch(e => {
    console.log(e)
})