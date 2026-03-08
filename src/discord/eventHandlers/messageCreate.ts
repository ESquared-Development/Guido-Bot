import { Events, Message } from "discord.js";
import type { Client } from "discord.js";
import type { Logger } from "../../app/logger.js";

/**
 * Message event handler.
 *
 * Future phases will:
 * - detect mentions
 * - detect reply-to-bot
 * - route thread messages
 */
export function registerMessageCreateHandler(client: Client, logger: Logger): void {
  client.on(Events.MessageCreate, async (message: Message) => {
    if (message.author.bot) {
      logger.debug("Ignored bot-authored message", {
        event: "discord.message.ignored_bot",
        messageId: message.id,
        authorId: message.author.id,
        channelId: message.channelId,
      });
      return;
    }

    logger.debug("Received user message", {
      event: "discord.message.received",
      messageId: message.id,
      guildId: message.guildId ?? null,
      channelId: message.channelId,
      authorId: message.author.id,
      contentLength: message.content.length,
    });
  });
}