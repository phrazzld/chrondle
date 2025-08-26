// OpenRouter Service Client for Historical Context Generation
// Server-side integration with OpenRouter API via Next.js API routes
// Following TDD approach: start with simplest implementation

import { AI_CONFIG } from "@/lib/constants";
import type {
  AIContextRequest,
  AIContextResponse,
  AIContextError,
} from "@/lib/types/aiContext";

/**
 * Custom error types for different failure scenarios
 */
export class OpenRouterTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenRouterTimeoutError";
  }
}

export class OpenRouterRateLimitError extends Error {
  constructor(
    message: string,
    public retryAfter?: number,
  ) {
    super(message);
    this.name = "OpenRouterRateLimitError";
  }
}

export class OpenRouterAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "OpenRouterAPIError";
  }
}

/**
 * Interface for time provider (dependency injection for testing)
 */
interface TimeProvider {
  now(): number;
  sleep(ms: number): Promise<void>;
}

/**
 * Default time provider using real system time
 */
const defaultTimeProvider: TimeProvider = {
  now: () => Date.now(),
  sleep: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
};

/**
 * OpenRouter service configuration
 */
interface OpenRouterConfig {
  apiEndpoint: string;
  timeout: number;
  maxRetries: number;
  baseDelay: number;
  timeProvider?: TimeProvider;
}

/**
 * OpenRouter service client
 * Handles authentication, retries, and error classification
 */
export class OpenRouterService {
  private config: Required<OpenRouterConfig>;

  constructor(config?: Partial<OpenRouterConfig>) {
    this.config = {
      apiEndpoint: "/api/historical-context",
      timeout: AI_CONFIG.REQUEST_TIMEOUT,
      maxRetries: AI_CONFIG.RETRY_ATTEMPTS,
      baseDelay: AI_CONFIG.RETRY_DELAY,
      timeProvider: defaultTimeProvider,
      ...config,
    };
  }

  /**
   * Generate historical context for a given year and events
   * Implements exponential backoff retry with jitter
   */
  async getHistoricalContext(
    year: number,
    events: string[],
    abortSignal?: AbortSignal,
  ): Promise<AIContextResponse> {
    const request: AIContextRequest = { year, events };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      // Check if aborted before making request
      if (abortSignal?.aborted) {
        const abortError = new DOMException(
          "The operation was aborted",
          "AbortError",
        );
        throw abortError;
      }

      try {
        return await this.makeRequest(request, abortSignal);
      } catch (error) {
        lastError = error as Error;

        // Don't retry on client errors or rate limits
        if (
          error instanceof OpenRouterAPIError &&
          error.status &&
          error.status < 500
        ) {
          throw error;
        }

        // Don't retry on rate limit errors
        if (error instanceof OpenRouterRateLimitError) {
          throw error;
        }

        // Don't retry on last attempt
        if (attempt === this.config.maxRetries) {
          break;
        }

        // Check if aborted before sleeping
        if (abortSignal?.aborted) {
          const abortError = new DOMException(
            "The operation was aborted",
            "AbortError",
          );
          throw abortError;
        }

        // Calculate exponential backoff delay with jitter
        const delay = this.calculateBackoffDelay(attempt);
        await this.config.timeProvider.sleep(delay);
      }
    }

    // If we get here, all retries failed
    throw lastError || new OpenRouterAPIError("All retry attempts failed");
  }

  /**
   * Make a single HTTP request to the API endpoint
   */
  private async makeRequest(
    request: AIContextRequest,
    abortSignal?: AbortSignal,
  ): Promise<AIContextResponse> {
    try {
      const response = await fetch(this.config.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
        signal: abortSignal,
      });

      // Handle non-success HTTP status codes
      if (!response || !response.ok) {
        if (response) {
          await this.handleHTTPError(response);
        } else {
          throw new OpenRouterAPIError("Invalid response received");
        }
      }

      // Parse and validate response
      const data = await response.json();
      return this.validateResponse(data);
    } catch (error) {
      // Re-throw AbortError as-is (could be from timeout or component unmount)
      if (error instanceof Error && error.name === "AbortError") {
        throw error;
      }

      // Handle network errors that might return null response
      if (!error || typeof error !== "object") {
        throw new OpenRouterAPIError("Network error occurred");
      }

      // Re-throw other errors
      throw error;
    }
  }

  /**
   * Handle HTTP error responses with appropriate error types
   */
  private async handleHTTPError(response: Response): Promise<never> {
    const status = response.status;

    try {
      const errorData: AIContextError = await response.json();
      const errorMessage = errorData.error || `HTTP ${status} error`;

      if (status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        const retryAfterMs = retryAfter
          ? parseInt(retryAfter) * 1000
          : undefined;
        throw new OpenRouterRateLimitError(errorMessage, retryAfterMs);
      }

      throw new OpenRouterAPIError(errorMessage, status);
    } catch {
      // Handle specific case for rate limiting even if JSON parsing fails
      if (status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        const retryAfterMs = retryAfter
          ? parseInt(retryAfter) * 1000
          : undefined;
        throw new OpenRouterRateLimitError(
          `Rate limit exceeded (HTTP ${status})`,
          retryAfterMs,
        );
      }

      // If we can't parse the error response, create generic error
      throw new OpenRouterAPIError(`HTTP ${status} error`, status);
    }
  }

  /**
   * Validate API response structure
   */
  private validateResponse(data: unknown): AIContextResponse {
    if (!data || typeof data !== "object") {
      throw new OpenRouterAPIError("Invalid response format: not an object");
    }

    const responseData = data as Record<string, unknown>;
    const { context, year, generatedAt, source } = responseData;

    if (typeof context !== "string" || !context.trim()) {
      throw new OpenRouterAPIError(
        "Invalid response: missing or empty context",
      );
    }

    if (typeof year !== "number") {
      throw new OpenRouterAPIError("Invalid response: missing or invalid year");
    }

    if (typeof generatedAt !== "string") {
      throw new OpenRouterAPIError(
        "Invalid response: missing or invalid generatedAt",
      );
    }

    if (typeof source !== "string") {
      throw new OpenRouterAPIError(
        "Invalid response: missing or invalid source",
      );
    }

    return { context, year, generatedAt, source };
  }

  /**
   * Calculate exponential backoff delay with jitter
   */
  private calculateBackoffDelay(attempt: number): number {
    const exponentialDelay = this.config.baseDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 0.5 + 0.75; // ±25% jitter
    return Math.floor(exponentialDelay * jitter);
  }
}

/**
 * Default service instance
 */
export const openRouterService = new OpenRouterService();

/**
 * Convenience function for getting historical context
 */
export async function getHistoricalContext(
  year: number,
  events: string[],
): Promise<AIContextResponse> {
  return openRouterService.getHistoricalContext(year, events);
}
