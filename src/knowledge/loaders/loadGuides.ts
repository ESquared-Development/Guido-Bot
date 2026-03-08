import path from "node:path";
import type { Logger } from "../../app/logger.js";
import type { KnowledgeDocument } from "../types.js";
import { loadDocumentsFromDirectory } from "./loadDocuments.js";

export async function loadGuides(logger: Logger): Promise<KnowledgeDocument[]> {
  const guidesDir = path.join(process.cwd(), "guides");
  return loadDocumentsFromDirectory(guidesDir, "guide", logger);
}