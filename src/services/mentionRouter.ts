import type { Logger } from "../app/logger.js";

export class MentionRouter {
  constructor(private readonly logger: Logger) {}

  async initialize(): Promise<void> {
    this.logger.info("Mention router initialized", {
      event: "services.mention_router.initialize",
    });
  }
}