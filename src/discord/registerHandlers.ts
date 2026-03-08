import type { Client } from "discord.js";
import type { Logger } from "../app/logger.js";
import { registerReadyHandler } from "./eventHandlers/ready.js";
import { registerMessageCreateHandler } from "./eventHandlers/messageCreate.js";
import { registerInteractionCreateHandler } from "./eventHandlers/interactionCreate.js";

/**
 * Register all Discord event handlers in one place.
 */
export function registerDiscordHandlers(client: Client, logger: Logger): void {
  registerReadyHandler(client, logger.child({ service: "discord.ready" }));
  registerMessageCreateHandler(client, logger.child({ service: "discord.message" }));
  registerInteractionCreateHandler(client, logger.child({ service: "discord.interaction" }));
}