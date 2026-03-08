import OpenAI from "openai";
import type { AppConfig } from "../app/config.js";

export function createOpenAIClient(config: AppConfig): OpenAI {
  return new OpenAI({
    apiKey: config.openai.apiKey,
  });
}