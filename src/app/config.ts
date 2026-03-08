import { ConfigError } from "./errors.js";
import { getEnv } from "./env.js";
import type { BudgetEnforcementMode, LogLevel, NodeEnv } from "./types.js";
import type { AIConfig } from "../types/ai.js";

/**
 * Full application configuration object.
 */
export interface AppConfig {
  nodeEnv: NodeEnv;
  logLevel: LogLevel;

  discord: {
    token: string;
    clientId?: string;
    guildId?: string;
    cityGuideChannelId?: string;
    staffRoleId?: string;
  };

  ai: AIConfig;
}

function requireEnv(name: string): string {
  const value = getEnv(name);
  if (!value) {
    throw new ConfigError(`Missing required environment variable: ${name}`, {
      variable: name,
    });
  }
  return value;
}

function optionalEnv(name: string): string | undefined {
  return getEnv(name);
}

function parseNodeEnv(value?: string): NodeEnv {
  switch (value) {
    case undefined:
      return "development";
    case "development":
    case "production":
    case "test":
      return value;
    default:
      throw new ConfigError("Invalid NODE_ENV", { value });
  }
}

function parseLogLevel(value?: string): LogLevel {
  switch (value) {
    case undefined:
      return "info";
    case "debug":
    case "info":
    case "warn":
    case "error":
      return value;
    default:
      throw new ConfigError("Invalid LOG_LEVEL", { value });
  }
}

function parsePositiveNumber(name: string, fallback?: number): number {
  const raw = optionalEnv(name);

  if (raw === undefined) {
    if (fallback !== undefined) return fallback;
    throw new ConfigError(`Missing numeric environment variable: ${name}`, {
      variable: name,
    });
  }

  const parsed = Number(raw);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new ConfigError(`Invalid positive numeric environment variable: ${name}`, {
      variable: name,
      value: raw,
    });
  }

  return parsed;
}

function parseBudgetEnforcement(value?: string): BudgetEnforcementMode {
  switch (value) {
    case undefined:
      return "block";
    case "block":
    case "warn":
    case "off":
      return value;
    default:
      throw new ConfigError("Invalid AI_BUDGET_ENFORCEMENT", { value });
  }
}

/**
 * Load and validate all runtime configuration.
 */
export function loadConfig(): AppConfig {
  return {
    nodeEnv: parseNodeEnv(optionalEnv("NODE_ENV")),
    logLevel: parseLogLevel(optionalEnv("LOG_LEVEL")),

    discord: {
      token: requireEnv("DISCORD_TOKEN"),
      clientId: optionalEnv("DISCORD_CLIENT_ID"),
      guildId: optionalEnv("DISCORD_GUILD_ID"),
      cityGuideChannelId: optionalEnv("CITY_GUIDE_CHANNEL_ID"),
      staffRoleId: optionalEnv("STAFF_ROLE_ID"),
    },

    ai: {
      apiKey: requireEnv("OPENAI_API_KEY"),
      model: optionalEnv("OPENAI_MODEL") ?? "gpt-5.4",

      limits: {
        maxInputChars: parsePositiveNumber("AI_MAX_INPUT_CHARS", 12000),
        maxOutputTokens: parsePositiveNumber("AI_MAX_OUTPUT_TOKENS", 500),
        maxContextMessages: parsePositiveNumber("AI_MAX_CONTEXT_MESSAGES", 12),
        maxRetrievedChunks: parsePositiveNumber("AI_MAX_RETRIEVED_CHUNKS", 6),
        maxEstimatedRequestCostUsd: parsePositiveNumber(
          "AI_MAX_REQUEST_ESTIMATED_COST_USD",
          0.05,
        ),
      },

      budget: {
        monthlyBudgetUsd: parsePositiveNumber("AI_MONTHLY_BUDGET_USD", 10),
        dailySoftBudgetUsd: parsePositiveNumber("AI_DAILY_SOFT_BUDGET_USD", 1),
        enforcement: parseBudgetEnforcement(optionalEnv("AI_BUDGET_ENFORCEMENT")),
      },
    },
  };
}