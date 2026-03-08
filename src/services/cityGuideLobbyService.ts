import type { Logger } from "../app/logger.js";

export class CityGuideLobbyService {
  constructor(private readonly logger: Logger) {}

  async initialize(): Promise<void> {
    this.logger.info("City guide lobby service initialized", {
      event: "services.city_guide_lobby.initialize",
    });
  }
}