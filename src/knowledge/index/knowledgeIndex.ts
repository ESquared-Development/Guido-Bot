import type { KnowledgeChunk, KnowledgeDocument, RetrievalResult } from "../types.js";
import { chunkMarkdownDocument } from "../parsing/chunkMarkdown.js";
import { retrieveRelevantChunks, type RetrieveOptions } from "../retrieval/retrieveDocuments.js";

export class KnowledgeIndex {
  private documents: KnowledgeDocument[] = [];
  private chunks: KnowledgeChunk[] = [];

  load(documents: KnowledgeDocument[]): void {
    this.documents = documents;
    this.chunks = documents.flatMap((document) => chunkMarkdownDocument(document));
  }

  getDocuments(): KnowledgeDocument[] {
    return [...this.documents];
  }

  getChunks(): KnowledgeChunk[] {
    return [...this.chunks];
  }

  retrieve(question: string, options?: RetrieveOptions): RetrievalResult[] {
    return retrieveRelevantChunks(question, this.chunks, options);
  }

  size(): { documents: number; chunks: number } {
    return {
      documents: this.documents.length,
      chunks: this.chunks.length,
    };
  }
}