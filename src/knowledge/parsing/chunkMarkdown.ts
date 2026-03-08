import type { KnowledgeChunk, KnowledgeDocument } from "../types.js";
import { normalizeText } from "./normalizeText.js";

interface HeadingState {
  level: number;
  title: string;
}

function buildCitationLabel(
  sourceType: "rule" | "guide",
  fileName: string,
  sectionTitle: string,
): string {
  const sourceLabel = sourceType === "rule" ? "Rules" : "Guides";
  return `${sourceLabel} → ${fileName} → ${sectionTitle}`;
}

export function chunkMarkdownDocument(document: KnowledgeDocument): KnowledgeChunk[] {
  const lines = document.rawText.split(/\r?\n/);

  const chunks: KnowledgeChunk[] = [];
  let sectionBuffer: string[] = [];
  let currentSectionTitle = document.title || document.fileName;
  let headingStack: HeadingState[] = [];
  let sectionIndex = 0;

  const flushSection = (): void => {
    const content = sectionBuffer.join("\n").trim();
    if (!content) {
      sectionBuffer = [];
      return;
    }

    const headingPath = headingStack.map((heading) => heading.title);
    const sectionTitle =
      headingPath.length > 0 ? headingPath[headingPath.length - 1]! : currentSectionTitle;

    chunks.push({
      id: `${document.id}::chunk::${sectionIndex++}`,
      documentId: document.id,
      sourceType: document.sourceType,
      filePath: document.filePath,
      fileName: document.fileName,
      title: document.title,
      headingPath,
      sectionTitle,
      content,
      normalizedContent: normalizeText(`${headingPath.join(" ")} ${content}`),
      citationLabel: buildCitationLabel(document.sourceType, document.fileName, sectionTitle),
    });

    sectionBuffer = [];
  };

  for (const line of lines) {
    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(line.trim());

    if (headingMatch) {
      flushSection();

      const hashes = headingMatch[1];
      const headingTitle = headingMatch[2];
      if (hashes === undefined || headingTitle === undefined) {
        continue;
      }

      const level = hashes.length;
      const title = headingTitle.trim() || "Untitled Section";

      headingStack = headingStack.filter((heading) => heading.level < level);
      headingStack.push({ level, title });
      currentSectionTitle = title;
      continue;
    }

    sectionBuffer.push(line);
  }

  flushSection();

  return chunks;
}