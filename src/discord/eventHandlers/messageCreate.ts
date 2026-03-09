import { Events, Message } from "discord.js";
import type { Client } from "discord.js";
import type { Logger } from "../../app/logger.js";
import type { MentionRouter } from "../../services/mentionRouter.js";
import type { ConversationService } from "../../services/conversationService.js";

/**
 * Register the Discord messageCreate event.
 *
 * Phase 3 behavior:
 * - ignore bot-authored messages
 * - respond to mentions
 * - respond to replies to GUIDO
 * - generate grounded answers from rules/guides
 */
export function registerMessageCreateHandler(
  client: Client,
  logger: Logger,
  mentionRouter: MentionRouter,
  conversationService: ConversationService,
): void {
  client.on(Events.MessageCreate, async (message: Message) => {
    /**
     * Fast ignore for bot messages.
     */
    if (message.author.bot) {
      logger.debug("Ignored bot-authored message", {
        event: "discord.message.ignored_bot",
        messageId: message.id,
        authorId: message.author.id,
        channelId: message.channelId,
      });
      return;
    }

    const routingDecision = await mentionRouter.route(message);

    logger.debug("Message routing decision computed", {
      event: "discord.message.routed",
      messageId: message.id,
      guildId: message.guildId ?? null,
      channelId: message.channelId,
      authorId: message.author.id,
      shouldRespond: routingDecision.shouldRespond,
      reason: routingDecision.reason,
    });

    if (!routingDecision.shouldRespond) {
      return;
    }

    /**
     * Remove the mention markup if present and normalize the user question.
     */
    const cleanedQuestion = mentionRouter.cleanPromptText(message);

    if (!cleanedQuestion) {
      await message.reply(
        "You rang? Toss me a question and I'll check the city records.",
      );
      return;
    }

    try {
      /**
       * Send a typing indicator so the interaction feels responsive.
       */
      await message.channel.sendTyping();

      const result = await conversationService.generateReply({
        userQuestion: cleanedQuestion,
        guildId: message.guildId ?? undefined,
        channelId: message.channelId,
        userId: message.author.id,
      });

      await message.reply(result.replyText);

      logger.info("GUIDO replied to message", {
        event: "discord.message.replied",
        messageId: message.id,
        guildId: message.guildId ?? null,
        channelId: message.channelId,
        authorId: message.author.id,
        requestId: result.requestId,
        blockedByBudget: result.blockedByBudget,
      });
    } catch (error) {
      logger.error("Failed to process mention-based conversation", {
        event: "discord.message.reply_failed",
        messageId: message.id,
        guildId: message.guildId ?? null,
        channelId: message.channelId,
        authorId: message.author.id,
        error: error instanceof Error ? error.message : String(error),
      });

      await message.reply(
        "GUIDO hit a municipal paperwork jam while processing that request. Please try again in a moment.",
      );
    }
  });
}