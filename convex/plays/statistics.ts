import { DatabaseWriter } from "../_generated/server";
import { Id } from "../_generated/dataModel";

/**
 * Play Statistics Module
 *
 * Module: Single responsibility - aggregate puzzle statistics
 * Deep Module Value: Hides statistics calculation complexity behind simple update function
 *
 * Exports:
 * - updatePuzzleStats: Update puzzle statistics after completion
 */

/**
 * Update puzzle statistics after completion
 *
 * Calculates and updates aggregate statistics for a puzzle based on all completed plays.
 * Called by submitGuess mutation when a user completes a puzzle.
 *
 * Statistics calculated:
 * - playCount: Total number of completed plays
 * - avgGuesses: Average number of guesses across all completions (rounded to 1 decimal)
 *
 * Performance: O(n) where n = number of completed plays for the puzzle
 *
 * @param ctx - Database writer context
 * @param puzzleId - Puzzle ID to update statistics for
 */
export async function updatePuzzleStats(
  ctx: { db: DatabaseWriter },
  puzzleId: Id<"puzzles">,
): Promise<void> {
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

  // Update puzzle with calculated statistics
  await ctx.db.patch(puzzleId, {
    playCount,
    avgGuesses: Math.round(avgGuesses * 10) / 10, // Round to 1 decimal
    updatedAt: Date.now(),
  });
}
