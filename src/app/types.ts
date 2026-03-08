/**
 * Shared primitive application types.
 */

/** Supported runtime environments. */
export type NodeEnv = "development" | "production" | "test";

/** Supported log levels. */
export type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * Budget enforcement mode.
 *
 * - block: refuse AI requests that exceed policy
 * - warn: allow them, but log and flag them
 * - off: do not enforce budget checks
 */
export type BudgetEnforcementMode = "block" | "warn" | "off";