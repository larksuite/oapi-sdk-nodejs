export const OAPIRootPath = "open-apis"

export enum URL {
    AppAccessTokenInternalUrlPath = "auth/v3/app_access_token/internal",
    AppAccessTokenIsvUrlPath = "auth/v3/app_access_token",
    TenantAccessTokenInternalUrlPath = "auth/v3/tenant_access_token/internal",
    TenantAccessTokenIsvUrlPath = "auth/v3/tenant_access_token",
    ApplyAppTicketPath = "auth/v3/app_ticket/resend"
}

export enum UserIDType {
    Open = "open_id",
    Union = "union_id",
    User = "user_id"
}
