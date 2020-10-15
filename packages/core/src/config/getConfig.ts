import {AppSettings, newInternalAppSettings, newISVAppSettings} from "./settings";
import {Config, newTestConfig} from "./config";
import {Domain} from "../constants/constants";

const domainFeiShuStaging = (): string => {
    return process.env.DomainFeiShuStaging as string
}

const getStagingISVAppSettings = (): AppSettings => {
    return newISVAppSettings(process.env.ISVAppID as string, process.env.ISVAppSecret as string,
        process.env.ISVVerificationToken as string, process.env.ISVEventEncryptKey as string)
}

export const getStagingTestISVConf = (): Config => {
    return newTestConfig(domainFeiShuStaging() as Domain, getStagingISVAppSettings())
}

export const getInternalAppSettings = (): AppSettings => {
    return newInternalAppSettings(process.env.InternalAppID as string, process.env.InternalAppSecret as string,
        process.env.InternalVerificationToken as string, process.env.InternalEventEncryptKey as string)
}

export const getTestInternalConf = (): Config => {
    return newTestConfig(Domain.FeiShu, getInternalAppSettings())
}

export const getISVAppSettings = (): AppSettings => {
    return newISVAppSettings(process.env.ISVAppID as string, process.env.ISVAppSecret as string,
        process.env.ISVVerificationToken as string, process.env.ISVEventEncryptKey as string)
}

export const getTestISVConf = (): Config => {
    return newTestConfig(Domain.FeiShu, getInternalAppSettings())
}



