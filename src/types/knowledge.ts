/**
 * Knowledge-layer types used by GUIDO.
 *
 * These types describe the full flow of knowledge ingestion:
 * - document files loaded from disk
 * - parsed chunks extracted from those files
 * - retrieval results returned for a question
 * - citation metadata used in responses
 */

/**
 * The two supported local knowledge sources.
 *
 * - rule: authoritative rulebook / policy content
 * - guide: helper / onboarding / FAQ / explainer content
 */
export type KnowledgeSourceType = "rule" | "guide";

/**
 * A raw document loaded from disk before chunking.
 */
export interface KnowledgeDocument {
  id: string;
  sourceType: KnowledgeSourceType;
  filePath: string;
  relativePath: string;
  fileName: string;
  title: string;
  rawText: string;
}

/**
 * A parsed, retrieval-ready chunk of content derived from one document.
 *
 * We chunk by heading so we can later retrieve relevant sections
 * instead of sending entire files into the model.
 */
export interface KnowledgeChunk {
  id: string;
  documentId: string;
  sourceType: KnowledgeSourceType;
  filePath: string;
  relativePath: string;
  fileName: string;
  title: string;
  headingPath: string[];
  sectionTitle: string;
  content: string;
  normalizedContent: string;
  citationLabel: string;
}

/**
 * Result returned from retrieval ranking.
 *
 * The score is lexical for now, but later phases can replace or augment it
 * with semantic ranking or embeddings.
 */
export interface RetrievalResult {
  chunk: KnowledgeChunk;
  score: number;
}

/**
 * Citation metadata that will later be attached to GUIDO's responses.
 */
export interface Citation {
  sourceType: KnowledgeSourceType;
  fileName: string;
  sectionTitle: string;
  citationLabel: string;
}