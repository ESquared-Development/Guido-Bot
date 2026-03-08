import { Events } from "discord.js";
import type { Client } from "discord.js";
import type { Logger } from "../../app/logger/logger.js";

export function registerReadyHandler(client: Client, logger: Logger): void {
  client.once(Events.ClientReady, (readyClient) => {
    logger.info("Discord client ready", {
      event: "discord.ready",
      userTag: readyClient.user.tag,
      userId: readyClient.user.id,
    });
  });
}