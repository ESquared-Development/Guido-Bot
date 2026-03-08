export class AppError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, unknown>;
  public readonly cause?: unknown;

  constructor(
    message: string,
    options: {
      code?: string;
      details?: Record<string, unknown>;
      cause?: unknown;
    } = {},
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = options.code ?? "APP_ERROR";
    if (options.details !== undefined) {
      this.details = options.details;
    }
    if (options.cause !== undefined) {
      this.cause = options.cause;
    }
  }
}

export class ConfigError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, { code: "CONFIG_ERROR", ...(details !== undefined ? { details } : {}) });
  }
}

export class DiscordApiError extends AppError {
  constructor(message: string, details?: Record<string, unknown>, cause?: unknown) {
    super(message, {
      code: "DISCORD_API_ERROR",
      ...(details !== undefined ? { details } : {}),
      ...(cause !== undefined ? { cause } : {}),
    });
  }
}

export class OpenAIServiceError extends AppError {
  constructor(message: string, details?: Record<string, unknown>, cause?: unknown) {
    super(message, {
      code: "OPENAI_SERVICE_ERROR",
      ...(details !== undefined ? { details } : {}),
      ...(cause !== undefined ? { cause } : {}),
    });
  }
}

export class KnowledgeError extends AppError {
  constructor(message: string, details?: Record<string, unknown>, cause?: unknown) {
    super(message, {
      code: "KNOWLEDGE_ERROR",
      ...(details !== undefined ? { details } : {}),
      ...(cause !== undefined ? { cause } : {}),
    });
  }
}

export class SessionError extends AppError {
  constructor(message: string, details?: Record<string, unknown>, cause?: unknown) {
    super(message, {
      code: "SESSION_ERROR",
      ...(details !== undefined ? { details } : {}),
      ...(cause !== undefined ? { cause } : {}),
    });
  }
}