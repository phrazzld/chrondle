// Convex Action for Historical Context Generation
// Handles external API calls to OpenRouter for AI-generated historical narratives
// This action is called during puzzle generation to create context server-side

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
// import { internal } from "../_generated/api";
import type { ActionCtx } from "../_generated/server";

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
  handler: async (_ctx: ActionCtx, args): Promise<void> => {
    const { puzzleId, year } = args;

    console.error(
      `[HistoricalContext] Starting generation for puzzle ${puzzleId}, year ${year}`,
    );

    try {
      // TODO: Implement OpenRouter API call with fetch
      // TODO: Add retry logic with exponential backoff
      // TODO: Parse response and extract content

      // Placeholder for now - will implement in next tasks
      // const generatedContext = `Historical context for ${year} will be generated here`;

      // TODO: Call internal mutation to update puzzle with generated context
      // await ctx.runMutation(internal.puzzles.updateHistoricalContext, {
      //   puzzleId,
      //   context: generatedContext,
      // });

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
