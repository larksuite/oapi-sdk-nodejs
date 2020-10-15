import * as common from "@larksuiteoapi/core";
import {
    AppAccessToken,
    GetInternalAccessTokenReq,
    GetISVAppAccessTokenReq,
    GetISVTenantAccessTokenReq,
    TenantAccessToken
} from "../token/token";
import * as request from "../request/request"
import {handle} from "./handlers";
import * as util from "util"
import {Request} from "../request/request";
import {URL} from "../constants/constants";
import {
    getAppAccessTokenKey,
    getAppTicketKey,
    AppType,
    getConfigByCtx,
    getTenantAccessTokenKey
} from "@larksuiteoapi/core";
import {throwAppTicketIsEmptyErr} from "../errors/errors";

const expiryDelta = 3 * 60

const send = async <T>(ctx: common.Context, req: Request<T>) => {
    let t = await handle(ctx, req)
    if (req.err) {
        throw req.err
    }
    return t
}

// get internal app access token
export const getInternalAppAccessToken = async (ctx: common.Context) => {
    let accessToken: AppAccessToken
    let conf = getConfigByCtx(ctx)
    let req = request.newRequestByAuth(URL.AppAccessTokenInternalUrlPath, "POST",
        new GetInternalAccessTokenReq(conf.getAppSettings().appID, conf.getAppSettings().appSecret), accessToken)
    return await send(ctx, req)
}

// get internal tenant access token
export const getInternalTenantAccessToken = async (ctx: common.Context) => {
    let accessToken: TenantAccessToken
    let conf = getConfigByCtx(ctx)
    let req = request.newRequestByAuth(URL.TenantAccessTokenInternalUrlPath, "POST",
        new GetInternalAccessTokenReq(conf.getAppSettings().appID, conf.getAppSettings().appSecret), accessToken)
    return await send(ctx, req)
}

const getAppTicket = async (ctx: common.Context) => {
    let conf = getConfigByCtx(ctx)
    return conf.getStore().get(getAppTicketKey(conf.getAppSettings().appID))
}

// get isv app access token
export const getIsvAppAccessToken = async (ctx: common.Context) => {
    let appTicket = await getAppTicket(ctx)
    if (!appTicket) {
        throwAppTicketIsEmptyErr()
    }
    let accessToken: AppAccessToken
    let conf = getConfigByCtx(ctx)
    let req = request.newRequestByAuth(URL.AppAccessTokenIsvUrlPath, "POST",
        new GetISVAppAccessTokenReq(conf.getAppSettings().appID, conf.getAppSettings().appSecret, appTicket), accessToken)
    return await send(ctx, req)
}

export const setAppAccessTokenToStore = async (ctx: common.Context, appAccessToken: AppAccessToken) => {
    let conf = getConfigByCtx(ctx)
    try {
        await conf.getStore().put(getAppAccessTokenKey(conf.getAppSettings().appID), appAccessToken.app_access_token, appAccessToken.expire - expiryDelta)
    } catch (e) {
        conf.getLogger().error(e)
    }
}

// get isv tenant access token
export const getIsvTenantAccessToken = async (ctx: common.Context) => {
    let appAccessToken = await getIsvAppAccessToken(ctx)
    let info = request.getInfoByCtx(ctx)
    let tenantAccessToken: TenantAccessToken
    let req = request.newRequestByAuth(URL.TenantAccessTokenIsvUrlPath, "POST",
        new GetISVTenantAccessTokenReq(appAccessToken.app_access_token, info.tenantKey), tenantAccessToken)
    tenantAccessToken = await send(ctx, req)
    let res: [AppAccessToken, TenantAccessToken] = [appAccessToken, tenantAccessToken]
    return res
}

export const setTenantAccessTokenToStore = async (ctx: common.Context, tenantAccessToken: TenantAccessToken) => {
    let conf = getConfigByCtx(ctx)
    let info = request.getInfoByCtx(ctx)
    try {
        await conf.getStore().put(getTenantAccessTokenKey(conf.getAppSettings().appID, info.tenantKey),
            tenantAccessToken.tenant_access_token, tenantAccessToken.expire - expiryDelta)
    } catch (e) {
        conf.getLogger().error(e)
    }
}

const setAuthorizationToHeader = (headers: {}, token: string): void => {
    headers["Authorization"] = util.format("Bearer %s", token)
}

export const setAppAccessToken = async (ctx: common.Context, headers: {}) => {
    let conf = getConfigByCtx(ctx)
    let info = request.getInfoByCtx(ctx)
    // from store get app access token
    if (!info.retryable) {
        let tok = await conf.getStore().get(getAppAccessTokenKey(conf.getAppSettings().appID))
        if (tok) {
            setAuthorizationToHeader(headers, tok)
            return
        }
    }
    let appAccessToken: AppAccessToken
    if (conf.getAppSettings().appType == AppType.Internal) {
        appAccessToken = await getInternalAppAccessToken(ctx)
    } else {
        appAccessToken = await getIsvAppAccessToken(ctx)
    }
    await setAppAccessTokenToStore(ctx, appAccessToken)
    setAuthorizationToHeader(headers, appAccessToken.app_access_token)
}

export const setTenantAccessToken = async (ctx: common.Context, headers: {}) => {
    let conf = getConfigByCtx(ctx)
    let info = request.getInfoByCtx(ctx)
    // from store get tenant access token
    if (!info.retryable) {
        let tenantKey = info.tenantKey || ""
        let tok = await conf.getStore().get(getTenantAccessTokenKey(conf.getAppSettings().appID, tenantKey))
        if (tok) {
            setAuthorizationToHeader(headers, tok)
            return
        }
    }
    if (conf.getAppSettings().appType == AppType.Internal) {
        let tenantAccessToken = await getInternalTenantAccessToken(ctx)
        await setTenantAccessTokenToStore(ctx, tenantAccessToken)
        setAuthorizationToHeader(headers, tenantAccessToken.tenant_access_token)
    } else {
        let accessToken = await getIsvTenantAccessToken(ctx)
        await setAppAccessTokenToStore(ctx, accessToken[0])
        await setTenantAccessTokenToStore(ctx, accessToken[1])
        setAuthorizationToHeader(headers, accessToken[1].tenant_access_token)
    }
}

export const setUserAccessToken = async (ctx: common.Context, headers: {}) => {
    let info = request.getInfoByCtx(ctx)
    if (info.userAccessToken) {
        setAuthorizationToHeader(headers, info.userAccessToken)
        return
    }
}