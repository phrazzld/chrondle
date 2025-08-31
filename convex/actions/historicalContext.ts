"use node";

// Convex Action for Historical Context Generation
// Handles external API calls to OpenRouter for AI-generated historical narratives
// This action is called during puzzle generation to create context server-side

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import type { ActionCtx } from "../_generated/server";

// Error type for HTTP errors with status codes
interface ErrorWithStatus extends Error {
  status?: number;
}

/**
 * Internal action to generate historical context for a puzzle
 * Called by the puzzle generation cron job after creating a new puzzle
 * Makes external API call to OpenRouter to generate AI narrative
 */
export const generateHistoricalContext = internalAction({
  args: {
    puzzleId: v.id("puzzles"),
    year: v.number(),
    events: v.array(v.string()),
  },
  handler: async (ctx: ActionCtx, args): Promise<void> => {
    const { puzzleId, year } = args;

    console.error(
      `[HistoricalContext] Starting generation for puzzle ${puzzleId}, year ${year}`,
    );

    try {
      // Check if GPT-5 is enabled (allows quick rollback to Gemini if needed)
      const gpt5Enabled = process.env.OPENAI_GPT5_ENABLED !== "false";

      // Get API key from environment
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        throw new Error(
          "OPENROUTER_API_KEY not found in environment variables",
        );
      }

      // Prepare prompt using template from constants
      const eventsText = args.events.join("\n");
      const prompt = `Write a narrative for the year ${year}.

Key events:
${eventsText}

End with a haiku.`;

      // Helper functions for retry logic
      const sleep = (ms: number): Promise<void> => {
        return new Promise((resolve) => setTimeout(resolve, ms));
      };

      const calculateBackoffDelay = (attempt: number): number => {
        const baseDelay = 1000; // 1 second base delay
        const exponentialDelay = baseDelay * Math.pow(2, attempt);
        const jitter = Math.random() * 0.5 + 0.75; // ±25% jitter
        return Math.floor(exponentialDelay * jitter);
      };

      const shouldRetry = (error: ErrorWithStatus | Error): boolean => {
        // Check if error has status property (type guard)
        const errorWithStatus = error as ErrorWithStatus;

        // Don't retry client errors (4xx) or rate limits
        if (
          errorWithStatus.status &&
          errorWithStatus.status >= 400 &&
          errorWithStatus.status < 500
        ) {
          return false;
        }

        // Retry server errors (5xx) and network failures
        const message = error.message?.toLowerCase() || "";
        return (
          message.includes("network") ||
          message.includes("server error") ||
          message.includes("timeout") ||
          message.includes("fetch") ||
          message.includes("500") ||
          message.includes("502") ||
          message.includes("503") ||
          message.includes("504") ||
          message.includes("failed to fetch") ||
          message.includes("request failed") ||
          (errorWithStatus.status !== undefined &&
            errorWithStatus.status >= 500)
        );
      };

      // Retry loop with exponential backoff (max 3 attempts)
      const maxAttempts = 3;
      let lastError: Error = new Error(
        "Unknown error occurred during context generation",
      );
      let generatedContext: string | undefined;
      let currentModel = gpt5Enabled
        ? "openai/gpt-5"
        : "google/gemini-2.5-flash"; // Use GPT-5 if enabled
      let hasHitRateLimit = false;

      // Log model selection
      console.error(
        "[HistoricalContext] Using model:",
        currentModel,
        "for puzzle:",
        puzzleId,
      );

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          console.error(
            `[HistoricalContext] Attempt ${attempt + 1}/${maxAttempts} for puzzle ${puzzleId}, year ${year}`,
          );

          // Make fetch call to OpenRouter API
          const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://chrondle.com",
                "X-Title": "Chrondle Historical Context GPT-5",
              },
              body: JSON.stringify({
                model: currentModel,
                messages: [
                  {
                    role: "system",
                    content: `You write vivid historical narratives for a daily puzzle game. Use BC/AD dating exclusively.

Start with the era's context, reveal why the year mattered through its key events, and end with a haiku. Write with energy and precision—tight and punchy, but give the year its due.`,
                  },
                  {
                    role: "user",
                    content: prompt,
                  },
                ],
                temperature: 1.0,
                max_tokens: 8000,
              }),
            },
          );

          // Check if request was successful
          if (!response.ok) {
            const errorText = await response.text();
            const isGPT5Error = currentModel.includes("gpt-5");
            const errorPrefix = isGPT5Error ? "GPT-5 API" : "OpenRouter API";
            const error: ErrorWithStatus = new Error(
              `${errorPrefix} request failed: ${response.status} ${response.statusText}${isGPT5Error && response.status === 429 ? " (rate limited)" : ""}`,
            );
            error.status = response.status;
            console.error(
              `[HistoricalContext] Attempt ${attempt + 1} failed - ${errorPrefix} error: ${response.status}`,
            );
            console.error(`[HistoricalContext] Error text: ${errorText}`);
            throw error;
          }

          // Parse response
          const responseData = await response.json();
          generatedContext = responseData.choices?.[0]?.message?.content;

          if (!generatedContext || typeof generatedContext !== "string") {
            console.error(
              `[HistoricalContext] Attempt ${attempt + 1} failed - Invalid response structure from OpenRouter`,
            );
            throw new Error("Invalid response from OpenRouter API");
          }

          // Cost estimation for GPT-5 ($0.01/1K input tokens + $0.03/1K output tokens)
          if (currentModel.includes("gpt-5")) {
            const inputTokens = Math.ceil(prompt.length / 4); // Rough estimate: 4 chars per token
            const outputTokens = Math.ceil(generatedContext.length / 4);
            const costEstimate = inputTokens * 0.00001 + outputTokens * 0.00003;
            console.error(
              `[HistoricalContext] Cost estimate for ${currentModel}: $${costEstimate.toFixed(4)} (${inputTokens} input, ${outputTokens} output tokens)`,
            );
          }

          // Success! Break out of retry loop
          console.error(
            `[HistoricalContext] Attempt ${attempt + 1} succeeded - Generated ${generatedContext.length} characters for year ${year}`,
          );
          break;
        } catch (error) {
          lastError = error as Error;
          const errorWithStatus = error as ErrorWithStatus;
          console.error(
            `[HistoricalContext] Attempt ${attempt + 1}/${maxAttempts} failed for puzzle ${puzzleId}:`,
            error,
          );

          // Check for rate limit (429) and switch to GPT-5-mini if not already using it
          if (
            errorWithStatus.status === 429 &&
            !hasHitRateLimit &&
            currentModel === "openai/gpt-5"
          ) {
            console.error(
              `[HistoricalContext] Rate limit hit with GPT-5, switching to GPT-5-mini for retry`,
            );
            currentModel = "openai/gpt-5-mini";
            hasHitRateLimit = true;
            // Continue to next iteration to retry with GPT-5-mini
            await sleep(calculateBackoffDelay(attempt));
            continue;
          }

          // Check if we should retry this error
          if (!shouldRetry(error as Error) || attempt === maxAttempts - 1) {
            // Don't retry, or this was the last attempt
            console.error(
              `[HistoricalContext] Not retrying error for puzzle ${puzzleId}:`,
              error,
            );
            throw error;
          }

          // Calculate delay and sleep before next attempt
          const delay = calculateBackoffDelay(attempt);
          console.error(
            `[HistoricalContext] Retrying in ${delay}ms for puzzle ${puzzleId}...`,
          );
          await sleep(delay);
        }
      }

      if (!generatedContext) {
        throw (
          lastError ||
          new Error("Failed to generate historical context after all retries")
        );
      }

      console.error(
        `[HistoricalContext] Generated ${generatedContext.length} characters of context for year ${year}`,
      );

      // Call internal mutation to update puzzle with generated context
      const updateResult = await ctx.runMutation(
        internal.puzzles.updateHistoricalContext,
        {
          puzzleId,
          context: generatedContext,
        },
      );

      // Verify the update was successful using the returned puzzle data
      if (
        !updateResult.success ||
        !updateResult.updatedPuzzle ||
        !updateResult.updatedPuzzle.historicalContext
      ) {
        throw new Error(
          `Failed to verify historical context update for puzzle ${puzzleId}. ` +
            `Update result: success=${updateResult.success}, ` +
            `puzzle=${updateResult.updatedPuzzle ? "exists" : "null"}, ` +
            `context=${updateResult.updatedPuzzle?.historicalContext ? "present" : "missing"}`,
        );
      }

      console.error(
        `[HistoricalContext] Successfully persisted and verified context to database for puzzle ${puzzleId}`,
      );

      console.error(
        `[HistoricalContext] Successfully generated context for puzzle ${puzzleId}`,
      );
    } catch (error) {
      console.error(
        `[HistoricalContext] Failed to generate context for puzzle ${puzzleId}:`,
        error,
      );
      throw error;
    }
  },
});
