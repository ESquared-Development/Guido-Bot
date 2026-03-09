import { Events, Message } from "discord.js";
import type { Client } from "discord.js";
import type { Logger } from "../../app/logger.js";
import type { DiscordHandlerDeps } from "../registerHandlers.js";
import type { MessageRoutingDecision as RoutingDecision } from "../../types/discord.js";

/**
 * Register the Discord messageCreate event.
 *
 * Phase 3 behavior:
 * - ignore bot-authored messages
 * - respond to mentions
 * - respond to replies to GUIDO
 * - generate grounded answers from rules/guides
 */
function routeMessage(message: Message, client: Client): RoutingDecision {
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

    try {
      const input = normalizePrompt(message, client);
      const completion = await deps.openaiClient.responses.create({
        model: deps.model,
        max_output_tokens: deps.maxOutputTokens,
        input,
      });

      const text = completion.output_text?.trim() || "I couldn't generate a response just now.";
      await message.reply(text);
    } catch (error: unknown) {
      logger.error("Failed to process mention-based conversation", {
        event: "discord.message.reply_failed",
        messageId: message.id,
        guildId: message.guildId ?? null,
        channelId: message.channelId,
        authorId: message.author.id,
        error: error instanceof Error ? error.message : String(error),
      });

      try {
        await message.reply("I hit a municipal paperwork jam while processing that request. Please try again in a moment.");
      } catch {
        // No-op: avoid unhandled errors from fallback reply attempts.
      }
    }
  });
}
