/**
 * Confidence-based scoring system types
 *
 * Replaces complex wager/banking system with simple per-puzzle scoring.
 * Players express confidence level before each guess, affecting penalty for wrong guesses.
 */

export type ConfidenceLevel = "cautious" | "confident" | "bold";

/**
 * Configuration for each confidence level
 */
export interface ConfidenceConfig {
  level: ConfidenceLevel;
  penalty: number;
  bonus: number;
  label: string;
  emoji: string;
  description: string;
}

/**
 * Confidence level configurations
 *
 * Risk/Reward System:
 * - Bonus is awarded for CORRECT guesses at that confidence level
 * - Penalty is applied for WRONG guesses at that confidence level
 * - Creates strategic tradeoff: higher confidence = higher reward but higher risk
 */
export const CONFIDENCE_CONFIGS: Record<ConfidenceLevel, ConfidenceConfig> = {
  cautious: {
    level: "cautious",
    penalty: 25,
    bonus: 0,
    label: "Cautious",
    emoji: "😐",
    description: "Low risk, no bonus - Safe play when uncertain",
  },
  confident: {
    level: "confident",
    penalty: 50,
    bonus: 50,
    label: "Confident",
    emoji: "😊",
    description: "Medium risk, medium reward - Balanced approach",
  },
  bold: {
    level: "bold",
    penalty: 100,
    bonus: 100,
    label: "Bold",
    emoji: "😎",
    description: "High risk, high reward - Maximize score when certain",
  },
};

/**
 * Puzzle scoring result
 */
export interface PuzzleScore {
  /** Base score for solving at this hint level (600-100) */
  baseScore: number;

  /** Confidence levels for each wrong guess */
  wrongGuesses: ConfidenceLevel[];

  /** Confidence level of the correct guess */
  correctGuessConfidence?: ConfidenceLevel;

  /** Sum of penalties from wrong guesses */
  totalPenalties: number;

  /** Bonus points from correct guess confidence */
  correctGuessBonus: number;

  /** Final score after penalties and bonuses (min 0) */
  finalScore: number;

  /** Whether puzzle was solved with no wrong guesses */
  isPerfect: boolean;

  /** Hint index where puzzle was solved (0-5) */
  solvedAt: number;
}
