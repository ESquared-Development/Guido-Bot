import type { Client } from "discord.js";
import type { Logger } from "../app/logger.js";
import type OpenAI from "openai";
import { registerReadyHandler } from "./eventHandlers/ready.js";
import { registerMessageCreateHandler } from "./eventHandlers/messageCreate.js";
import { registerInteractionCreateHandler } from "./eventHandlers/interactionCreate.js";

export interface DiscordHandlerDeps {
  openaiClient: OpenAI;
  model: string;
  maxOutputTokens: number;
}

/**
 * Register all Discord event handlers in one place.
 *
 * This keeps bootstrap and main startup logic clean while making it easy
 * to see which dependencies each event handler needs.
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
