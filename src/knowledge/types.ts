export type KnowledgeSourceType = "rule" | "guide";

export interface KnowledgeDocument {
  id: string;
  sourceType: KnowledgeSourceType;
  filePath: string;
  fileName: string;
  title: string;
  rawText: string;
}

export interface KnowledgeChunk {
  id: string;
  documentId: string;
  sourceType: KnowledgeSourceType;
  filePath: string;
  fileName: string;
  title: string;
  headingPath: string[];
  sectionTitle: string;
  content: string;
  normalizedContent: string;
  citationLabel: string;
}

export interface RetrievalResult {
  chunk: KnowledgeChunk;
  score: number;
}

export interface Citation {
  sourceType: KnowledgeSourceType;
  fileName: string;
  sectionTitle: string;
  citationLabel: string;
}