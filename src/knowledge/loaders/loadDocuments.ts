import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { Logger } from "../../app/logger.js";
import { KnowledgeError } from "../../app/errors.js";
import type { KnowledgeDocument, KnowledgeSourceType } from "../types.js";

async function walkMarkdownFiles(dirPath: string): Promise<string[]> {
  const entries = await readdir(dirPath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walkMarkdownFiles(fullPath)));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

function makeDocumentId(sourceType: KnowledgeSourceType, relativePath: string): string {
  return `${sourceType}::${relativePath.replaceAll("\\", "/")}`;
}

function deriveTitle(fileName: string, rawText: string): string {
  const firstHeading = rawText.split(/\r?\n/).find((line) => /^#\s+/.test(line.trim()));
  if (firstHeading) {
    return firstHeading.replace(/^#\s+/, "").trim();
  }

  return fileName.replace(/\.md$/i, "");
}

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
        fileName,
        title: deriveTitle(fileName, rawText),
        rawText,
      });
    }

    logger.info("Documents loaded from directory", {
      event: "knowledge.documents.loaded",
      sourceType,
      rootDir,
      count: documents.length,
    });

    return documents;
  } catch (error) {
    throw new KnowledgeError(
      `Failed to load documents from directory: ${rootDir}`,
      { sourceType, rootDir },
      error,
    );
  }
}