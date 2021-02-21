export class GetISVTenantAccessTokenReq {
    app_access_token: string
    tenant_key: string

    constructor(app_access_token: string, tenant_key: string) {
        this.app_access_token = app_access_token
        this.tenant_key = tenant_key
    }
}

export interface TenantAccessToken {
    expire: number
    tenant_access_token: string

    [propName: string]: any
}

export class GetInternalAccessTokenReq {
    app_id: string
    app_secret: string

    constructor(app_id: string, app_secret: string) {
        this.app_id = app_id
        this.app_secret = app_secret
    }
}

export class GetISVAppAccessTokenReq {
    app_id: string
    app_secret: string
    app_ticket: string

    constructor(app_id: string, app_secret: string, app_ticket: string) {
        this.app_id = app_id
        this.app_secret = app_secret
        this.app_ticket = app_ticket
    }
}

export interface AppAccessToken {
    expire: number
    app_access_token: string

    [propName: string]: any
}

export class ApplyAppTicketReq {
    app_id: string
    app_secret: string

    constructor(app_id: string, app_secret: string) {
        this.app_id = app_id
        this.app_secret = app_secret
    }
}