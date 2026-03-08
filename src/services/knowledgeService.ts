import type { Logger } from "../app/logger.js";

/**
 * Future responsibilities:
 * - load rules/ and guides/
 * - chunk docs
 * - retrieve relevant sections
 * - generate citations
 */
export class KnowledgeService {
  constructor(private readonly logger: Logger) {}

  async initialize(): Promise<void> {
    this.logger.info("Knowledge service initialized", {
      event: "knowledge.initialize",
      rulesDirectory: "rules/",
      guidesDirectory: "guides/",
    });
  }
}