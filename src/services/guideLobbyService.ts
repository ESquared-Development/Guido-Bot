import type { Logger } from "../app/logger.js";

/**
 * Future responsibilities:
 * - manage #city-guide intake message
 * - handle Chat with GUIDO button
 */
export class GuideLobbyService {
  constructor(private readonly logger: Logger) {}

  async initialize(): Promise<void> {
    this.logger.info("Guide lobby service initialized", {
      event: "guide_lobby.initialize",
    });
  }
}