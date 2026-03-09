import type { Citation } from "../types/knowledge.js";

/**
 * Format the final Discord reply.
 *
 * This keeps the output consistent regardless of how the raw model text
 * looks and ensures citations are always visible.
 */
export function formatDiscordReply(answerText: string, citations: Citation[]): string {
  const cleanedAnswer = answerText.trim();

  /**
   * If the model already included a "Source:" section, we still append our own
   * canonical source block for consistency.
   */
  if (citations.length === 0) {
    return cleanedAnswer;
  }

  const citationLines = citations.map((citation) => `- ${citation.citationLabel}`);

  return [
    cleanedAnswer,
    "",
    "**Source:**",
    ...citationLines,
  ].join("\n");
}