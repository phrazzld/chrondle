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
    // Starting request for year with events
    const startTime = this.config.timeProvider.now();
    const request: AIContextRequest = { year, events };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      // Check if aborted before making request
      if (abortSignal?.aborted) {
        console.error(
          "[OpenRouter] Request aborted before attempt",
          attempt + 1,
        );
        const abortError = new DOMException(
          "The operation was aborted",
          "AbortError",
        );
        throw abortError;
      }

      console.error(
        "[OpenRouter] Attempt",
        attempt + 1,
        "of",
        this.config.maxRetries + 1,
      );
      const attemptStartTime = this.config.timeProvider.now();

      try {
        const response = await this.makeRequest(request, abortSignal);
        console.error(
          "[OpenRouter] Request successful after",
          this.config.timeProvider.now() - attemptStartTime,
          "ms",
        );
        console.error(
          "[OpenRouter] Total time:",
          this.config.timeProvider.now() - startTime,
          "ms",
        );
        return response;
      } catch (error) {
        lastError = error as Error;
        console.error("[OpenRouter] Attempt", attempt + 1, "failed:", error);

        // Don't retry on client errors or rate limits
        if (
          error instanceof OpenRouterAPIError &&
          error.status &&
          error.status < 500
        ) {
          console.error(
            "[OpenRouter] Not retrying - client error with status:",
            error.status,
          );
          throw error;
        }

        // Don't retry on rate limit errors
        if (error instanceof OpenRouterRateLimitError) {
          console.error("[OpenRouter] Not retrying - rate limit error");
          throw error;
        }

        // Don't retry on last attempt
        if (attempt === this.config.maxRetries) {
          console.error("[OpenRouter] Max retries reached");
          break;
        }

        // Check if aborted before sleeping
        if (abortSignal?.aborted) {
          console.error("[OpenRouter] Request aborted before retry sleep");
          const abortError = new DOMException(
            "The operation was aborted",
            "AbortError",
          );
          throw abortError;
        }

        // Calculate exponential backoff delay with jitter
        const delay = this.calculateBackoffDelay(attempt);
        console.error("[OpenRouter] Waiting", delay, "ms before retry...");
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
    console.error("[OpenRouter] Making request to:", this.config.apiEndpoint);
    const requestStartTime = this.config.timeProvider.now();

    try {
      const response = await fetch(this.config.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
        signal: abortSignal,
      });

      console.error(
        "[OpenRouter] Response received in",
        this.config.timeProvider.now() - requestStartTime,
        "ms",
      );
      console.error("[OpenRouter] Response status:", response?.status);

      // Handle non-success HTTP status codes
      if (!response || !response.ok) {
        if (response) {
          console.error("[OpenRouter] Handling HTTP error...");
          await this.handleHTTPError(response);
        } else {
          console.error("[OpenRouter] No response received");
          throw new OpenRouterAPIError("Invalid response received");
        }
      }

      // Parse and validate response
      console.error("[OpenRouter] Parsing response JSON...");
      const data = await response.json();
      console.error("[OpenRouter] Validating response structure...");
      const validatedResponse = this.validateResponse(data);
      console.error("[OpenRouter] Response validated successfully");
      return validatedResponse;
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
