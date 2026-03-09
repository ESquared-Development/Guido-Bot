import type { KnowledgeChunk, KnowledgeDocument, KnowledgeSourceType } from "../../types/knowledge.js";
import { normalizeText } from "./normalizeText.js";

/**
 * Internal representation of one heading currently active while parsing.
 */
interface HeadingState {
  level: number;
  title: string;
}

/**
 * Build a consistent citation label for a chunk.
 *
 * This is a user-facing string, so it should stay readable and stable.
 */
function buildCitationLabel(
  sourceType: KnowledgeSourceType,
  fileName: string,
  sectionTitle: string,
): string {
  const sourceLabel = sourceType === "rule" ? "Rules" : "Guides";
  return `${sourceLabel} → ${fileName} → ${sectionTitle}`;
}

/**
 * Convert one loaded Markdown document into retrieval-ready chunks.
 *
 * Strategy:
 * - split at headings (# through ######)
 * - keep track of heading nesting
 * - flush buffered content whenever a new heading is encountered
 *
 * This gives us chunks that are:
 * - small enough for targeted retrieval
 * - structured enough for citations
 * - easy to inspect manually during debugging
 */
export function chunkMarkdownDocument(document: KnowledgeDocument): KnowledgeChunk[] {
  const lines = document.rawText.split(/\r?\n/);

  const chunks: KnowledgeChunk[] = [];

  /**
   * Buffer for the current section's body content.
   */
  let sectionBuffer: string[] = [];

  /**
   * Stack of active headings, such as:
   * [ "# Police Policy", "## 4.3 PIT Maneuvers" ]
   */
  let headingStack: HeadingState[] = [];

  /**
   * Used to make chunk IDs stable within one document.
   */
  let sectionIndex = 0;

  /**
   * If the document has text before its first heading,
   * we place that under the document title.
   */
  let currentSectionTitle = document.title || document.fileName;

  /**
   * Flush the current buffered section into a KnowledgeChunk.
   */
  const flushSection = (): void => {
    const content = sectionBuffer.join("\n").trim();

    /**
     * Skip empty sections. This prevents useless zero-length chunks.
     */
    if (!content) {
      sectionBuffer = [];
      return;
    }

    const headingPath = headingStack.map((heading) => heading.title);

    /**
     * The deepest active heading becomes the chunk's main section title.
     * If we have no headings, fall back to the document title.
     */
    const sectionTitle =
      headingPath.length > 0
        ? headingPath[headingPath.length - 1]!
        : currentSectionTitle;

    chunks.push({
      id: `${document.id}::chunk::${sectionIndex++}`,
      documentId: document.id,
      sourceType: document.sourceType,
      filePath: document.filePath,
      relativePath: document.relativePath,
      fileName: document.fileName,
      title: document.title,
      headingPath,
      sectionTitle,
      content,
      normalizedContent: normalizeText(`${headingPath.join(" ")} ${content}`),
      citationLabel: buildCitationLabel(document.sourceType, document.fileName, sectionTitle),
    });

    /**
     * Reset for the next section.
     */
    sectionBuffer = [];
  };

  for (const line of lines) {
    /**
     * Match Markdown headings like:
     * # Title
     * ## Subtitle
     * ### Nested
     */
    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(line.trim());

    if (headingMatch) {
      /**
       * Whenever we encounter a new heading, we first finalize the previous section.
       */
      flushSection();

      const level = headingMatch[1]!.length;
      const title = headingMatch[2]!.trim() || "Untitled Section";

      /**
       * Remove any headings at the same or deeper level,
       * since the new heading replaces that branch of the tree.
       */
      headingStack = headingStack.filter((heading) => heading.level < level);
      headingStack.push({ level, title });

      currentSectionTitle = title;
      continue;
    }

    /**
     * Non-heading lines are part of the current section body.
     */
    sectionBuffer.push(line);
  }

  /**
   * Flush any remaining content after the last line.
   */
  flushSection();

  return chunks;
}