import type { AppConfig } from "../app/config.js";
import { BudgetPolicyError } from "../app/errors.js";
import type { AIUsageRecord } from "../types/ai.js";

/**
 * Extremely conservative token estimate from characters.
 *
 * This is intentionally simple for Phase 1.
 * A rough planning heuristic is:
 *   ~4 characters per token
 *
 * Later we can replace this with a tokenizer-aware estimate.
 */
export function estimateTokensFromCharacters(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Very rough request cost estimator.
 *
 * In Phase 1 we care more about enforcing safe ceilings than achieving
 * perfect pricing accuracy. This is a guardrail, not a billing engine.
 *
 * The estimate here assumes:
 * - input cost and output cost are blended into a conservative figure
 * - future phases can replace this with model-specific pricing
 */
export function estimateRequestCostUsd(
  estimatedInputTokens: number,
  maxOutputTokens: number,
): number {
  const totalEstimatedTokens = estimatedInputTokens + maxOutputTokens;

  /**
   * Conservative placeholder estimate:
   * $0.005 per 1K combined tokens
   *
   * This should be tuned later to the actual model you choose.
   */
  return (totalEstimatedTokens / 1000) * 0.005;
}

export interface BudgetCheckInput {
  promptText: string;
  maxOutputTokens: number;
  currentMonthSpendUsd: number;
  currentDaySpendUsd: number;
}

export interface BudgetCheckResult {
  allowed: boolean;
  estimatedInputTokens: number;
  estimatedRequestCostUsd: number;
  reasons: string[];
}

/**
 * Evaluate whether a request is allowed under the configured budget policy.
 */
export function evaluateBudgetPolicy(
  config: AppConfig,
  input: BudgetCheckInput,
): BudgetCheckResult {
  const reasons: string[] = [];

  if (input.promptText.length > config.ai.limits.maxInputChars) {
    reasons.push("Input exceeds max input character limit.");
  }

  if (input.maxOutputTokens > config.ai.limits.maxOutputTokens) {
    reasons.push("Requested output exceeds max output token limit.");
  }

  const estimatedInputTokens = estimateTokensFromCharacters(input.promptText);
  const estimatedRequestCostUsd = estimateRequestCostUsd(
    estimatedInputTokens,
    input.maxOutputTokens,
  );

  if (estimatedRequestCostUsd > config.ai.limits.maxEstimatedRequestCostUsd) {
    reasons.push("Estimated request cost exceeds per-request budget limit.");
  }

  if (
    input.currentMonthSpendUsd + estimatedRequestCostUsd >
    config.ai.budget.monthlyBudgetUsd
  ) {
    reasons.push("Monthly AI budget would be exceeded.");
  }

  if (
    input.currentDaySpendUsd + estimatedRequestCostUsd >
    config.ai.budget.dailySoftBudgetUsd
  ) {
    reasons.push("Daily soft AI budget would be exceeded.");
  }

  const allowed = reasons.length === 0 || config.ai.budget.enforcement === "off";

  return {
    allowed,
    estimatedInputTokens,
    estimatedRequestCostUsd,
    reasons,
  };
}

/**
 * Throw when policy result is blocked.
 */
export function assertBudgetAllowed(
  config: AppConfig,
  result: BudgetCheckResult,
): void {
  if (result.allowed) return;

  if (config.ai.budget.enforcement === "warn") return;

  throw new BudgetPolicyError("AI request blocked by budget policy", {
    reasons: result.reasons,
    estimatedRequestCostUsd: result.estimatedRequestCostUsd,
    estimatedInputTokens: result.estimatedInputTokens,
  });
}

/**
 * Compute cumulative usage totals from stored records.
 */
export function summarizeUsage(
  records: AIUsageRecord[],
  now: Date = new Date(),
): { currentMonthSpendUsd: number; currentDaySpendUsd: number } {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const day = now.getUTCDate();

  let currentMonthSpendUsd = 0;
  let currentDaySpendUsd = 0;

  for (const record of records) {
    const timestamp = new Date(record.timestamp);

    if (
      timestamp.getUTCFullYear() === year &&
      timestamp.getUTCMonth() === month
    ) {
      currentMonthSpendUsd += record.estimatedCostUsd;
    }

    if (
      timestamp.getUTCFullYear() === year &&
      timestamp.getUTCMonth() === month &&
      timestamp.getUTCDate() === day
    ) {
      currentDaySpendUsd += record.estimatedCostUsd;
    }
  }

  return { currentMonthSpendUsd, currentDaySpendUsd };
}