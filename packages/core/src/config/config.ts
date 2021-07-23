import {Domain} from "../constants/constants";
import {ConsoleLogger, Logger, LoggerLevel, LoggerProxy} from "../log/log";
import {DefaultStore, Store} from "../store/store";
import {AppSettings} from "./settings";
import {Context} from "../context";

const ctxKeyConfig = "ctxKeyConfig"

export interface ConfigOpts {
    logger?: Logger
    loggerLevel?: LoggerLevel
    store?: Store
}

export class Config {
    private readonly domain: Domain
    private readonly logger: Logger
    private readonly store: Store
    private readonly appSettings: AppSettings
    private readonly helpDeskAuthorization: string

    constructor(domain: Domain, appSettings: AppSettings, opts: ConfigOpts) {
        const loggerLevel = opts.loggerLevel ? opts.loggerLevel : LoggerLevel.ERROR
        const logger = opts.logger ? opts.logger : new ConsoleLogger()
        const store = opts.store ? opts.store : new DefaultStore()
        this.domain = domain
        this.appSettings = appSettings
        this.logger = new LoggerProxy(loggerLevel, logger)
        this.store = store
        this.helpDeskAuthorization = appSettings.helpDeskAuthorization()
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

    getHelpDeskAuthorization(): string {
        return this.helpDeskAuthorization
    }

}

export function newTestConfig(domain: Domain, appSettings: AppSettings): Config {
    return newConfig(domain, appSettings, new ConsoleLogger(), LoggerLevel.DEBUG, new DefaultStore())
}

export function newConfigWithOpts(domain: Domain, appSettings: AppSettings, opts: ConfigOpts): Config {
    opts = opts ? opts : {}
    return new Config(domain, appSettings, opts)
}

export function newConfig(domain: Domain, appSettings: AppSettings, logger: Logger, loggerLevel: LoggerLevel,
                          store: Store): Config {
    return new Config(domain, appSettings, {
        loggerLevel: loggerLevel,
        logger: logger,
        store: store
    })
}

export function getConfigByCtx(ctx: Context): Config {
    return ctx.get(ctxKeyConfig)
}