import type { Client } from "discord.js";
import type { Logger } from "../app/logger.js";
import type { MentionRouter } from "../services/mentionRouter.js";
import type { ConversationService } from "../services/conversationService.js";
import { registerReadyHandler } from "./eventHandlers/ready.js";
import { registerMessageCreateHandler } from "./eventHandlers/messageCreate.js";
import { registerInteractionCreateHandler } from "./eventHandlers/interactionCreate.js";

/**
 * Register all Discord event handlers in one place.
 *
 * This keeps bootstrap and main startup logic clean while making it easy
 * to see which dependencies each event handler needs.
 */
export function registerDiscordHandlers(
  client: Client,
  logger: Logger,
  mentionRouter: MentionRouter,
  conversationService: ConversationService,
): void {
  registerReadyHandler(client, logger.child({ service: "discord.ready" }));

  registerMessageCreateHandler(
    client,
    logger.child({ service: "discord.message" }),
    mentionRouter,
    conversationService,
  );

  registerInteractionCreateHandler(
    client,
    logger.child({ service: "discord.interaction" }),
  );
}