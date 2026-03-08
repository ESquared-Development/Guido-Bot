import { Events, Interaction } from "discord.js";
import type { Client } from "discord.js";
import type { Logger } from "../../app/logger/logger.js";

export function registerInteractionCreateHandler(client: Client, logger: Logger): void {
  client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    logger.debug("Interaction received", {
      event: "discord.interaction_create",
      interactionId: interaction.id,
      type: interaction.type,
      guildId: interaction.guildId ?? null,
      channelId: interaction.channelId ?? null,
      userId: interaction.user.id,
    });

    // Phase 4:
    // - Chat with GUIDO button
    // - Keep Session Open button
    // - Close Session button
  });
}