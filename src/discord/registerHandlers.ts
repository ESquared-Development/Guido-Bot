import type { Client } from "discord.js";
import type { Logger } from "../app/logger.js";
import type OpenAI from "openai";
import { registerReadyHandler } from "./eventHandlers/ready.js";
import { registerMessageCreateHandler } from "./eventHandlers/messageCreate.js";
import { registerInteractionCreateHandler } from "./eventHandlers/interactionCreate.js";

export interface DiscordHandlerDeps {
  openaiClient: OpenAI;
  model: string;
}

/**
 * Register all Discord event handlers in one place.
 */
export function registerDiscordHandlers(
  client: Client,
  logger: Logger,
  deps: DiscordHandlerDeps,
): void {
  registerReadyHandler(client, logger.child({ service: "discord.ready" }));
  registerMessageCreateHandler(
    client,
    logger.child({ service: "discord.message" }),
    deps,
  );
  registerInteractionCreateHandler(client, logger.child({ service: "discord.interaction" }));
}
