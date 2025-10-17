import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

/**
 * Update puzzle with AI-generated historical context
 *
 * Internal mutation called by scheduled action after puzzle generation.
 * Validates context length (min 100 chars) and updates puzzle record.
 */
export const updateHistoricalContext = internalMutation({
  args: {
    puzzleId: v.id("puzzles"),
    context: v.string(),
  },
  handler: async (ctx, { puzzleId, context }) => {
    // Validate puzzle exists
    const puzzle = await ctx.db.get(puzzleId);
    if (!puzzle) {
      throw new Error("Puzzle not found");
    }

    // Validate context is non-empty string (min 100 chars)
    if (!context || typeof context !== "string") {
      throw new Error("Context must be a non-empty string");
    }

    if (context.length < 100) {
      throw new Error("Context must be at least 100 characters long");
    }

    // Update puzzle with historical context and timestamp
    await ctx.db.patch(puzzleId, {
      historicalContext: context,
      historicalContextGeneratedAt: Date.now(),
      updatedAt: Date.now(),
    });

    console.error(
      `[updateHistoricalContext] Successfully updated puzzle ${puzzleId} with ${context.length} character context`,
    );

    // Read back the updated puzzle to verify the update succeeded
    const updatedPuzzle = await ctx.db.get(puzzleId);

    return {
      success: true,
      puzzleId,
      contextLength: context.length,
      generatedAt: Date.now(),
      updatedPuzzle, // Include the updated puzzle for verification
    };
  },
});
