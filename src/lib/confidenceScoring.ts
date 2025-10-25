/**
 * Confidence-based scoring system
 *
 * Risk/Reward per-puzzle scoring that rewards both early solving and confident play.
 * No persistent banking across puzzles.
 *
 * Formula: finalScore = BASE_SCORES[hintIndex] + correctBonus - sum(penalties from wrong guesses)
 * Floor: Score cannot go below 0
 *
 * Examples:
 * - Hint 1 bold correct, no wrong guesses: 600 + 100 = 700 pts (perfect bold)
 * - Hint 3 confident correct, 2 cautious misses: 400 + 50 - 50 = 400 pts
 * - Hint 3 cautious correct, no misses: 400 + 0 = 400 pts (perfect cautious)
 * - Hint 6 bold correct, 5 bold misses: 100 + 100 - 500 = 0 pts (floored)
 */

import type { ConfidenceLevel, PuzzleScore } from "@/types/confidence";
import { CONFIDENCE_CONFIGS } from "@/types/confidence";

/**
 * Base scores for each hint level
 * Decreases with each hint to reward early solving
 */
export const BASE_SCORES = [
  600, // Hint 1
  500, // Hint 2
  400, // Hint 3
  300, // Hint 4
  200, // Hint 5
  100, // Hint 6
] as const;

/**
 * Calculate puzzle score based on solving hint, correct guess confidence, and wrong guesses
 *
 * @param solvedAtHintIndex - Index of hint where puzzle was solved (0-5)
 * @param wrongGuesses - Array of confidence levels for each wrong guess
 * @param correctGuessConfidence - Confidence level of the correct guess (default: "confident")
 * @returns Complete puzzle score breakdown
 *
 * @example
 * // Perfect bold game on hint 1
 * calculateScore(0, [], 'bold') // { finalScore: 700, isPerfect: true }
 *
 * @example
 * // Hint 3 confident correct with two cautious misses
 * calculateScore(2, ['cautious', 'cautious'], 'confident') // { finalScore: 400 }
 *
 * @example
 * // Hint 1 cautious correct (no bonus)
 * calculateScore(0, [], 'cautious') // { finalScore: 600 }
 */
export function calculateScore(
  solvedAtHintIndex: number,
  wrongGuesses: ConfidenceLevel[],
  correctGuessConfidence: ConfidenceLevel = "confident",
): PuzzleScore {
  // Validate hint index
  if (solvedAtHintIndex < 0 || solvedAtHintIndex >= BASE_SCORES.length) {
    throw new Error(
      `Invalid hint index: ${solvedAtHintIndex}. Must be 0-${BASE_SCORES.length - 1}`,
    );
  }

  const baseScore = BASE_SCORES[solvedAtHintIndex];

  // Calculate total penalties from wrong guesses
  const totalPenalties = wrongGuesses.reduce((sum, level) => {
    return sum + CONFIDENCE_CONFIGS[level].penalty;
  }, 0);

  // Calculate bonus from correct guess confidence
  const correctGuessBonus = CONFIDENCE_CONFIGS[correctGuessConfidence].bonus;

  // Final score: base + bonus - penalties, floored at zero
  const finalScore = Math.max(0, baseScore + correctGuessBonus - totalPenalties);

  return {
    baseScore,
    wrongGuesses,
    correctGuessConfidence,
    totalPenalties,
    correctGuessBonus,
    finalScore,
    isPerfect: wrongGuesses.length === 0,
    solvedAt: solvedAtHintIndex,
  };
}

/**
 * Get current potential score (for displaying before puzzle completion)
 *
 * Shows what the score would be if the player solves at the current hint level
 * with the specified confidence.
 *
 * @param currentHintIndex - Current hint being shown (0-5)
 * @param wrongGuesses - Wrong guesses made so far
 * @param nextGuessConfidence - Confidence for the potential next guess (default: "confident")
 * @returns Potential score if solved now with specified confidence
 *
 * @example
 * // On hint 2 with one cautious miss, using confident
 * getPotentialScore(1, ['cautious'], 'confident') // 525 (500 + 50 - 25)
 *
 * @example
 * // On hint 2 with one cautious miss, using bold
 * getPotentialScore(1, ['cautious'], 'bold') // 575 (500 + 100 - 25)
 */
export function getPotentialScore(
  currentHintIndex: number,
  wrongGuesses: ConfidenceLevel[],
  nextGuessConfidence: ConfidenceLevel = "confident",
): number {
  const score = calculateScore(currentHintIndex, wrongGuesses, nextGuessConfidence);
  return score.finalScore;
}

/**
 * Format score for display
 *
 * @param score - Numeric score
 * @returns Formatted string with "pts" suffix
 *
 * @example
 * formatScore(450) // "450 pts"
 * formatScore(0) // "0 pts"
 */
export function formatScore(score: number): string {
  return `${score} pts`;
}

/**
 * Get score preview text for UI
 *
 * @param currentHintIndex - Current hint index
 * @param wrongGuesses - Wrong guesses so far
 * @param nextGuessConfidence - Confidence for next guess (default: "confident")
 * @returns Human-readable score preview
 *
 * @example
 * getScorePreview(0, [], 'bold') // "Potential: 700 pts"
 * getScorePreview(2, ['cautious'], 'confident') // "Potential: 425 pts"
 */
export function getScorePreview(
  currentHintIndex: number,
  wrongGuesses: ConfidenceLevel[],
  nextGuessConfidence: ConfidenceLevel = "confident",
): string {
  const potential = getPotentialScore(currentHintIndex, wrongGuesses, nextGuessConfidence);
  return `Potential: ${formatScore(potential)}`;
}

/**
 * Get penalty for a given confidence level
 *
 * @param level - Confidence level
 * @returns Penalty points for wrong guess at this level
 */
export function getPenalty(level: ConfidenceLevel): number {
  return CONFIDENCE_CONFIGS[level].penalty;
}

/**
 * Get bonus for a given confidence level
 *
 * @param level - Confidence level
 * @returns Bonus points for correct guess at this level
 */
export function getBonus(level: ConfidenceLevel): number {
  return CONFIDENCE_CONFIGS[level].bonus;
}

/**
 * Calculate what the score would be with an additional wrong guess
 *
 * Used for showing risk preview before submitting a guess.
 *
 * @param currentHintIndex - Current hint index
 * @param wrongGuesses - Wrong guesses so far
 * @param newGuessLevel - Confidence level of potential next guess
 * @returns Score if this guess is wrong
 *
 * @example
 * // On hint 2, one wrong guess, considering bold next guess
 * getScoreIfWrong(1, ['cautious'], 'bold')
 * // Would show score for hint 2 with ['cautious', 'bold'] wrong guesses
 */
export function getScoreIfWrong(
  currentHintIndex: number,
  wrongGuesses: ConfidenceLevel[],
  newGuessLevel: ConfidenceLevel,
): number {
  const hypotheticalWrongGuesses = [...wrongGuesses, newGuessLevel];
  return getPotentialScore(currentHintIndex, hypotheticalWrongGuesses);
}
