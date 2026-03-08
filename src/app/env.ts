import "dotenv/config";

/**
 * Read an environment variable and normalize blank values to undefined.
 */
export function getEnv(name: string): string | undefined {
  const value = process.env[name];
  if (!value) return undefined;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}