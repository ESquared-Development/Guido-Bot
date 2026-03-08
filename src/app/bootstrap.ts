import type OpenAI from "openai";
import type { Client } from "discord.js";
import { loadConfig, type AppConfig } from "./config.js";
import { createLogger, type Logger } from "./logger.js";
import { createDiscordClient } from "../discord/client.js";
import { createOpenAIClient } from "../ai/openaiClient.js";
import { UsageTracker } from "../ai/usageTracker.js";
import { summarizeUsage } from "../ai/budgetPolicy.js";
import { KnowledgeService } from "../services/knowledgeService.js";
import { ConversationService } from "../services/conversationService.js";
import { GuideSessionService } from "../services/guideSessionService.js";
import { GuideLobbyService } from "../services/guideLobbyService.js";
import { IdleMonitorService } from "../services/idleMonitorService.js";

/**
 * Shared dependency container for the app.
 */
export interface AppContext {
  config: AppConfig;
  logger: Logger;
  discordClient: Client;
  openaiClient: OpenAI;
  usageTracker: UsageTracker;
  knowledgeService: KnowledgeService;
  conversationService: ConversationService;
  guideSessionService: GuideSessionService;
  guideLobbyService: GuideLobbyService;
  idleMonitorService: IdleMonitorService;
}

/**
 * Bootstrap the application in a controlled order.
 */
export async function bootstrapApp(): Promise<AppContext> {
  const config = loadConfig();
  const logger = createLogger(config.logLevel);

  logger.info("Starting application bootstrap", {
    event: "app.bootstrap.start",
    nodeEnv: config.nodeEnv,
  });

  const discordClient = createDiscordClient();
  const openaiClient = createOpenAIClient(config);

  const usageTracker = new UsageTracker(
    logger.child({ service: "usage_tracker" }),
  );

  const knowledgeService = new KnowledgeService(
    logger.child({ service: "knowledge" }),
  );

  const conversationService = new ConversationService(
    logger.child({ service: "conversation" }),
  );

  const guideSessionService = new GuideSessionService(
    logger.child({ service: "guide_session" }),
  );

  const guideLobbyService = new GuideLobbyService(
    logger.child({ service: "guide_lobby" }),
  );

  const idleMonitorService = new IdleMonitorService(
    logger.child({ service: "idle_monitor" }),
  );

  await usageTracker.initialize();
  await knowledgeService.initialize();
  await conversationService.initialize();
  await guideSessionService.initialize();
  await guideLobbyService.initialize();
  await idleMonitorService.initialize();

  const usage = await usageTracker.getAllRecords();
  const summary = summarizeUsage(usage);

  logger.info("AI budget snapshot loaded", {
    event: "usage.snapshot",
    currentMonthSpendUsd: summary.currentMonthSpendUsd,
    currentDaySpendUsd: summary.currentDaySpendUsd,
    monthlyBudgetUsd: config.ai.budget.monthlyBudgetUsd,
    dailySoftBudgetUsd: config.ai.budget.dailySoftBudgetUsd,
    enforcement: config.ai.budget.enforcement,
  });

  logger.info("Application bootstrap complete", {
    event: "app.bootstrap.complete",
  });

  return {
    config,
    logger,
    discordClient,
    openaiClient,
    usageTracker,
    knowledgeService,
    conversationService,
    guideSessionService,
    guideLobbyService,
    idleMonitorService,
  };
}