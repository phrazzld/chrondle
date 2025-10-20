import { v } from "convex/values";
import { mutation } from "../_generated/server";
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
 * - Processing wagers and updating bank balance
 * - Enforcing MAX_GUESSES limit
 *
 * @param puzzleId - Puzzle being played
 * @param userId - Authenticated user
 * @param guess - Year guess
 * @param wagerAmount - Optional wager amount (0 if not wagering)
 * @param multiplier - Optional multiplier at time of wager
 * @param earnings - Optional earnings from wager
 * @param newBank - Optional new bank balance after wager
 * @returns Guess result with correctness and updated state
 */
export const submitGuess = mutation({
  args: {
    puzzleId: v.id("puzzles"),
    userId: v.id("users"),
    guess: v.number(),
    // Optional wager fields
    wagerAmount: v.optional(v.number()),
    multiplier: v.optional(v.number()),
    earnings: v.optional(v.number()),
    newBank: v.optional(v.number()),
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

      // Update play record with guess and optional wager data
      const playUpdate: Record<string, unknown> = {
        guesses: updatedGuesses,
        completedAt: isCorrect ? Date.now() : undefined,
        updatedAt: Date.now(),
      };

      // Add wager data if provided
      if (args.wagerAmount !== undefined) {
        const existingWagers = existingPlay.wagers || [];
        const existingMultipliers = existingPlay.multipliers || [];
        const existingEarnings = existingPlay.earnings || [];

        playUpdate.wagers = [...existingWagers, args.wagerAmount];
        playUpdate.multipliers = [...existingMultipliers, args.multiplier ?? 1];
        playUpdate.earnings = [...existingEarnings, args.earnings ?? 0];

        // Set final bank balance if game is complete
        if (isCorrect || updatedGuesses.length >= MAX_GUESSES) {
          playUpdate.finalBankBalance = args.newBank;
        }
      }

      await ctx.db.patch(existingPlay._id, playUpdate);

      // Update user's bank balance if wager was made
      if (args.newBank !== undefined) {
        const user = await ctx.db.get(args.userId);
        if (user) {
          const updateData: Record<string, unknown> = {
            bank: args.newBank,
            updatedAt: Date.now(),
          };

          // Update all-time high if new bank is higher
          if (args.newBank > (user.allTimeHighBank ?? 1000)) {
            updateData.allTimeHighBank = args.newBank;
          }

          // Update lifetime stats
          if (args.earnings !== undefined && args.earnings > 0) {
            updateData.totalPointsEarned = (user.totalPointsEarned ?? 0) + args.earnings;

            // Update biggest win if this is a new record
            if (args.earnings > (user.biggestWin ?? 0)) {
              updateData.biggestWin = args.earnings;
            }

            // Update average win multiplier
            const totalWins = (user.perfectGames ?? 0) + 1; // Approximate win count
            const oldAvg = user.averageWinMultiplier ?? 0;
            const newAvg = (oldAvg * (totalWins - 1) + (args.multiplier ?? 1)) / totalWins;
            updateData.averageWinMultiplier = newAvg;
          }

          if (args.wagerAmount !== undefined) {
            updateData.totalPointsWagered = (user.totalPointsWagered ?? 0) + args.wagerAmount;
          }

          await ctx.db.patch(args.userId, updateData);
        }
      }

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
      const newPlay: Record<string, unknown> = {
        userId: args.userId,
        puzzleId: args.puzzleId,
        guesses: [args.guess],
        completedAt: isCorrect ? Date.now() : undefined,
        updatedAt: Date.now(),
      };

      // Add wager data if provided
      if (args.wagerAmount !== undefined) {
        newPlay.wagers = [args.wagerAmount];
        newPlay.multipliers = [args.multiplier ?? 1];
        newPlay.earnings = [args.earnings ?? 0];

        // Set final bank balance if game is complete on first guess
        if (isCorrect) {
          newPlay.finalBankBalance = args.newBank;
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await ctx.db.insert("plays", newPlay as any);

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
