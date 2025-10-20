/**
 * Wager system type definitions
 *
 * The Chrondle Confidence Wager System allows players to bet points on their guesses,
 * with multipliers based on how many hints they've seen. This rewards knowledge and
 * confidence while creating strategic tension.
 */

/**
 * Wager configuration constants
 */
export const WAGER_CONFIG = {
  /** Starting bank balance for new players */
  INITIAL_BANK: 1000,

  /** Minimum wager amount per guess */
  MIN_WAGER: 10,

  /** Bankruptcy threshold - reset to safety net if below this */
  BANKRUPTCY_THRESHOLD: 100,

  /** Safety net amount after bankruptcy */
  SAFETY_NET: 500,

  /** Maximum number of hints (determines max multiplier) */
  MAX_HINTS: 6,

  /** Loss multiplier - lose this fraction of wager when wrong */
  LOSS_MULTIPLIER: 0.5, // Lose half the wager
} as const;

/**
 * Achievement thresholds for wager system
 */
export const WAGER_ACHIEVEMENTS = {
  CONFIDENT_HISTORIAN: 5_000,
  MASTER_WAGERER: 10_000,
  CHRONDLE_TYCOON: 50_000,
  EARLY_BIRD_STREAK: 5, // Win on hint 1 for 5+ consecutive days
  CONSERVATIVE_SCHOLAR_DAYS: 30, // Never drop below 1000 for 30 days
} as const;

/**
 * Represents a single wager made on a guess
 */
export interface Wager {
  /** Amount of points wagered */
  amount: number;

  /** Multiplier at time of wager (based on hint index) */
  multiplier: number;

  /** The guess that was made */
  guess: number;

  /** Points earned (positive) or lost (negative) */
  earnings: number;

  /** Whether the guess was correct */
  isCorrect: boolean;

  /** Index of the guess (0-based) */
  guessIndex: number;
}

/**
 * Wager statistics for a user
 */
export interface WagerStats {
  /** Current bank balance */
  currentBank: number;

  /** All-time highest bank balance */
  allTimeHighBank: number;

  /** Total points earned across all puzzles */
  totalPointsEarned: number;

  /** Total points wagered across all puzzles */
  totalPointsWagered: number;

  /** Largest single puzzle score */
  biggestWin: number;

  /** Average multiplier when winning */
  averageWinMultiplier: number;

  /** Risk-reward ratio (earned / wagered) */
  riskRewardRatio: number;

  /** Number of times hit bankruptcy */
  bankruptcyCount?: number;

  /** Current streak of winning on hint 1 */
  earlyBirdStreak?: number;

  /** Days without dropping below 1000 bank */
  conservativeDays?: number;
}

/**
 * Wager data for a single puzzle play
 */
export interface PuzzleWagerData {
  /** Array of wagers made during this puzzle */
  wagers: Wager[];

  /** Bank balance at start of puzzle */
  startingBank: number;

  /** Bank balance at end of puzzle */
  finalBank: number;

  /** Total points earned/lost in this puzzle */
  netEarnings: number;

  /** Whether the puzzle was completed */
  isComplete: boolean;

  /** Whether the puzzle was won */
  hasWon: boolean;
}

/**
 * Result of calculating wager outcome
 */
export interface WagerOutcome {
  /** Points earned (positive) or lost (negative) */
  earnings: number;

  /** New bank balance after applying earnings */
  newBank: number;

  /** Whether bankruptcy protection was triggered */
  isBankrupt: boolean;

  /** Message describing the outcome */
  message: string;
}

/**
 * Input for submitting a wager with a guess
 */
export interface SubmitWagerInput {
  /** Year being guessed */
  guess: number;

  /** Amount of points to wager */
  wagerAmount: number;

  /** Current bank balance */
  currentBank: number;

  /** Target year (correct answer) */
  targetYear: number;

  /** Current hint index (0-based) */
  hintIndex: number;
}

/**
 * Validation result for a wager
 */
export interface WagerValidation {
  /** Whether the wager is valid */
  isValid: boolean;

  /** Error message if invalid */
  error?: string;

  /** The validated/adjusted wager amount */
  adjustedAmount?: number;
}
