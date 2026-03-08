import { Client, GatewayIntentBits, Partials } from "discord.js";

/**
 * Create the shared Discord client.
 *
 * These intents are chosen to support the long-term GUIDO design:
 * - Guilds: base bot functionality
 * - GuildMessages: listen for messages
 * - MessageContent: needed for reading normal guild messages
 */
export function createDiscordClient(): Client {
  return new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel],
  });
}