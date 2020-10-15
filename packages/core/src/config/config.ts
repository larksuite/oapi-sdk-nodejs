import {Domain} from "../constants/constants";
import {ConsoleLogger, Logger, LoggerLevel, LoggerProxy} from "../log/log";
import {DefaultStore, Store} from "../store/store";
import {AppSettings} from "./settings";
import {Context} from "../context";

const ctxKeyConfig = "ctxKeyConfig"

export class Config {
    private readonly domain: Domain
    private readonly logger: Logger
    private readonly store: Store
    private readonly appSettings: AppSettings

    constructor(domain: Domain, appSettings: AppSettings, logger: Logger, loggerLevel: LoggerLevel, store: Store) {
        this.domain = domain
        this.appSettings = appSettings
        this.store = store
        this.logger = new LoggerProxy(loggerLevel, logger)
    }

    withContext(ctx: Context): void {
        ctx.set(ctxKeyConfig, this)
    }

    getDomain(): Domain {
        return this.domain
    }

    getAppSettings(): AppSettings {
        return this.appSettings
    }

    getLogger(): Logger {
        return this.logger
    }

    getStore(): Store {
        return this.store
    }

}

export function newTestConfig(domain: Domain, appSettings: AppSettings): Config {
    return newConfig(domain, appSettings, new ConsoleLogger(), LoggerLevel.DEBUG, new DefaultStore())
}

export function newConfig(domain: Domain, appSettings: AppSettings, logger: Logger, loggerLevel: LoggerLevel, store: Store): Config {
    return new Config(domain, appSettings, logger, loggerLevel, store)
}

export function getConfigByCtx(ctx: Context): Config {
    return ctx.get(ctxKeyConfig)
}