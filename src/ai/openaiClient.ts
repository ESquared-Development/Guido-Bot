import OpenAI from "openai";
import type { AppConfig } from "../app/config.js";

/**
 * Create the shared OpenAI client.
 *
 * This should only be called during bootstrap.
 */
export function createOpenAIClient(config: AppConfig): OpenAI {
  return new OpenAI({
    apiKey: config.ai.apiKey,
  });
}