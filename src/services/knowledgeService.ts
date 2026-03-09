import type { Logger } from "../app/logger.js";
import { KnowledgeServiceError } from "../app/errors.js";
import type {
  Citation,
  KnowledgeChunk,
  RetrievalResult,
} from "../types/knowledge.js";
import { buildCitations } from "../knowledge/citations/buildCitations.js";
import { KnowledgeIndex } from "../knowledge/index/knowledgeIndex.js";
import { loadGuides } from "../knowledge/loaders/loadGuides.js";
import { loadRules } from "../knowledge/loaders/loadRules.js";

/**
 * KnowledgeService is the application's facade over the knowledge layer.
 *
 * Other parts of the app should not need to know:
 * - how documents are loaded
 * - how chunking works
 * - how retrieval works
 *
 * They should only ask this service for relevant chunks/citations.
 */
export class KnowledgeService {
  private readonly index = new KnowledgeIndex();

  constructor(private readonly logger: Logger) {}

  /**
   * Load all rule and guide content into the in-memory index.
   *
   * This is called during app bootstrap so GUIDO is ready to answer
   * questions as soon as Discord events begin flowing.
   */
  async initialize(): Promise<void> {
    try {
      const [rules, guides] = await Promise.all([
        loadRules(this.logger.child({ sourceType: "rule" })),
        loadGuides(this.logger.child({ sourceType: "guide" })),
      ]);

      /**
       * Merge both source types into a single index.
       * Retrieval ranking will still slightly favor rules.
       */
      this.index.load([...rules, ...guides]);

      const size = this.index.size();

      this.logger.info("Knowledge service initialized", {
        event: "knowledge.initialize",
        ruleDocumentCount: rules.length,
        guideDocumentCount: guides.length,
        totalDocumentCount: size.documents,
        totalChunkCount: size.chunks,
      });
    } catch (error) {
      throw new KnowledgeServiceError(
        "Failed to initialize knowledge service",
        undefined,
        error,
      );
    }
  }

  /**
   * Retrieve relevant chunks for a question.
   *
   * The caller controls the limit, but the service will typically receive
   * that limit from application config.
   */
  retrieve(question: string, limit = 6): RetrievalResult[] {
    const results = this.index.retrieve(question, {
      limit,
      minimumScore: 1,
    });

    this.logger.debug("Knowledge retrieval complete", {
      event: "knowledge.retrieve",
      question,
      resultCount: results.length,
      topResults: results.slice(0, 5).map((result) => ({
        chunkId: result.chunk.id,
        fileName: result.chunk.fileName,
        sectionTitle: result.chunk.sectionTitle,
        sourceType: result.chunk.sourceType,
        score: result.score,
      })),
    });

    return results;
  }

  /**
   * Convenience method to return only the chunks from retrieval results.
   */
  getTopChunks(question: string, limit = 6): KnowledgeChunk[] {
    return this.retrieve(question, limit).map((result) => result.chunk);
  }

  /**
   * Build user-facing citation metadata from retrieval results.
   */
  getCitations(results: RetrievalResult[]): Citation[] {
    return buildCitations(results);
  }

  /**
   * Return current index statistics for diagnostics.
   */
  getStats(): { documents: number; chunks: number } {
    return this.index.size();
  }
}