import { Events, Message } from "discord.js";
import type { Client } from "discord.js";
import type { Logger } from "../../app/logger.js";
<<<<<<< HEAD
import type { MentionRouter } from "../../services/mentionRouter.js";
import type { ConversationService } from "../../services/conversationService.js";
=======
import type { MessageRoutingDecision } from "../../types/discord.js";
import type { DiscordHandlerDeps } from "../registerHandlers.js";
>>>>>>> refs/remotes/origin/master

/**
 * Register the Discord messageCreate event.
 *
 * Phase 3 behavior:
 * - ignore bot-authored messages
 * - respond to mentions
 * - respond to replies to GUIDO
 * - generate grounded answers from rules/guides
 */
function routeMessage(message: Message, client: Client): MessageRoutingDecision {
  const content = message.content.trim();

  if (message.author.bot) {
    return { shouldRespond: false, reason: "IGNORED_BOT" };
  }

  if (content.length === 0) {
    return { shouldRespond: false, reason: "IGNORED_EMPTY" };
  }

  if (client.user && message.mentions.has(client.user)) {
    return { shouldRespond: true, reason: "MENTION" };
  }

  if (message.reference?.messageId && message.mentions.repliedUser && client.user) {
    if (message.mentions.repliedUser.id === client.user.id) {
      return { shouldRespond: true, reason: "REPLY_TO_BOT" };
    }
  }

  return { shouldRespond: false, reason: "IGNORED_UNMATCHED" };
}

function normalizePrompt(message: Message, client: Client): string {
  const mentionForms = client.user
    ? [`<@${client.user.id}>`, `<@!${client.user.id}>`]
    : [];

  let normalized = message.content;
  for (const mention of mentionForms) {
    normalized = normalized.replaceAll(mention, "").trim();
  }

  return normalized.length > 0 ? normalized : "Please help me.";
}

export function registerMessageCreateHandler(
  client: Client,
  logger: Logger,
  deps: DiscordHandlerDeps,
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

    const routingDecision = routeMessage(message, client);

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

    logger.debug("Received user message", {
      event: "discord.message.received",
      messageId: message.id,
      guildId: message.guildId ?? null,
      channelId: message.channelId,
      authorId: message.author.id,
      shouldRespond: routingDecision.shouldRespond,
      reason: routingDecision.reason,
    });

<<<<<<< HEAD
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
=======
    try {
      const input = normalizePrompt(message, client);
      const completion = await deps.openaiClient.responses.create({
        model: deps.model,
        input,
      });

      const text = completion.output_text?.trim() || "I couldn't generate a response just now.";
      await message.reply(text);
    } catch (error: unknown) {
>>>>>>> refs/remotes/origin/master
      logger.error("Failed to process mention-based conversation", {
        event: "discord.message.reply_failed",
        messageId: message.id,
        guildId: message.guildId ?? null,
        channelId: message.channelId,
        authorId: message.author.id,
        error: error instanceof Error ? error.message : String(error),
      });

<<<<<<< HEAD
      await message.reply(
        "GUIDO hit a municipal paperwork jam while processing that request. Please try again in a moment.",
      );
=======
      try {
        await message.reply("Sorry — I hit an error while generating a reply. Please try again.");
      } catch {
        // No-op: avoid unhandled errors from fallback reply attempts.
      }
>>>>>>> refs/remotes/origin/master
    }
  });
}
