import type { BudgetEnforcementMode } from "../app/types.js";

/**
 * Strongly typed AI runtime configuration.
 */
export interface AIRequestLimits {
  maxInputChars: number;
  maxOutputTokens: number;
  maxContextMessages: number;
  maxRetrievedChunks: number;
  maxEstimatedRequestCostUsd: number;
}

export interface AIBudgetConfig {
  monthlyBudgetUsd: number;
  dailySoftBudgetUsd: number;
  enforcement: BudgetEnforcementMode;
}

export interface AIConfig {
  apiKey: string;
  model: string;
  limits: AIRequestLimits;
  budget: AIBudgetConfig;
}

/**
 * Approximate usage record for one AI call.
 *
 * In later phases this can be updated with actual API usage values
 * returned by OpenAI, when available.
 */
export interface AIUsageRecord {
  requestId: string;
  timestamp: string;
  model: string;
  estimatedInputTokens: number;
  maxOutputTokens: number;
  estimatedCostUsd: number;
  sessionId?: string | undefined;
  channelId?: string | undefined;
  guildId?: string | undefined;
  userId?: string | undefined;
}
