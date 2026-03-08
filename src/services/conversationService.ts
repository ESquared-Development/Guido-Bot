import type { Logger } from "../app/logger.js";

/**
 * Future responsibilities:
 * - build prompts
 * - call OpenAI
 * - apply request limits
 * - honor budget policy
 * - log usage
 */
export class ConversationService {
  constructor(private readonly logger: Logger) {}

  async initialize(): Promise<void> {
    this.logger.info("Conversation service initialized", {
      event: "conversation.initialize",
    });
  }
}