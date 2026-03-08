import type { Logger } from "../app/logger/logger.js";

export class KnowledgeService {
  constructor(private readonly logger: Logger) {}

  async initialize(): Promise<void> {
    this.logger.info("Knowledge service initialized", {
      event: "knowledge.initialize",
      rulesPath: "rules/",
      guidesPath: "guides/",
    });
  }
}