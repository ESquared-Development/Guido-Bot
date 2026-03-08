import type { Logger } from "../app/logger.js";

export class IdleSessionService {
  constructor(private readonly logger: Logger) {}

  async initialize(): Promise<void> {
    this.logger.info("Idle session service initialized", {
      event: "services.idle_session.initialize",
    });
  }
}