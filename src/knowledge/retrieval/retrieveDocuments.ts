import type { KnowledgeChunk, RetrievalResult } from "../types.js";
import { scoreChunk } from "./scoreDocument.js";

export interface RetrieveOptions {
  limit?: number;
  minimumScore?: number;
}

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
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      if (a.chunk.sourceType !== b.chunk.sourceType) {
        return a.chunk.sourceType === "rule" ? -1 : 1;
      }

      return a.chunk.fileName.localeCompare(b.chunk.fileName);
    })
    .slice(0, limit);
}