import type { Logger } from "../app/logger.js";

/**
 * Future responsibilities:
 * - create private guide threads
 * - prevent duplicate sessions
 * - track session state
 */
export class GuideSessionService {
  constructor(private readonly logger: Logger) {}

  async initialize(): Promise<void> {
    this.logger.info("Guide session service initialized", {
      event: "session.initialize",
    });
  }
}