import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

/**
 * User Statistics - User Metrics Aggregation
 *
 * Module: Single responsibility - calculate and update user statistics
 * Deep Module Value: Hides complex statistics calculation behind simple interface
 *
 * Exports:
 * - updateUserStats: Internal mutation to update user metrics after puzzle completion
 *
 * Statistics Tracked:
 * - totalPlays: Total number of completed puzzles
 * - perfectGames: Number of 1-guess completions
 * - currentStreak: Consecutive days with completed puzzles
 * - longestStreak: Maximum streak ever achieved
 *
 * Streak Logic:
 * - Continues if previous puzzle was yesterday
 * - Resets to 1 if gap > 1 day
 * - Breaks (resets to 0) on failed puzzle
 * - Unchanged if already played today
 *
 * Dependencies:
 * - Database: users table
 */

/**
 * Update user stats after completing a puzzle
 *
 * Called internally by puzzle submission mutation.
 * Updates totalPlays, perfectGames, and streak counters.
 *
 * @param userId - User ID to update
 * @param puzzleCompleted - Whether puzzle was successfully completed
 * @param guessCount - Number of guesses used (1 = perfect game)
 * @param previousPuzzleDate - ISO date string of last completed puzzle (YYYY-MM-DD)
 * @returns Updated statistics values
 */
export const updateUserStats = internalMutation({
  args: {
    userId: v.id("users"),
    puzzleCompleted: v.boolean(),
    guessCount: v.number(),
    previousPuzzleDate: v.optional(v.string()),
  },
  handler: async (ctx, { userId, puzzleCompleted, guessCount, previousPuzzleDate }) => {
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const updates: Partial<{
      updatedAt: number;
      totalPlays: number;
      perfectGames: number;
      currentStreak: number;
      longestStreak: number;
    }> = {
      updatedAt: Date.now(),
    };

    if (puzzleCompleted) {
      // Increment total plays
      updates.totalPlays = user.totalPlays + 1;

      // Check if it was a perfect game (1 guess)
      if (guessCount === 1) {
        updates.perfectGames = user.perfectGames + 1;
      }

      // Update streak
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

      if (previousPuzzleDate === yesterday) {
        // Continue streak
        updates.currentStreak = user.currentStreak + 1;
        updates.longestStreak = Math.max(user.currentStreak + 1, user.longestStreak);
      } else if (!previousPuzzleDate || previousPuzzleDate < yesterday) {
        // Start new streak
        updates.currentStreak = 1;
        updates.longestStreak = Math.max(1, user.longestStreak);
      }
      // If previousPuzzleDate is today, don't update streak (already played today)
    } else {
      // Failed puzzle breaks streak
      updates.currentStreak = 0;
    }

    await ctx.db.patch(userId, updates);

    return {
      currentStreak: updates.currentStreak ?? user.currentStreak,
      longestStreak: updates.longestStreak ?? user.longestStreak,
      totalPlays: updates.totalPlays ?? user.totalPlays,
      perfectGames: updates.perfectGames ?? user.perfectGames,
    };
  },
});
