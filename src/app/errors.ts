/**
 * Base and specialized application error types.
 *
 * These help us keep failures structured and predictable.
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, unknown> | undefined;
  public readonly cause?: unknown;

  constructor(
    message: string,
    options: {
      code?: string | undefined;
      details?: Record<string, unknown> | undefined;
      cause?: unknown;
    } = {},
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = options.code ?? "APP_ERROR";
    this.details = options.details;
    this.cause = options.cause;
  }
}

export class ConfigError extends AppError {
  constructor(message: string, details?: Record<string, unknown>, cause?: unknown) {
    super(message, { code: "CONFIG_ERROR", details, cause });
  }
}

export class DiscordServiceError extends AppError {
  constructor(message: string, details?: Record<string, unknown>, cause?: unknown) {
    super(message, { code: "DISCORD_SERVICE_ERROR", details, cause });
  }
}

export class OpenAIServiceError extends AppError {
  constructor(message: string, details?: Record<string, unknown>, cause?: unknown) {
    super(message, { code: "OPENAI_SERVICE_ERROR", details, cause });
  }
}

export class KnowledgeServiceError extends AppError {
  constructor(message: string, details?: Record<string, unknown>, cause?: unknown) {
    super(message, { code: "KNOWLEDGE_SERVICE_ERROR", details, cause });
  }
}

export class KnowledgeError extends AppError {
  constructor(message: string, details?: Record<string, unknown>, cause?: unknown) {
    super(message, { code: "KNOWLEDGE_ERROR", details, cause });
  }
}

export class SessionServiceError extends AppError {
  constructor(message: string, details?: Record<string, unknown>, cause?: unknown) {
    super(message, { code: "SESSION_SERVICE_ERROR", details, cause });
  }
}

export class BudgetPolicyError extends AppError {
  constructor(message: string, details?: Record<string, unknown>, cause?: unknown) {
    super(message, { code: "BUDGET_POLICY_ERROR", details, cause });
  }
}
