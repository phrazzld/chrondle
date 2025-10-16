import { v } from "convex/values";
import { query, internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Re-export query functions for backward compatibility (until Phase 4 frontend migration)
export {
  getDailyPuzzle,
  getPuzzleById,
  getPuzzleByNumber,
  getArchivePuzzles,
  getTotalPuzzles,
  getPuzzleYears,
} from "./puzzles/queries";

// Re-export mutation functions for backward compatibility
export { submitGuess } from "./puzzles/mutations";

// Re-export generation functions for backward compatibility
export {
  generateDailyPuzzle,
  ensureTodaysPuzzle,
  manualGeneratePuzzle,
} from "./puzzles/generation";

// Re-export play queries for backward compatibility
export { getUserPlay, getUserCompletedPuzzles } from "./plays/queries";

// Get next cron schedule for countdown system
export const getCronSchedule = query({
  handler: async () => {
    try {
      // Always calculate the next upcoming midnight UTC
      const now = new Date();

      // Create tomorrow at midnight UTC
      const tomorrow = new Date(now);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      tomorrow.setUTCHours(0, 0, 0, 0);

      // If it's currently exactly midnight (rare edge case), use today's midnight
      const nextMidnightUTC =
        now.getUTCHours() === 0 && now.getUTCMinutes() === 0 && now.getUTCSeconds() < 10
          ? new Date(now.setUTCHours(0, 0, 0, 0))
          : tomorrow;

      return {
        nextScheduledTime: nextMidnightUTC.getTime(), // Unix timestamp
        currentServerTime: now.getTime(), // For time synchronization
        cronConfig: {
          hourUTC: 0,
          minuteUTC: 0,
          timezone: "UTC",
          frequency: "daily",
        },
        timeUntilNext: nextMidnightUTC.getTime() - Date.now(),
      };
    } catch (error) {
      console.error("Failed to get cron schedule:", error);

      // Fallback to 24-hour default countdown
      const now = new Date();
      const fallbackTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      return {
        nextScheduledTime: fallbackTime.getTime(),
        currentServerTime: now.getTime(),
        cronConfig: null, // Indicates fallback mode
        timeUntilNext: 24 * 60 * 60 * 1000,
        fallback: true,
      };
    }
  },
});

// Internal mutation to update puzzle with historical context
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
