/**
 * Normalize text for lightweight lexical retrieval.
 *
 * The goal here is consistency, not linguistic perfection.
 * We lower-case, remove punctuation-like separators, collapse whitespace,
 * and trim the result.
 *
 * Later we can replace or augment this with:
 * - stemming
 * - stopword filtering
 * - tokenizer-aware normalization
 * - embedding-based retrieval
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Tokenize text using the same normalization strategy.
 *
 * Since retrieval depends on lexical token overlap in Phase 2,
 * it is important that query and document text are normalized the same way.
 */
export function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean);
}