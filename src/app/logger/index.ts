import { writeConsole } from "./transports/consoleTransport.js";
import { writeFileLogs } from "./transports/fileTransport.js";
import type { LogRecord, Logger, LogLevel } from "./logger.js";

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

class GuidoLogger implements Logger {
  constructor(
    private readonly minLevel: LogLevel,
    private readonly bindings: Record<string, unknown> = {},
  ) {}

  debug(message: string, meta?: Record<string, unknown>): void {
    this.write("debug", message, meta);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.write("info", message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.write("warn", message, meta);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.write("error", message, meta);
  }

  child(bindings: Record<string, unknown>): Logger {
    return new GuidoLogger(this.minLevel, {
      ...this.bindings,
      ...bindings,
    });
  }

  private write(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[this.minLevel]) {
      return;
    }

    const record: LogRecord = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...this.bindings,
      ...(meta ?? {}),
    };

    writeConsole(record);
    writeFileLogs(record);
  }
}

export function createLogger(level: LogLevel): Logger {
  return new GuidoLogger(level);
}