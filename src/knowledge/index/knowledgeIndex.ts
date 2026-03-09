import type { KnowledgeChunk, KnowledgeDocument, RetrievalResult } from "../../types/knowledge.js";
import { chunkMarkdownDocument } from "../parsing/chunkMarkdown.js";
import { retrieveRelevantChunks, type RetrieveOptions } from "../retrieval/retrieveRelevantChunks.js";

/**
 * In-memory knowledge index.
 *
 * Responsibilities:
 * - store the loaded documents
 * - store the derived chunks
 * - provide retrieval access
 *
 * Phase 2 keeps this in memory for simplicity and speed.
 * Later phases can add persistence or vector indexing if needed.
 */
export class KnowledgeIndex {
  private documents: KnowledgeDocument[] = [];
  private chunks: KnowledgeChunk[] = [];

  /**
   * Load all documents into the index and derive their chunks.
   *
   * This fully replaces any prior index contents.
   */
  load(documents: KnowledgeDocument[]): void {
    this.documents = documents;
    this.chunks = documents.flatMap((document) => chunkMarkdownDocument(document));
  }

  /**
   * Return a defensive copy of documents.
   */
  getDocuments(): KnowledgeDocument[] {
    return [...this.documents];
  }

  /**
   * Return a defensive copy of chunks.
   */
  getChunks(): KnowledgeChunk[] {
    return [...this.chunks];
  }

  /**
   * Retrieve relevant chunks for a question.
   */
  retrieve(question: string, options?: RetrieveOptions): RetrievalResult[] {
    return retrieveRelevantChunks(question, this.chunks, options);
  }

  /**
   * Return index size metrics for logging and diagnostics.
   */
  size(): { documents: number; chunks: number } {
    return {
      documents: this.documents.length,
      chunks: this.chunks.length,
    };
  }
}