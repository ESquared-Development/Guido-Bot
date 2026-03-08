import type OpenAI from "openai";
import type { Client } from "discord.js";
import { loadConfig, type AppConfig } from "./config.js";
import { createLogger, type Logger } from "./logger/logger.js";
import { createDiscordClient } from "../discord/client.js";
import { createOpenAIClient } from "../ai/openaiClient.js";
import { KnowledgeService } from "../knowledge/knowledgeService.js";
import { SessionService } from "../sessions/sessionService.js";
import { MentionRouter } from "../services/mentionRouter.js";
import { CityGuideLobbyService } from "../services/cityGuideLobbyService.js";
import { IdleSessionService } from "../services/idleSessionService.js";

export interface AppContext {
  config: AppConfig;
  logger: Logger;
  discordClient: Client;
  openaiClient: OpenAI;
  knowledgeService: KnowledgeService;
  sessionService: SessionService;
  mentionRouter: MentionRouter;
  cityGuideLobbyService: CityGuideLobbyService;
  idleSessionService: IdleSessionService;
}

export async function bootstrapApp(): Promise<AppContext> {
  const config = loadConfig();
  const logger = createLogger(config.logLevel);

  logger.info("Bootstrapping application", {
    event: "app.bootstrap.start",
    nodeEnv: config.nodeEnv,
  });

  const discordClient = createDiscordClient();
  const openaiClient = createOpenAIClient(config);

  const knowledgeService = new KnowledgeService(
    logger.child({ service: "knowledge" }),
  );
  const sessionService = new SessionService(
    logger.child({ service: "sessions" }),
  );
  const mentionRouter = new MentionRouter(
    logger.child({ service: "mentionRouter" }),
  );
  const cityGuideLobbyService = new CityGuideLobbyService(
    logger.child({ service: "cityGuideLobby" }),
  );
  const idleSessionService = new IdleSessionService(
    logger.child({ service: "idleSession" }),
  );

  await knowledgeService.initialize();
  await sessionService.initialize();
  await mentionRouter.initialize();
  await cityGuideLobbyService.initialize();
  await idleSessionService.initialize();

  logger.info("Application bootstrap complete", {
    event: "app.bootstrap.complete",
  });

  return {
    config,
    logger,
    discordClient,
    openaiClient,
    knowledgeService,
    sessionService,
    mentionRouter,
    cityGuideLobbyService,
    idleSessionService,
  };
}