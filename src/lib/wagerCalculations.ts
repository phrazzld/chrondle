/**
 * Pure functional wager calculation utilities
 *
 * All functions are deterministic and side-effect free for easy testing.
 * These implement the core business logic of the Chrondle Confidence Wager System.
 */

import type {
  Wager,
  WagerOutcome,
  WagerValidation,
  SubmitWagerInput,
  WagerStats,
} from "@/types/wager";
import { WAGER_CONFIG } from "@/types/wager";

/**
 * Calculate the multiplier for a given hint index
 *
 * Multiplier starts at MAX_HINTS and decreases by 1 for each hint seen.
 * - Hint 0 (first hint) = 6x
 * - Hint 1 (second hint) = 5x
 * - ...
 * - Hint 5 (sixth hint) = 1x
 *
 * @param hintIndex - Zero-based index of current hint (0-5)
 * @returns Multiplier value (1-6)
 *
 * @example
 * calculateMultiplier(0) // Returns 6 (first hint, highest multiplier)
 * calculateMultiplier(3) // Returns 3 (fourth hint, medium multiplier)
 * calculateMultiplier(5) // Returns 1 (sixth hint, lowest multiplier)
 */
export function calculateMultiplier(hintIndex: number): number {
  // Ensure hint index is within valid range
  const validIndex = Math.max(0, Math.min(hintIndex, WAGER_CONFIG.MAX_HINTS - 1));

  // Multiplier = MAX_HINTS - current hint index
  return WAGER_CONFIG.MAX_HINTS - validIndex;
}

/**
 * Validate a wager amount against current bank and configuration
 *
 * @param wagerAmount - Amount user wants to wager
 * @param currentBank - User's current bank balance
 * @returns Validation result with adjusted amount if needed
 *
 * @example
 * validateWager(500, 1000) // Valid: { isValid: true, adjustedAmount: 500 }
 * validateWager(5, 1000) // Invalid: { isValid: false, error: "Minimum wager is 10 points" }
 * validateWager(2000, 1000) // Adjusted: { isValid: true, adjustedAmount: 1000 }
 */
export function validateWager(wagerAmount: number, currentBank: number): WagerValidation {
  // Check for non-numeric or negative values
  if (!Number.isFinite(wagerAmount) || wagerAmount < 0) {
    return {
      isValid: false,
      error: "Wager must be a valid positive number",
    };
  }

  // Check minimum wager
  if (wagerAmount < WAGER_CONFIG.MIN_WAGER) {
    return {
      isValid: false,
      error: `Minimum wager is ${WAGER_CONFIG.MIN_WAGER} points`,
    };
  }

  // Check maximum wager (can't exceed bank)
  if (wagerAmount > currentBank) {
    // Auto-adjust to max available (all-in)
    return {
      isValid: true,
      adjustedAmount: currentBank,
    };
  }

  // Valid wager
  return {
    isValid: true,
    adjustedAmount: wagerAmount,
  };
}

/**
 * Calculate the outcome of a wager based on guess correctness
 *
 * @param input - Wager submission details
 * @returns Outcome including earnings and new bank balance
 *
 * @example
 * // Correct guess
 * calculateWagerOutcome({
 *   guess: 1969,
 *   wagerAmount: 100,
 *   currentBank: 1000,
 *   targetYear: 1969,
 *   hintIndex: 0
 * })
 * // Returns: { earnings: 600, newBank: 1600, isBankrupt: false, ... }
 *
 * @example
 * // Wrong guess
 * calculateWagerOutcome({
 *   guess: 1968,
 *   wagerAmount: 100,
 *   currentBank: 1000,
 *   targetYear: 1969,
 *   hintIndex: 0
 * })
 * // Returns: { earnings: -50, newBank: 950, isBankrupt: false, ... }
 */
export function calculateWagerOutcome(input: SubmitWagerInput): WagerOutcome {
  const { guess, wagerAmount, currentBank, targetYear, hintIndex } = input;

  const multiplier = calculateMultiplier(hintIndex);
  const isCorrect = guess === targetYear;

  let earnings: number;
  let message: string;

  if (isCorrect) {
    // Correct guess: earn wager × multiplier
    earnings = wagerAmount * multiplier;
    message = `Correct! Won ${earnings.toLocaleString()} points (${wagerAmount.toLocaleString()} × ${multiplier}x)`;
  } else {
    // Wrong guess: lose half the wager
    earnings = -Math.floor(wagerAmount * WAGER_CONFIG.LOSS_MULTIPLIER);
    message = `Incorrect. Lost ${Math.abs(earnings).toLocaleString()} points`;
  }

  // Calculate new bank balance
  let newBank = currentBank + earnings;

  // Check for bankruptcy
  let isBankrupt = false;
  if (newBank < WAGER_CONFIG.BANKRUPTCY_THRESHOLD) {
    newBank = WAGER_CONFIG.SAFETY_NET;
    isBankrupt = true;
    message += ` | Bankruptcy protection activated! Bank reset to ${WAGER_CONFIG.SAFETY_NET}`;
  }

  return {
    earnings,
    newBank,
    isBankrupt,
    message,
  };
}

/**
 * Create a Wager record from a guess and outcome
 *
 * @param input - Wager submission details
 * @param outcome - Calculated wager outcome
 * @param guessIndex - Index of this guess (0-based)
 * @returns Wager record for storage
 */
export function createWagerRecord(
  input: SubmitWagerInput,
  outcome: WagerOutcome,
  guessIndex: number,
): Wager {
  const { guess, wagerAmount, targetYear, hintIndex } = input;

  return {
    amount: wagerAmount,
    multiplier: calculateMultiplier(hintIndex),
    guess,
    earnings: outcome.earnings,
    isCorrect: guess === targetYear,
    guessIndex,
  };
}

/**
 * Calculate cumulative statistics from wager history
 *
 * @param wagers - Array of all wagers made by user
 * @param currentBank - Current bank balance
 * @returns Comprehensive wager statistics
 */
export function calculateWagerStats(wagers: Wager[], currentBank: number): WagerStats {
  const totalPointsEarned = wagers.reduce((sum, w) => sum + Math.max(0, w.earnings), 0);

  const totalPointsWagered = wagers.reduce((sum, w) => sum + w.amount, 0);

  const wins = wagers.filter((w) => w.isCorrect);
  const averageWinMultiplier =
    wins.length > 0 ? wins.reduce((sum, w) => sum + w.multiplier, 0) / wins.length : 0;

  const biggestWin = Math.max(0, ...wagers.map((w) => w.earnings));

  const riskRewardRatio = totalPointsWagered > 0 ? totalPointsEarned / totalPointsWagered : 0;

  // Track all-time high (current bank or calculated from history)
  const allTimeHighBank = Math.max(currentBank, biggestWin + WAGER_CONFIG.INITIAL_BANK);

  return {
    currentBank,
    allTimeHighBank,
    totalPointsEarned,
    totalPointsWagered,
    biggestWin,
    averageWinMultiplier,
    riskRewardRatio,
  };
}

/**
 * Get default/initial bank balance
 *
 * @returns Initial bank balance for new users
 */
export function getInitialBank(): number {
  return WAGER_CONFIG.INITIAL_BANK;
}

/**
 * Format points for display with proper comma separators
 *
 * @param points - Number of points to format
 * @returns Formatted string (e.g., "1,234")
 */
export function formatPoints(points: number): string {
  return Math.floor(points).toLocaleString();
}

/**
 * Get a descriptive message for a multiplier
 *
 * @param multiplier - Multiplier value (1-6)
 * @returns Human-readable description
 *
 * @example
 * getMultiplierDescription(6) // "Maximum risk, maximum reward!"
 * getMultiplierDescription(1) // "Safest bet"
 */
export function getMultiplierDescription(multiplier: number): string {
  switch (multiplier) {
    case 6:
      return "Maximum risk, maximum reward!";
    case 5:
      return "Bold move with high returns";
    case 4:
      return "Confident wager";
    case 3:
      return "Moderate risk";
    case 2:
      return "Conservative play";
    case 1:
      return "Safest bet";
    default:
      return "";
  }
}

/**
 * Calculate recommended wager based on bank and multiplier
 *
 * Suggests a conservative percentage of bank as default wager.
 * Higher multipliers suggest lower wagers (more risk already).
 *
 * @param bank - Current bank balance
 * @param multiplier - Current multiplier
 * @returns Recommended wager amount
 *
 * @example
 * getRecommendedWager(1000, 6) // ~50 (5% of bank for high multiplier)
 * getRecommendedWager(1000, 1) // ~150 (15% of bank for low multiplier)
 */
export function getRecommendedWager(bank: number, multiplier: number): number {
  // Inverse relationship: higher multiplier → lower percentage
  // Multiplier 6 → 5%, Multiplier 1 → 15%
  const percentage = 0.2 - (multiplier - 1) * 0.025;
  const recommended = Math.floor(bank * percentage);

  // Ensure it's at least minimum wager and not more than bank
  return Math.max(WAGER_CONFIG.MIN_WAGER, Math.min(recommended, bank));
}
