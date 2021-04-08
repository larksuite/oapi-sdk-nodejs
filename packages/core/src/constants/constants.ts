export const ContentType = "Content-Type"
export const ContentTypeJson = "application/json"
export const DefaultContentType = ContentTypeJson + "; charset=utf-8"

export const HTTPHeaderKey = "HTTP-Header"
export const HTTPHeaderKeyRequestID = "X-Request-Id"
export const HTTPHeaderKeyLogID = "X-Tt-Logid"
export const HTTPKeyStatusCode = "http_status_code"


export enum AppType {
    ISV = "isv",
    Internal = "internal"
}

export enum Domain {
    FeiShu = "https://open.feishu.cn",
    LarkSuite = "https://open.larksuite.com",
}

export enum CallbackType {
    Event = "event_callback",
    Challenge = "url_verification"
}
