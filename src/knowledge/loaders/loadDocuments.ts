import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { Logger } from "../../app/logger.js";
import { KnowledgeServiceError } from "../../app/errors.js";
import type { KnowledgeDocument, KnowledgeSourceType } from "../../types/knowledge.js";

/**
 * Recursively walk a directory and return all Markdown file paths.
 *
 * We deliberately limit Phase 2 to .md files because:
 * - they are easy to diff and maintain
 * - they avoid PDF parsing complexity
 * - they fit your current rule/guide folder plan well
 */
async function walkMarkdownFiles(dirPath: string): Promise<string[]> {
  const entries = await readdir(dirPath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walkMarkdownFiles(fullPath)));
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Build a stable document ID from the source type and file path.
 */
function makeDocumentId(sourceType: KnowledgeSourceType, relativePath: string): string {
  return `${sourceType}::${relativePath.replaceAll("\\", "/")}`;
}

/**
 * Derive a document title from the first level-1 Markdown heading if present.
 *
 * If the file has no # heading, fall back to the filename.
 */
function deriveDocumentTitle(fileName: string, rawText: string): string {
  const firstHeading = rawText
    .split(/\r?\n/)
    .find((line) => /^#\s+/.test(line.trim()));

  if (firstHeading) {
    return firstHeading.replace(/^#\s+/, "").trim();
  }

  return fileName.replace(/\.md$/i, "");
}

/**
 * Load all Markdown documents from a given source root.
 */
export async function loadDocumentsFromDirectory(
  rootDir: string,
  sourceType: KnowledgeSourceType,
  logger: Logger,
): Promise<KnowledgeDocument[]> {
  try {
    const markdownFiles = await walkMarkdownFiles(rootDir);
    const documents: KnowledgeDocument[] = [];

    for (const fullPath of markdownFiles) {
      const rawText = await readFile(fullPath, "utf8");
      const relativePath = path.relative(rootDir, fullPath);
      const fileName = path.basename(fullPath);

      documents.push({
        id: makeDocumentId(sourceType, relativePath),
        sourceType,
        filePath: fullPath,
        relativePath,
        fileName,
        title: deriveDocumentTitle(fileName, rawText),
        rawText,
      });
    }

    logger.info("Loaded knowledge documents from directory", {
      event: "knowledge.documents.loaded",
      sourceType,
      rootDir,
      documentCount: documents.length,
    });

    return documents;
  } catch (error) {
    throw new KnowledgeServiceError(
      "Failed to load knowledge documents from directory",
      {
        sourceType,
        rootDir,
      },
      error,
    );
  }
}