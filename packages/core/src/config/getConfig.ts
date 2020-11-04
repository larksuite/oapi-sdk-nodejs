import {AppSettings, newInternalAppSettings, newISVAppSettings} from "./settings";
import {Config, newTestConfig} from "./config";
import {Domain} from "../constants/constants";

const domainFeiShu = (env: string): string => {
    return process.env[env + "_FEISHU_DOMAIN"] as string
}

const getISVAppSettings = (env: string): AppSettings => {
    return newISVAppSettings(process.env[env + "_ISV_APP_ID"] as string, process.env[env + "_ISV_APP_SECRET"] as string,
        process.env[env + "_ISV_VERIFICATION_TOKEN"] as string, process.env[env + "_ISV_ENCRYPT_KEY"] as string)
}

const getInternalAppSettings = (env: string): AppSettings => {
    return newInternalAppSettings(process.env[env + "_INTERNAL_APP_ID"] as string, process.env[env + "_INTERNAL_APP_SECRET"] as string,
        process.env[env + "_INTERNAL_VERIFICATION_TOKEN"] as string, process.env[env + "_INTERNAL_ENCRYPT_KEY"] as string)
}

const getDomain = (env: string): Domain => {
    if (env != "STAGING" && env != "PRE" && env != "ONLINE") {
        throw new Error("env must in [staging, pre, online]")
    }
    if (env == "ONLINE") {
        return Domain.FeiShu
    }
    return domainFeiShu(env) as Domain
}

export const getTestISVConf = (env: string): Config => {
    env = env.toUpperCase();
    return newTestConfig(getDomain(env), getISVAppSettings(env))
}

export const getTestInternalConf = (env: string): Config => {
    env = env.toUpperCase();
    return newTestConfig(getDomain(env), getInternalAppSettings(env))
}








