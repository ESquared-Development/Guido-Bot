import fs from "node:fs";
import path from "node:path";

export type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * Structured log record format.
 */
export interface LogRecord {
  timestamp: string;
  level: LogLevel;
  message: string;
  service?: string;
  event?: string;
  [key: string]: unknown;
}

export interface Logger {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
  child(bindings: Record<string, unknown>): Logger;
}

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const LOG_DIR = path.join(process.cwd(), "data", "logs");

function ensureLogDirectoryExists(): void {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function appendLogToFile(fileName: string, record: LogRecord): void {
  try {
    ensureLogDirectoryExists();
    const filePath = path.join(LOG_DIR, fileName);
    fs.appendFileSync(filePath, JSON.stringify(record) + "\n", "utf8");
  } catch (error) {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "error",
        event: "logger.file_write_failed",
        message: "Failed to write to log file",
        fileName,
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }
}

function writeRecordToConsole(record: LogRecord): void {
  const line = JSON.stringify(record);

  switch (record.level) {
    case "error":
      console.error(line);
      break;
    case "warn":
      console.warn(line);
      break;
    default:
      console.log(line);
      break;
  }
}

function writeRecordToFiles(record: LogRecord): void {
  appendLogToFile("app.log", record);

  if (record.level === "error") {
    appendLogToFile("error.log", record);
  }

  if (typeof record.event === "string" && record.event.startsWith("audit.")) {
    appendLogToFile("audit.log", record);
  }

  if (typeof record.event === "string" && record.event.startsWith("session.")) {
    appendLogToFile("sessions.log", record);
  }

  if (typeof record.event === "string" && record.event.startsWith("usage.")) {
    appendLogToFile("usage.log", record);
  }
}

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
    if ((LEVEL_PRIORITY[level] ?? 0) < (LEVEL_PRIORITY[this.minLevel] ?? 0)) {
      return;
    }

    const record: LogRecord = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...this.bindings,
      ...(meta ?? {}),
    };

    writeRecordToConsole(record);
    writeRecordToFiles(record);
  }
}

export function createLogger(level: LogLevel): Logger {
  return new GuidoLogger(level);
}