import type { Client, Message } from "discord.js";
import type { Logger } from "../app/logger.js";
import type { MessageRoutingDecision } from "../types/discord.js";

/**
 * MentionRouter decides whether GUIDO should respond to a given message.
 *
 * In Phase 3, GUIDO responds when:
 * - the bot is mentioned
 * - the user replies directly to one of GUIDO's messages
 *
 * Later phases can extend this for:
 * - private guide threads
 * - dedicated channels
 * - staff override flows
 */
export class MentionRouter {
  constructor(
    private readonly client: Client,
    private readonly logger: Logger,
  ) {}

  async initialize(): Promise<void> {
    this.logger.info("Mention router initialized", {
      event: "mention_router.initialize",
    });
  }

  /**
   * Decide whether a message should trigger a response.
   */
  async route(message: Message): Promise<MessageRoutingDecision> {
    /**
     * Never respond to bots.
     */
    if (message.author.bot) {
      return {
        shouldRespond: false,
        reason: "IGNORED_BOT",
      };
    }

    /**
     * Ignore empty or whitespace-only messages.
     */
    if (!message.content.trim()) {
      return {
        shouldRespond: false,
        reason: "IGNORED_EMPTY",
      };
    }

    /**
     * Mention-based trigger.
     */
    if (this.client.user && message.mentions.has(this.client.user)) {
      return {
        shouldRespond: true,
        reason: "MENTION",
      };
    }

    /**
     * Reply-to-bot trigger.
     *
     * If the message references another message, try to resolve it.
     * If the referenced message was written by GUIDO, continue the conversation.
     */
    if (message.reference?.messageId) {
      try {
        const referenced = await message.fetchReference();

        if (this.client.user && referenced.author.id === this.client.user.id) {
          return {
            shouldRespond: true,
            reason: "REPLY_TO_BOT",
          };
        }
      } catch (error) {
        this.logger.warn("Failed to resolve referenced message during routing", {
          event: "mention_router.fetch_reference_failed",
          messageId: message.id,
          referencedMessageId: message.reference.messageId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return {
      shouldRespond: false,
      reason: "IGNORED_UNMATCHED",
    };
  }

  /**
   * Remove the bot mention from the user's message before sending it to AI.
   *
   * This prevents the model from seeing raw Discord mention markup as part
   * of the question content.
   */
  cleanPromptText(message: Message): string {
    if (!this.client.user) {
      return message.content.trim();
    }

    return message.content
      .replace(new RegExp(`<@!?${this.client.user.id}>`, "g"), "")
      .trim();
  }
}