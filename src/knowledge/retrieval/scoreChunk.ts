import type { KnowledgeChunk } from "../../types/knowledge.js";
import { tokenize } from "../parsing/normalizeText.js";

/**
 * Score one chunk against a user question.
 *
 * Phase 2 retrieval is lexical and intentionally simple:
 * - token overlap in content gives base score
 * - token overlap in section title gets extra weight
 * - token overlap in heading path gets extra weight
 * - rules receive a slight priority bump over guides
 *
 * This matches your intended hierarchy:
 * rules > guides when both are relevant
 */
export function scoreChunk(question: string, chunk: KnowledgeChunk): number {
  const queryTokens = tokenize(question);

  if (queryTokens.length === 0) {
    return 0;
  }

  const contentTokens = new Set(tokenize(chunk.normalizedContent));
  const sectionTokens = new Set(tokenize(chunk.sectionTitle));
  const headingTokens = new Set(tokenize(chunk.headingPath.join(" ")));

  let score = 0;

  for (const token of queryTokens) {
    if (contentTokens.has(token)) {
      score += 1;
    }

    if (sectionTokens.has(token)) {
      score += 2;
    }

    if (headingTokens.has(token)) {
      score += 2;
    }
  }

  /**
   * Rules should generally outrank guides when both are relevant,
   * because rules are the authoritative source.
   */
  if (chunk.sourceType === "rule") {
    score += 0.25;
  }

  return score;
}