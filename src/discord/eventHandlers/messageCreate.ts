import { Events, Message } from "discord.js";
import type { Client } from "discord.js";
import type { Logger } from "../../app/logger/logger.js";

export function registerMessageCreateHandler(client: Client, logger: Logger): void {
  client.on(Events.MessageCreate, async (message: Message) => {
    if (message.author.bot) return;

    logger.debug("Message received", {
      event: "discord.message_create",
      messageId: message.id,
      channelId: message.channelId,
      guildId: message.guildId ?? null,
      authorId: message.author.id,
    });

    // Phase 3:
    // - mention detection
    // - reply-to-bot detection
    // - route to retrieval + response pipeline
  });
}