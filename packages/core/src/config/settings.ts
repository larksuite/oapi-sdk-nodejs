import {AppType} from "../constants/constants";


export class AppSettings {
    readonly appType: AppType
    readonly appID: string
    readonly appSecret: string

    readonly encryptKey: string
    readonly verificationToken: string

    constructor(appType: AppType, appID: string, appSecret: string, encryptKey: string, verificationToken: string) {
        if (!appID || !appSecret) {
            throw new Error("appID or appSecret is empty")
        }
        this.appType = appType
        this.appID = appID
        this.appSecret = appSecret
        this.encryptKey = encryptKey
        this.verificationToken = verificationToken
    }

}

export function newISVAppSettings(appID: string, appSecret: string, verificationToken: string, encryptKey: string): AppSettings {
    return new AppSettings(AppType.ISV, appID, appSecret, encryptKey, verificationToken)

}

export function newInternalAppSettings(appID: string, appSecret: string, verificationToken: string, encryptKey: string): AppSettings {
    return new AppSettings(AppType.Internal, appID, appSecret, encryptKey, verificationToken)
}

