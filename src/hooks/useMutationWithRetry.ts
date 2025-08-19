"use client";

import { useRef, useCallback, useMemo } from "react";
import { useMutation as useConvexMutation } from "convex/react";
import {
  FunctionReference,
  FunctionArgs,
  FunctionReturnType,
} from "convex/server";

/**
 * Configuration for mutation retry behavior
 */
interface MutationRetryConfig {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  shouldRetry?: (error: Error) => boolean;
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Default configuration for mutation retry behavior
 */
const DEFAULT_MUTATION_RETRY_CONFIG: Required<MutationRetryConfig> = {
  maxRetries: 3,
  baseDelayMs: 1000, // 1 second
  maxDelayMs: 4000, // 4 seconds max
  shouldRetry: (error: Error) => {
    // Retry on network errors and server errors
    const message = error.message.toLowerCase();
    return (
      message.includes("network") ||
      message.includes("server error") ||
      message.includes("timeout") ||
      message.includes("fetch") ||
      message.includes("convex") ||
      message.includes("500") ||
      message.includes("502") ||
      message.includes("503") ||
      message.includes("504") ||
      // Also retry on generic Convex errors that might be transient
      message.includes("failed to fetch") ||
      message.includes("request failed")
    );
  },
  onRetry: (attempt: number, error: Error) => {
    console.warn(`[useMutationWithRetry] Retry attempt ${attempt}:`, {
      error: error.message,
      timestamp: new Date().toISOString(),
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  },
};

/**
 * Calculate exponential backoff delay with jitter
 */
function calculateBackoffDelay(
  attempt: number,
  baseDelayMs: number,
  maxDelayMs: number,
): number {
  // Exponential backoff: 1s, 2s, 4s
  const exponentialDelay = baseDelayMs * Math.pow(2, attempt);
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 0.5 + 0.75; // ±25% jitter
  const delayWithJitter = Math.floor(exponentialDelay * jitter);
  // Cap at max delay
  return Math.min(delayWithJitter, maxDelayMs);
}

/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Hook that wraps Convex useMutation with retry logic for transient errors
 *
 * @param mutation - The Convex mutation function reference
 * @param config - Optional retry configuration
 * @returns A mutation function with retry behavior
 *
 * @example
 * ```typescript
 * const submitWithRetry = useMutationWithRetry(
 *   api.puzzles.submitGuess,
 *   {
 *     maxRetries: 3,
 *     onRetry: (attempt, error) => {
 *       console.log(`Retrying submission: ${error.message}`);
 *     }
 *   }
 * );
 *
 * try {
 *   await submitWithRetry({ puzzleId, userId, guess });
 * } catch (error) {
 *   // Handle error after all retries failed
 * }
 * ```
 */
export function useMutationWithRetry<
  Mutation extends FunctionReference<"mutation">,
>(
  mutation: Mutation,
  config?: MutationRetryConfig,
): (args: FunctionArgs<Mutation>) => Promise<FunctionReturnType<Mutation>> {
  // Memoize config to avoid dependency changes
  const mergedConfig = useMemo(
    () => ({ ...DEFAULT_MUTATION_RETRY_CONFIG, ...config }),
    [config],
  );

  // Use the standard Convex mutation hook
  const mutate = useConvexMutation(mutation);

  // Track retry state
  const retryCountRef = useRef(0);

  // Create the wrapped mutation function with retry logic
  const mutateWithRetry = useCallback(
    async (
      args: FunctionArgs<Mutation>,
    ): Promise<FunctionReturnType<Mutation>> => {
      let lastError: Error | null = null;
      retryCountRef.current = 0;

      for (let attempt = 0; attempt <= mergedConfig.maxRetries; attempt++) {
        try {
          // Attempt the mutation
          const result = await mutate(args);

          // Success! Reset retry count and return
          retryCountRef.current = 0;

          if (process.env.NODE_ENV === "development" && attempt > 0) {
            console.error(
              `[useMutationWithRetry] Succeeded after ${attempt} retries:`,
              {
                mutation: "mutation",
                timestamp: new Date().toISOString(),
              },
            );
          }

          return result;
        } catch (error) {
          lastError = error as Error;

          // Check if we should retry this error
          if (!mergedConfig.shouldRetry(lastError)) {
            console.error("[useMutationWithRetry] Non-retryable error:", {
              mutation: "mutation",
              error: lastError.message,
              timestamp: new Date().toISOString(),
            });
            throw lastError;
          }

          // Don't retry on last attempt
          if (attempt === mergedConfig.maxRetries) {
            console.error("[useMutationWithRetry] Max retries reached:", {
              mutation: "mutation",
              retries: attempt,
              error: lastError.message,
              timestamp: new Date().toISOString(),
            });
            break;
          }

          // Calculate delay and log retry attempt
          const delay = calculateBackoffDelay(
            attempt,
            mergedConfig.baseDelayMs,
            mergedConfig.maxDelayMs,
          );

          // Notify about retry
          mergedConfig.onRetry(attempt + 1, lastError);

          console.error(
            `[useMutationWithRetry] Retrying ${attempt + 1}/${mergedConfig.maxRetries} after ${delay}ms`,
          );

          // Wait before retrying
          await sleep(delay);
          retryCountRef.current = attempt + 1;
        }
      }

      // If we get here, all retries failed
      const finalError =
        lastError || new Error("Mutation failed after all retries");

      console.error("[useMutationWithRetry] All retries exhausted:", {
        mutation: mutation.name || "unknown",
        totalAttempts: mergedConfig.maxRetries + 1,
        error: finalError.message,
        timestamp: new Date().toISOString(),
      });

      throw finalError;
    },
    [mutate, mutation, mergedConfig],
  );

  return mutateWithRetry;
}

/**
 * Higher-order function to create a custom mutation hook with retry logic
 * This is useful for creating specialized hooks with consistent retry behavior
 *
 * @example
 * ```typescript
 * export const useSubmitGuessWithRetry = createMutationHookWithRetry(
 *   api.puzzles.submitGuess,
 *   { maxRetries: 5 }
 * );
 * ```
 */
export function createMutationHookWithRetry<
  Mutation extends FunctionReference<"mutation">,
>(mutation: Mutation, defaultConfig?: MutationRetryConfig) {
  return function useMutationHook(
    config?: MutationRetryConfig,
  ): (args: FunctionArgs<Mutation>) => Promise<FunctionReturnType<Mutation>> {
    return useMutationWithRetry(mutation, { ...defaultConfig, ...config });
  };
}
