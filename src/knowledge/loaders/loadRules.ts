import path from "node:path";
import type { Logger } from "../../app/logger.js";
import type { KnowledgeDocument } from "../../types/knowledge.js";
import { loadDocumentsFromDirectory } from "./loadDocuments.js";

/**
 * Load all rule documents from the local rules/ directory.
 */
export async function loadRules(logger: Logger): Promise<KnowledgeDocument[]> {
  const rulesDir = path.join(process.cwd(), "rules");
  return loadDocumentsFromDirectory(rulesDir, "rule", logger);
}