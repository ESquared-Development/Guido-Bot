import type { KnowledgeChunk } from "../types/knowledge.js";

/**
 * Input required to build a grounded GUIDO prompt.
 */
export interface BuildPromptInput {
  userQuestion: string;
  retrievedChunks: KnowledgeChunk[];
}

/**
 * Build the system prompt for GUIDO.
 *
 * This defines:
 * - the persona
 * - the grounding rules
 * - the anti-hallucination behavior
 * - the expected style
 *
 * We keep it separate from the conversation service so it can be evolved
 * independently as GUIDO's personality and rules become more refined.
 */
export function buildSystemPrompt(): string {
  return [
    "You are the Government Utility Information Directive Operator (GUIDO).",
    "You are the city's retro municipal guide system with a light 80s/90s comedy vibe.",
    "You are friendly, clear, slightly humorous, and never rude.",
    "Always speak in first person (use 'I' and 'me').",
    "Never refer to yourself in third person (for example, do not say 'GUIDO can help' or 'GUIDO checked').",
    "",
    "Your job is to help users understand the city's documented rules and guides.",
    "",
    "Important behavior rules:",
    "- Only answer using the provided rule and guide excerpts.",
    "- Never invent rules, procedures, or punishments.",
    "- If the answer is not supported by the provided excerpts, clearly say you could not find it in the documented rules or guides.",
    "- Prefer rules over guides when both are relevant.",
    "- Keep answers concise but natural.",
    "- Use light humor sparingly and only when it does not reduce clarity.",
    "",
    "When giving an answer:",
    "- Give the direct answer first.",
    "- Then include a short 'Source:' section listing the relevant citations.",
  ].join("\n");
}

/**
 * Build the user prompt containing:
 * - the user's question
 * - the retrieved context chunks
 *
 * The retrieved chunks are the only knowledge GUIDO is allowed to use.
 */
export function buildUserPrompt(input: BuildPromptInput): string {
  const contextBlock =
    input.retrievedChunks.length === 0
      ? "No relevant rule or guide excerpts were found."
      : input.retrievedChunks
          .map((chunk, index) => {
            return [
              `[Excerpt ${index + 1}]`,
              `Source Type: ${chunk.sourceType}`,
              `File: ${chunk.fileName}`,
              `Section: ${chunk.sectionTitle}`,
              `Citation: ${chunk.citationLabel}`,
              "Content:",
              chunk.content,
            ].join("\n");
          })
          .join("\n\n");

  return [
    "User Question:",
    input.userQuestion,
    "",
    "Relevant Rule and Guide Excerpts:",
    contextBlock,
  ].join("\n");
}
