export type KnowledgeSourceType = "rule" | "guide";

export interface KnowledgeChunk {
  id: string;
  sourceType: KnowledgeSourceType;
  filePath: string;
  fileName: string;
  title: string;
  sectionTitle: string;
  headingPath: string[];
  content: string;
  citationLabel: string;
}