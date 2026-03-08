import { ConfigError } from "./errors.js";
import { getEnv } from "./env.js";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface AppConfig {
  nodeEnv: "development" | "production" | "test";
  logLevel: LogLevel;

  discord: {
    token: string;
    clientId?: string;
    guildId?: string;
    cityGuideChannelId?: string;
    staffRoleId?: string;
  };

  openai: {
    apiKey: string;
    model: string;
  };
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

function parseLogLevel(value?: string): LogLevel {
  switch (value) {
    case "debug":
    case "info":
    case "warn":
    case "error":
      return value;
    case undefined:
      return "info";
    default:
      throw new ConfigError("Invalid LOG_LEVEL", { value });
  }
}

function parseNodeEnv(value?: string): "development" | "production" | "test" {
  switch (value) {
    case "development":
    case "production":
    case "test":
      return value;
    case undefined:
      return "development";
    default:
      throw new ConfigError("Invalid NODE_ENV", { value });
  }
}

export function loadConfig(): AppConfig {
  const clientId = optionalEnv("DISCORD_CLIENT_ID");
  const guildId = optionalEnv("DISCORD_GUILD_ID");
  const cityGuideChannelId = optionalEnv("CITY_GUIDE_CHANNEL_ID");
  const staffRoleId = optionalEnv("STAFF_ROLE_ID");

  return {
    nodeEnv: parseNodeEnv(optionalEnv("NODE_ENV")),
    logLevel: parseLogLevel(optionalEnv("LOG_LEVEL")),

    discord: {
      token: requireEnv("DISCORD_TOKEN"),
      ...(clientId !== undefined ? { clientId } : {}),
      ...(guildId !== undefined ? { guildId } : {}),
      ...(cityGuideChannelId !== undefined ? { cityGuideChannelId } : {}),
      ...(staffRoleId !== undefined ? { staffRoleId } : {}),
    },

    openai: {
      apiKey: requireEnv("OPENAI_API_KEY"),
      model: optionalEnv("OPENAI_MODEL") ?? "gpt-5.4",
    },
  };
}
