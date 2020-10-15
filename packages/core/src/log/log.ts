export enum LoggerLevel {
    ERROR = 4,
    WARN = 3,
    INFO = 2,
    DEBUG = 1,
}

export interface Logger {
    debug(...msg: any[]): void;

    info(...msg: any[]): void;

    warn(...msg: any[]): void;

    error(...msg: any[]): void;
}

export class LoggerProxy implements Logger {
    level: LoggerLevel
    logger: Logger

    constructor(level: LoggerLevel, logger: Logger) {
        this.level = level;
        this.logger = logger;
    }

    debug(...msg: any[]): void {
        if (this.level <= LoggerLevel.DEBUG) {
            this.logger.debug("[debug]", ...msg)
        }
    }

    info(...msg: any[]): void {
        if (this.level <= LoggerLevel.INFO) {
            this.logger.info("[info]", ...msg)
        }
    }

    warn(...msg: any[]): void {
        if (this.level <= LoggerLevel.WARN) {
            this.logger.warn("[warn]", ...msg)
        }
    }

    error(...msg: any[]): void {
        if (this.level <= LoggerLevel.ERROR) {
            this.logger.error("[error]", ...msg)
        }
    }

}

export class ConsoleLogger implements Logger {
    debug(...msg: any[]): void {
        console.log(...msg);
    }

    info(...msg: any[]): void {
        console.log(...msg);
    }

    warn(...msg: any[]): void {
        console.log(...msg);
    }

    error(...msg: any[]): void {
        console.log(...msg);
    }
}
