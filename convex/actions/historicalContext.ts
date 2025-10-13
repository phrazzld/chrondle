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

// Response type for OpenRouter Responses API
interface APIResponse {
  output_text: string;
  reasoning_tokens?: number;
}

/**
 * Enforces BC/AD date format in historical context text
 * Replaces any BCE/CE occurrences with BC/AD
 */
function enforceADBC(text: string): string {
  return text
    .replace(/\bBCE\b/g, "BC")
    .replace(/\bCE\b/g, "AD")
    .replace(/\b(\d+)\s*BCE\b/gi, "$1 BC")
    .replace(/\b(\d+)\s*CE\b/gi, "$1 AD");
}

/**
 * Enhances the generated historical context with post-processing
 * Applies BC/AD enforcement and formatting improvements
 */
function enhanceHistoricalContext(text: string): string {
  // 1. Enforce BC/AD format
  let enhanced = enforceADBC(text);

  // 2. Ensure proper paragraph spacing for readability
  enhanced = enhanced.replace(/\n{3,}/g, "\n\n"); // Remove excessive line breaks

  // 3. Trim any trailing whitespace
  enhanced = enhanced.trim();

  return enhanced;
}

/**
 * Builds Responses API request configuration for GPT-5
 * Uses reasoning controls for high-quality narrative generation
 */
function buildAPIConfig(args: {
  model: string;
  prompt: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
}) {
  return {
    model: args.model,
    input: `${args.systemPrompt}\n\n${args.prompt}`,
    reasoning: {
      effort: "high",
      summary: "auto",
    },
    text: {
      verbosity: "high",
      format: { type: "text" },
    },
    temperature: args.temperature,
    max_output_tokens: args.maxTokens,
  };
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

    console.error(`[HistoricalContext] Starting generation for puzzle ${puzzleId}, year ${year}`);

    try {
      // Check if GPT-5 is enabled (allows quick rollback to Gemini if needed)
      const gpt5Enabled = process.env.OPENAI_GPT5_ENABLED !== "false";

      // Get API key from environment
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        throw new Error("OPENROUTER_API_KEY not found in environment variables");
      }

      // Prepare prompt using template from constants
      const eventsText = args.events.join("\n");
      const prompt = `Create a compelling historical narrative for the year ${year}.

Key events to weave into your narrative:
${eventsText}

APPROACH:
Begin by establishing the era's broader context. What world did these events emerge from? What forces were in motion? Paint the zeitgeist—the unspoken assumptions, the dominant powers, the emerging tensions. Then narrow your focus to show how this specific year became a turning point.

Weave the events into a flowing narrative where each development feels both surprising and inevitable. Show the connections—how one event triggered another, how distant occurrences rhymed or collided. Build momentum. Make readers feel they're watching history unfold in real time, not knowing how it will end.

Ground everything in human experience. Include sensory details that make the era tangible—what people saw, heard, feared, celebrated. Show how these grand events rippled through daily life. Remember: the people living through ${year} experienced it as their present, full of uncertainty and possibility.

Throughout your narrative, search for the deeper pattern—the thread that connects these seemingly disparate events. What transformation was occurring? What was this year really about? By the end, readers should understand why ${year} mattered, not through the lens of hindsight, but through the power of its own unfolding story.

STYLE NOTES:
- Write with the urgency of unfolding drama, even in past tense
- Favor concrete details over abstractions 
- Show cause and effect through your narrative flow
- Mix punchy, declarative sentences with flowing, complex ones
- Make the pace match the period—frenetic for revolutionary years, deliberate for slow-burning changes
- Use "meanwhile" and "at the same time" to show simultaneity
- Include at least one moment that makes readers think "I had no idea that happened then"
- End with something memorable—a line that captures the year's essence

Remember: you're not just listing events or teaching history—you're telling the story of a year that changed the world.`;

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
          (errorWithStatus.status !== undefined && errorWithStatus.status >= 500)
        );
      };

      // Retry loop with exponential backoff (max 3 attempts)
      const maxAttempts = 3;
      let lastError: Error = new Error("Unknown error occurred during context generation");
      let generatedContext: string | undefined;
      let currentModel = gpt5Enabled ? "openai/gpt-5" : "google/gemini-2.5-flash"; // Use GPT-5 if enabled
      let hasHitRateLimit = false;

      // Log model selection
      console.error("[HistoricalContext] Using model:", currentModel, "for puzzle:", puzzleId);

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          console.error(
            `[HistoricalContext] Attempt ${attempt + 1}/${maxAttempts} for puzzle ${puzzleId}, year ${year}`,
          );

          // Make fetch call to OpenRouter API
          const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
                  content: `You are a master historian crafting a vivid narrative. Channel the storytelling power of Barbara Tuchman, the narrative confidence of Tom Holland, and the immersive drama of Dan Carlin.

Your readers need to understand not just what happened, but what it felt like to live through this year—its texture, its tensions, its transformations.

Use BC/AD dating exclusively. Write 350-450 words that make readers feel they're witnessing history unfold.`,
                },
                {
                  role: "user",
                  content: prompt,
                },
              ],
              temperature: 1.0,
              max_tokens: 8000,
            }),
          });

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
            console.error(`[HistoricalContext] Not retrying error for puzzle ${puzzleId}:`, error);
            throw error;
          }

          // Calculate delay and sleep before next attempt
          const delay = calculateBackoffDelay(attempt);
          console.error(`[HistoricalContext] Retrying in ${delay}ms for puzzle ${puzzleId}...`);
          await sleep(delay);
        }
      }

      if (!generatedContext) {
        throw lastError || new Error("Failed to generate historical context after all retries");
      }

      console.error(
        `[HistoricalContext] Generated ${generatedContext.length} characters of context for year ${year}`,
      );

      // Apply post-processing to enhance the generated context
      const enhancedContext = enhanceHistoricalContext(generatedContext);
      console.error(
        `[HistoricalContext] Enhanced context to ${enhancedContext.length} characters after post-processing`,
      );

      // Call internal mutation to update puzzle with enhanced context
      const updateResult = await ctx.runMutation(internal.puzzles.updateHistoricalContext, {
        puzzleId,
        context: enhancedContext,
      });

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

      console.error(`[HistoricalContext] Successfully generated context for puzzle ${puzzleId}`);
    } catch (error) {
      console.error(
        `[HistoricalContext] Failed to generate context for puzzle ${puzzleId}:`,
        error,
      );
      throw error;
    }
  },
});
