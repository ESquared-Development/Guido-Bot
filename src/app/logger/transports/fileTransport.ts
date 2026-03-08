import fs from "node:fs";
import path from "node:path";
import type { LogRecord } from "../logger.js";

const LOG_DIR = path.join(process.cwd(), "data", "logs");

function ensureLogDir(): void {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function write(file: string, record: LogRecord): void {
  ensureLogDir();

  const line = JSON.stringify(record) + "\n";
  const filepath = path.join(LOG_DIR, file);

  fs.appendFile(filepath, line, (err) => {
    if (err) {
      console.error("Failed to write log file", err);
    }
  });
}

export function writeFileLogs(record: LogRecord): void {
  write("app.log", record);

  if (record.level === "error") {
    write("error.log", record);
  }

  if (record.event?.startsWith("session.")) {
    write("sessions.log", record);
  }

  if (record.event?.startsWith("audit.")) {
    write("audit.log", record);
  }
}