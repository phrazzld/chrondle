// Server-side Environment Variable Validation
// Following TDD approach: start with the simplest thing that could possibly work

/**
 * Validates required server-side environment variables
 * @throws Error if required environment variables are missing
 */
export function validateServerEnvironment(): void {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is required for AI historical context generation');
  }
}

/**
 * Gets OpenRouter API key from environment
 * @returns API key string
 * @throws Error if API key is not configured
 */
export function getOpenRouterApiKey(): string {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }
  return apiKey;
}