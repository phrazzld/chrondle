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
 * - Tracking confidence levels and calculating scores
 * - Enforcing MAX_GUESSES limit
 *
 * @param puzzleId - Puzzle being played
 * @param userId - Authenticated user
 * @param guess - Year guess
 * @param confidence - Optional confidence level ("cautious" | "confident" | "bold")
 * @returns Guess result with correctness and updated state
 */
export const submitGuess = mutation({
  args: {
    puzzleId: v.id("puzzles"),
    userId: v.id("users"),
    guess: v.number(),
    // Optional confidence field
    confidence: v.optional(v.string()),
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

      // Update play record with guess and optional confidence data
      const playUpdate: Record<string, unknown> = {
        guesses: updatedGuesses,
        completedAt: isCorrect ? Date.now() : undefined,
        updatedAt: Date.now(),
      };

      // Track confidence levels if provided
      if (args.confidence !== undefined) {
        const existingConfidences = existingPlay.confidenceLevels || [];
        playUpdate.confidenceLevels = [...existingConfidences, args.confidence];

        // Track wrong guess confidences separately
        if (!isCorrect) {
          const existingWrongGuesses = existingPlay.wrongGuessConfidences || [];
          playUpdate.wrongGuessConfidences = [...existingWrongGuesses, args.confidence];
        }

        // Calculate final score if game is complete
        if (isCorrect || updatedGuesses.length >= MAX_GUESSES) {
          const wrongGuesses = playUpdate.wrongGuessConfidences as string[];
          const solvedAtHintIndex = updatedGuesses.length - 1;

          // Calculate score using confidence scoring logic with risk/reward system
          const BASE_SCORES = [600, 500, 400, 300, 200, 100];
          const PENALTIES = { cautious: 25, confident: 50, bold: 100 };
          const BONUSES = { cautious: 0, confident: 50, bold: 100 };

          const baseScore = BASE_SCORES[Math.min(solvedAtHintIndex, 5)];

          // Calculate total penalties from wrong guesses
          const totalPenalties = wrongGuesses.reduce((sum, conf) => {
            return sum + (PENALTIES[conf as keyof typeof PENALTIES] || 0);
          }, 0);

          // Calculate bonus from correct guess confidence (only if won)
          const correctGuessBonus = isCorrect
            ? BONUSES[args.confidence as keyof typeof BONUSES] || 0
            : 0;

          // Final score: base + bonus - penalties, floored at 0
          playUpdate.finalScore = Math.max(0, baseScore + correctGuessBonus - totalPenalties);
          playUpdate.isPerfect = wrongGuesses.length === 0 && isCorrect;
        }
      }

      await ctx.db.patch(existingPlay._id, playUpdate);

      // Update user scoring stats if puzzle is complete
      if (
        (isCorrect || updatedGuesses.length >= MAX_GUESSES) &&
        playUpdate.finalScore !== undefined
      ) {
        const user = await ctx.db.get(args.userId);
        if (user) {
          const finalScore = playUpdate.finalScore as number;
          const updateData: Record<string, unknown> = {
            updatedAt: Date.now(),
          };

          // Update total score (lifetime accumulation)
          updateData.totalScore = (user.totalScore ?? 0) + finalScore;

          // Update highest puzzle score if this is a new record
          if (finalScore > (user.highestPuzzleScore ?? 0)) {
            updateData.highestPuzzleScore = finalScore;
          }

          // Update average score (only for completed puzzles)
          const totalCompletedPlays = user.totalPlays ?? 0;
          if (totalCompletedPlays > 0) {
            const oldTotal = (user.averageScore ?? 0) * totalCompletedPlays;
            const newAvg = (oldTotal + finalScore) / (totalCompletedPlays + 1);
            updateData.averageScore = newAvg;
          } else {
            updateData.averageScore = finalScore;
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

      // Add confidence data if provided
      if (args.confidence !== undefined) {
        newPlay.confidenceLevels = [args.confidence];

        // Track wrong guess confidence
        if (!isCorrect) {
          newPlay.wrongGuessConfidences = [args.confidence];
        } else {
          newPlay.wrongGuessConfidences = [];
        }

        // Set final score if game is complete on first guess (perfect game)
        if (isCorrect) {
          const BASE_SCORES = [600, 500, 400, 300, 200, 100];
          const BONUSES = { cautious: 0, confident: 50, bold: 100 };

          const baseScore = BASE_SCORES[0]; // First hint = 600 points
          const bonus = BONUSES[args.confidence as keyof typeof BONUSES] || 0;

          newPlay.finalScore = baseScore + bonus; // Base + bonus for confidence
          newPlay.isPerfect = true;
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await ctx.db.insert("plays", newPlay as any);

      // Update user scoring stats if game is complete on first guess
      if (isCorrect && newPlay.finalScore !== undefined) {
        const user = await ctx.db.get(args.userId);
        if (user) {
          const finalScore = newPlay.finalScore as number;
          const updateData: Record<string, unknown> = {
            updatedAt: Date.now(),
          };

          // Update total score
          updateData.totalScore = (user.totalScore ?? 0) + finalScore;

          // Update highest puzzle score
          if (finalScore > (user.highestPuzzleScore ?? 0)) {
            updateData.highestPuzzleScore = finalScore;
          }

          // Update average score
          const totalCompletedPlays = user.totalPlays ?? 0;
          if (totalCompletedPlays > 0) {
            const oldTotal = (user.averageScore ?? 0) * totalCompletedPlays;
            const newAvg = (oldTotal + finalScore) / (totalCompletedPlays + 1);
            updateData.averageScore = newAvg;
          } else {
            updateData.averageScore = finalScore;
          }

          await ctx.db.patch(args.userId, updateData);
        }
      }

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
