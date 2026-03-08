import { Events, Interaction } from "discord.js";
import type { Client } from "discord.js";
import type { Logger } from "../../app/logger.js";

/**
 * Interaction event handler.
 *
 * Future phases will handle:
 * - Chat with GUIDO button
 * - Keep Session Open button
 * - Close Session button
 */
export function registerInteractionCreateHandler(client: Client, logger: Logger): void {
  client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    logger.debug("Received interaction", {
      event: "discord.interaction.received",
      interactionId: interaction.id,
      interactionType: interaction.type,
      guildId: interaction.guildId ?? null,
      channelId: interaction.channelId ?? null,
      userId: interaction.user.id,
    });
  });
}