import { Events } from "discord.js";
import type { Client } from "discord.js";
import type { Logger } from "../../app/logger.js";

/**
 * Log when the bot becomes ready.
 */
export function registerReadyHandler(client: Client, logger: Logger): void {
  client.once(Events.ClientReady, (readyClient) => {
    logger.info("Discord client is ready", {
      event: "discord.ready",
      botUserId: readyClient.user.id,
      botUserTag: readyClient.user.tag,
    });
  });
}