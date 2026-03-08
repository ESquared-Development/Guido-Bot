import fs from "node:fs";
import path from "node:path";
import type { Logger } from "../app/logger.js";
import type { AIUsageRecord } from "../types/ai.js";

/**
 * Simple JSON-backed usage tracker.
 *
 * Phase 1 uses a file-based implementation because:
 * - it is easy to inspect manually
 * - it is easy to back up
 * - it is enough until traffic grows
 *
 * Later we can move this to SQLite or another persistent store.
 */
export class UsageTracker {
  private readonly usageFilePath: string;

  constructor(private readonly logger: Logger) {
    this.usageFilePath = path.join(process.cwd(), "data", "usage", "ai-usage.json");
  }

  async initialize(): Promise<void> {
    const usageDir = path.dirname(this.usageFilePath);

    if (!fs.existsSync(usageDir)) {
      fs.mkdirSync(usageDir, { recursive: true });
    }

    if (!fs.existsSync(this.usageFilePath)) {
      fs.writeFileSync(this.usageFilePath, "[]", "utf8");
    }

    this.logger.info("Usage tracker initialized", {
      event: "usage.initialize",
      usageFilePath: this.usageFilePath,
    });
  }

  async getAllRecords(): Promise<AIUsageRecord[]> {
    const raw = fs.readFileSync(this.usageFilePath, "utf8");
    const parsed = JSON.parse(raw) as AIUsageRecord[];
    return parsed;
  }

  async appendRecord(record: AIUsageRecord): Promise<void> {
    const records = await this.getAllRecords();
    records.push(record);

    fs.writeFileSync(this.usageFilePath, JSON.stringify(records, null, 2), "utf8");

    this.logger.info("Recorded AI usage entry", {
      event: "usage.recorded",
      requestId: record.requestId,
      model: record.model,
      estimatedInputTokens: record.estimatedInputTokens,
      maxOutputTokens: record.maxOutputTokens,
      estimatedCostUsd: record.estimatedCostUsd,
      sessionId: record.sessionId ?? null,
      channelId: record.channelId ?? null,
      guildId: record.guildId ?? null,
      userId: record.userId ?? null,
    });
  }
}