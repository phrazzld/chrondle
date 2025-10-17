import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { getUTCDateString } from "../lib/streakCalculation";
import { updatePuzzleStats } from "../lib/puzzleHelpers";
import { updateUserStreak } from "../lib/streakHelpers";

/**
 * Puzzle Mutations - Game State Changes
 *
 * Module: Single responsibility - game state mutations
 * Deep Module Value: Hides complex play/stats/streak logic behind simple submitGuess API
 *
 * Exports:
 * - submitGuess: Submit a guess for authenticated users
 *
 * Dependencies:
 * - updatePuzzleStats: Imported from lib/puzzleHelpers.ts
 * - updateUserStreak: Imported from lib/streakHelpers.ts
 */

// Game configuration
const MAX_GUESSES = 6;

/**
 * Submit a guess for an authenticated user
 *
 * Handles:
 * - Creating/updating play records
 * - Checking correctness against puzzle target year
 * - Updating puzzle statistics on completion
 * - Managing user streaks (daily puzzles only)
 * - Enforcing MAX_GUESSES limit
 *
 * @param puzzleId - Puzzle being played
 * @param userId - Authenticated user
 * @param guess - Year guess
 * @returns Guess result with correctness and updated state
 */
export const submitGuess = mutation({
  args: {
    puzzleId: v.id("puzzles"),
    userId: v.id("users"),
    guess: v.number(),
  },
  handler: async (ctx, args) => {
    // Get the puzzle to check the target year
    const puzzle = await ctx.db.get(args.puzzleId);
    if (!puzzle) {
      throw new Error("Puzzle not found");
    }

    // Check if play record exists
    const existingPlay = await ctx.db
      .query("plays")
      .withIndex("by_user_puzzle", (q) => q.eq("userId", args.userId).eq("puzzleId", args.puzzleId))
      .first();

    const isCorrect = args.guess === puzzle.targetYear;

    if (existingPlay) {
      // Don't allow guesses on completed puzzles
      if (existingPlay.completedAt) {
        throw new Error("Puzzle already completed");
      }

      // Add guess to existing play
      const updatedGuesses = [...existingPlay.guesses, args.guess];

      await ctx.db.patch(existingPlay._id, {
        guesses: updatedGuesses,
        completedAt: isCorrect ? Date.now() : undefined,
        updatedAt: Date.now(),
      });

      // Update puzzle stats and streak
      if (isCorrect) {
        await updatePuzzleStats(ctx, args.puzzleId);

        // Update streak with error handling to prevent breaking puzzle submission
        try {
          await updateUserStreak(ctx, args.userId, true, puzzle.date);
        } catch (error) {
          console.error("[submitGuess] Streak update failed (non-critical):", error);
          // Continue - puzzle submission still succeeds even if streak update fails
        }
      } else if (updatedGuesses.length >= MAX_GUESSES) {
        // Game lost - reset streak to 0 (only for today's daily puzzle)
        try {
          await updateUserStreak(ctx, args.userId, false, puzzle.date);
        } catch (error) {
          console.error("[submitGuess] Streak update failed (non-critical):", error);
          // Continue - puzzle submission still succeeds even if streak update fails
        }
      }

      return {
        correct: isCorrect,
        guesses: updatedGuesses,
        targetYear: puzzle.targetYear,
      };
    } else {
      // Create new play record
      await ctx.db.insert("plays", {
        userId: args.userId,
        puzzleId: args.puzzleId,
        guesses: [args.guess],
        completedAt: isCorrect ? Date.now() : undefined,
        updatedAt: Date.now(),
      });

      // Update puzzle stats and streak
      if (isCorrect) {
        await updatePuzzleStats(ctx, args.puzzleId);
        await updateUserStreak(ctx, args.userId, true, puzzle.date);
      }
      // Note: For new play records, we never have MAX_GUESSES on first submission
      // Loss streak reset only happens in the existing play path above

      return {
        correct: isCorrect,
        guesses: [args.guess],
        targetYear: puzzle.targetYear,
      };
    }
  },
});
