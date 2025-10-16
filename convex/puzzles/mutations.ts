import { v } from "convex/values";
import { mutation, DatabaseWriter } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import {
  calculateStreakUpdate,
  applyStreakUpdate,
  getUTCDateString,
} from "../lib/streakCalculation";

/**
 * Puzzle Mutations - Game State Changes
 *
 * Module: Single responsibility - game state mutations
 * Deep Module Value: Hides complex play/stats/streak logic behind simple submitGuess API
 *
 * Exports:
 * - submitGuess: Submit a guess for authenticated users
 *
 * Internal helpers (to be extracted in Phase 2):
 * - updatePuzzleStats: Will move to plays/statistics.ts
 * - updateUserStreak: Will move to streaks/mutations.ts
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
        await updateUserStreak(ctx, args.userId, true, puzzle.date);
      } else if (updatedGuesses.length >= MAX_GUESSES) {
        // Game lost - reset streak to 0 (only for today's daily puzzle)
        await updateUserStreak(ctx, args.userId, false, puzzle.date);
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

/**
 * Update puzzle statistics after completion
 *
 * TODO: Extract to convex/plays/statistics.ts in Phase 2
 *
 * Calculates:
 * - Total play count (completed games)
 * - Average guesses (rounded to 1 decimal)
 *
 * @param ctx - Database writer context
 * @param puzzleId - Puzzle to update
 */
async function updatePuzzleStats(ctx: { db: DatabaseWriter }, puzzleId: Id<"puzzles">) {
  // Get all completed plays for this puzzle
  const completedPlays = await ctx.db
    .query("plays")
    .withIndex("by_puzzle", (q) => q.eq("puzzleId", puzzleId))
    .filter((q) => q.neq(q.field("completedAt"), null))
    .collect();

  const playCount = completedPlays.length;
  if (playCount === 0) return;

  // Calculate average guesses
  const totalGuesses = completedPlays.reduce((sum: number, play) => sum + play.guesses.length, 0);
  const avgGuesses = totalGuesses / playCount;

  // Update puzzle
  await ctx.db.patch(puzzleId, {
    playCount,
    avgGuesses: Math.round(avgGuesses * 10) / 10, // Round to 1 decimal
    updatedAt: Date.now(),
  });
}

/**
 * Update user streak after completing a puzzle
 *
 * TODO: Extract to convex/streaks/mutations.ts in Phase 2
 *
 * CRITICAL BUSINESS RULE: Only updates streak for TODAY'S daily puzzle to prevent
 * archive/historical puzzle plays from affecting daily streak mechanics.
 *
 * @param ctx - Database writer context
 * @param userId - User ID to update
 * @param hasWon - Whether the user won the puzzle
 * @param puzzleDate - ISO date string (YYYY-MM-DD) of the puzzle being played
 */
async function updateUserStreak(
  ctx: { db: DatabaseWriter },
  userId: Id<"users">,
  hasWon: boolean,
  puzzleDate: string,
) {
  const user = await ctx.db.get(userId);
  if (!user) {
    console.error("[updateUserStreak] User not found:", userId);
    throw new Error("User not found");
  }

  const today = getUTCDateString();

  // CRITICAL: Only update streak for today's daily puzzle
  // Archive/historical puzzle plays should NOT affect daily streak
  if (puzzleDate !== today) {
    console.warn("[updateUserStreak] Skipping streak update for archive puzzle:", {
      puzzleDate,
      today,
      userId,
    });
    return; // No streak update for archive puzzles
  }

  // Calculate streak update using explicit discriminated union
  const update = calculateStreakUpdate(
    user.lastCompletedDate || null,
    user.currentStreak,
    today,
    hasWon,
  );

  // Log update for debugging
  console.warn("[updateUserStreak] Calculated update:", {
    userId,
    updateType: update.type,
    reason: update.reason,
    currentStreak: user.currentStreak,
  });

  // Handle no-change case explicitly (same-day replay)
  if (update.type === "no-change") {
    console.warn("[updateUserStreak] Same-day replay - preserving streak:", user.currentStreak);
    return; // No database update needed
  }

  // Apply the update to get new state
  const newState = applyStreakUpdate(
    {
      currentStreak: user.currentStreak,
      lastCompletedDate: user.lastCompletedDate || null,
    },
    update,
  );

  // Update database with new streak
  const longestStreak = Math.max(newState.currentStreak, user.longestStreak);

  await ctx.db.patch(userId, {
    currentStreak: newState.currentStreak,
    lastCompletedDate: newState.lastCompletedDate,
    longestStreak,
    updatedAt: Date.now(),
  });

  console.warn("[updateUserStreak] Updated user streak:", {
    userId,
    updateType: update.type,
    newStreak: newState.currentStreak,
    longestStreak,
  });
}
