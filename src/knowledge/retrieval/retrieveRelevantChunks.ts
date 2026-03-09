import type { KnowledgeChunk, RetrievalResult } from "../../types/knowledge.js";
import { scoreChunk } from "./scoreChunk.js";

/**
 * Optional retrieval settings.
 */
export interface RetrieveOptions {
  limit?: number;
  minimumScore?: number;
}

/**
 * Retrieve the most relevant chunks for a user question.
 *
 * This function:
 * - scores every chunk
 * - removes weak/non-matching chunks
 * - sorts by score
 * - breaks ties in favor of rules
 * - limits the final result set
 */
export function retrieveRelevantChunks(
  question: string,
  chunks: KnowledgeChunk[],
  options: RetrieveOptions = {},
): RetrievalResult[] {
  const limit = options.limit ?? 6;
  const minimumScore = options.minimumScore ?? 1;

  return chunks
    .map((chunk) => ({
      chunk,
      score: scoreChunk(question, chunk),
    }))
    .filter((result) => result.score >= minimumScore)
    .sort((a, b) => {
      /**
       * Primary sort: descending score.
       */
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      /**
       * Secondary sort: prefer rules over guides.
       */
      if (a.chunk.sourceType !== b.chunk.sourceType) {
        return a.chunk.sourceType === "rule" ? -1 : 1;
      }

      /**
       * Final stable tie-breaker: filename.
       */
      return a.chunk.fileName.localeCompare(b.chunk.fileName);
    })
    .slice(0, limit);
}