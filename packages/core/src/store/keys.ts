const appTicketKeyPrefix = "app_ticket"
const appAccessTokenKeyPrefix = "app_access_token"
const tenantAccessTokenKeyPrefix = "tenant_access_token"

export function getAppTicketKey(appID: string): string {
    return appTicketKeyPrefix + "-" + appID
}

export function getAppAccessTokenKey(appID: string): string {
    return appAccessTokenKeyPrefix + "-" + appID
}

export function getTenantAccessTokenKey(appID: string, tenantKey: string): string {
    return tenantAccessTokenKeyPrefix + "-" + appID + "-" + tenantKey
}
