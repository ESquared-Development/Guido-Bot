/**
 * Create a reasonably unique request identifier for tracing and usage logs.
 *
 * This is intentionally simple for now. It combines:
 * - current timestamp
 * - a short random suffix
 *
 * That makes it easy to correlate:
 * - Discord message events
 * - OpenAI requests
 * - usage records
 * - error logs
 */
export function createRequestId(prefix = "req"): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);

  return `${prefix}_${timestamp}_${random}`;
}