import {AppType} from "../constants/constants";

export interface AppSettingsOpts {
    appID: string
    appSecret: string
    encryptKey?: string
    verificationToken?: string
    helpDeskID?: string
    helpDeskToken?: string
}

export class AppSettings {
    readonly appType: AppType
    readonly appID: string
    readonly appSecret: string
    readonly encryptKey: string
    readonly verificationToken: string
    private readonly helpDeskID: string
    private readonly helpDeskToken: string

    constructor(appType: AppType, opts: AppSettingsOpts) {
        if (!opts.appID || !opts.appSecret) {
            throw new Error("appID or appSecret is empty")
        }
        this.appType = appType
        this.appID = opts.appID
        this.appSecret = opts.appSecret
        this.encryptKey = opts.encryptKey
        this.verificationToken = opts.verificationToken
        this.helpDeskID = opts.helpDeskID
        this.helpDeskToken = opts.helpDeskToken
    }

    helpDeskAuthorization(): string {
        if (this.helpDeskID && this.helpDeskToken) {
            return Buffer.from(this.helpDeskID + ":" + this.helpDeskToken).toString('base64')
        }
        return ""
    }
}

export function newISVAppSettingsWithOpts(opts: AppSettingsOpts): AppSettings {
    return new AppSettings(AppType.ISV, opts)
}

export function newInternalAppSettingsWithOpts(opts: AppSettingsOpts): AppSettings {
    return new AppSettings(AppType.Internal, opts)
}


export function newISVAppSettings(appID: string, appSecret: string, verificationToken: string, encryptKey: string): AppSettings {
    return new AppSettings(AppType.ISV, {
        appID: appID,
        appSecret: appSecret,
        verificationToken: verificationToken,
        encryptKey: encryptKey
    })
}

export function newInternalAppSettings(appID: string, appSecret: string, verificationToken: string, encryptKey: string): AppSettings {
    return new AppSettings(AppType.Internal, {
        appID: appID,
        appSecret: appSecret,
        verificationToken: verificationToken,
        encryptKey: encryptKey
    })
}

export function getISVAppSettingsByEnv(): AppSettings {
    return new AppSettings(AppType.ISV, {
        appID: process.env["APP_ID"] as string,
        appSecret: process.env["APP_SECRET"] as string,
        verificationToken: process.env["VERIFICATION_TOKEN"] as string,
        encryptKey: process.env["ENCRYPT_KEY"] as string,
        helpDeskID: process.env["HELP_DESK_ID"] as string,
        helpDeskToken: process.env["HELP_DESK_TOKEN"] as string
    })
}

export function getInternalAppSettingsByEnv(): AppSettings {
    return new AppSettings(AppType.Internal, {
        appID: process.env["APP_ID"] as string,
        appSecret: process.env["APP_SECRET"] as string,
        verificationToken: process.env["VERIFICATION_TOKEN"] as string,
        encryptKey: process.env["ENCRYPT_KEY"] as string,
        helpDeskID: process.env["HELP_DESK_ID"] as string,
        helpDeskToken: process.env["HELP_DESK_TOKEN"] as string
    })
}

