import type { Citation, RetrievalResult } from "../../types/knowledge.js";

/**
 * Build a de-duplicated list of citations from retrieval results.
 *
 * If multiple retrieved chunks point to the same file + section,
 * we only need one citation entry for that section.
 */
export function buildCitations(results: RetrievalResult[]): Citation[] {
  const seen = new Set<string>();
  const citations: Citation[] = [];

  for (const result of results) {
    const key = `${result.chunk.fileName}::${result.chunk.sectionTitle}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);

    citations.push({
      sourceType: result.chunk.sourceType,
      fileName: result.chunk.fileName,
      sectionTitle: result.chunk.sectionTitle,
      citationLabel: result.chunk.citationLabel,
    });
  }

  return citations;
}