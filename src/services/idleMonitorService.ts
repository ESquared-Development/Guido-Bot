import type { Logger } from "../app/logger.js";

/**
 * Future responsibilities:
 * - track idle sessions
 * - send follow-up prompts
 * - support keep-open and close actions
 */
export class IdleMonitorService {
  constructor(private readonly logger: Logger) {}

  async initialize(): Promise<void> {
    this.logger.info("Idle monitor service initialized", {
      event: "idle_monitor.initialize",
    });
  }
}