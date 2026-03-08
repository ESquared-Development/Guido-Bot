import type { KnowledgeChunk } from "../types.js";
import { tokenize } from "../parsing/normalizeText.js";

export function scoreChunk(question: string, chunk: KnowledgeChunk): number {
  const queryTokens = tokenize(question);
  if (queryTokens.length === 0) return 0;

  const contentTokens = new Set(tokenize(chunk.normalizedContent));
  const sectionTokens = new Set(tokenize(chunk.sectionTitle));
  const headingTokens = new Set(tokenize(chunk.headingPath.join(" ")));

  let score = 0;

  for (const token of queryTokens) {
    if (contentTokens.has(token)) score += 1;
    if (sectionTokens.has(token)) score += 2;
    if (headingTokens.has(token)) score += 2;
  }

  if (chunk.sourceType === "rule") {
    score += 0.25;
  }

  return score;
}