import type { Logger } from "../app/logger/logger.js";

export class SessionService {
  constructor(private readonly logger: Logger) {}

  async initialize(): Promise<void> {
    this.logger.info("Session service initialized", {
      event: "sessions.initialize",
    });
  }
}