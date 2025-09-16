export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

export interface LoggerConfig {
  level: LogLevel;
  prefix?: string;
  timestamp?: boolean;
}

import config from "@/app/config/config";

export class Logger {
  private config: LoggerConfig;

  constructor(loggerConfig: Partial<LoggerConfig> = {}) {
    const envLogLevel = this.parseLogLevel(config.logLevel);

    this.config = {
      level: envLogLevel ?? LogLevel.INFO,
      prefix: loggerConfig.prefix || "",
      timestamp: loggerConfig.timestamp ?? true,
      ...loggerConfig,
    };
  }

  private parseLogLevel(level: string | undefined): LogLevel | null {
    if (!level) return null;

    const normalizedLevel = level.toUpperCase();
    switch (normalizedLevel) {
      case "DEBUG":
        return LogLevel.DEBUG;
      case "INFO":
        return LogLevel.INFO;
      case "WARN":
      case "WARNING":
        return LogLevel.WARN;
      case "ERROR":
        return LogLevel.ERROR;
      case "NONE":
      case "SILENT":
        return LogLevel.NONE;
      default:
        return null;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  private formatMessage(level: string, message: string): string {
    const parts = [];

    if (this.config.timestamp) {
      parts.push(`[${new Date().toISOString()}]`);
    }

    parts.push(`[${level}]`);

    if (this.config.prefix) {
      parts.push(`[${this.config.prefix}]`);
    }

    parts.push(message);

    return parts.join(" ");
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage("DEBUG", message), ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage("INFO", message), ...args);
    }
  }

  log(message: string, ...args: unknown[]): void {
    this.info(message, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage("WARN", message), ...args);
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage("ERROR", message), ...args);
    }
  }

  // Create a child logger with additional prefix
  child(prefix: string): Logger {
    const childPrefix = this.config.prefix
      ? `${this.config.prefix}:${prefix}`
      : prefix;

    return new Logger({
      ...this.config,
      prefix: childPrefix,
    });
  }

  // Update log level at runtime
  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  getLevel(): LogLevel {
    return this.config.level;
  }
}

// Create default logger instance
export const logger = new Logger();

// Create convenience method for creating module-specific loggers
export function createLogger(prefix: string): Logger {
  return logger.child(prefix);
}
