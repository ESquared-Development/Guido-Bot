import type { LogRecord } from "../logger.js";

export function writeConsole(record: LogRecord): void {
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
  }
}