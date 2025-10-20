/**
 * Unit tests for wager calculation utilities
 *
 * Tests all pure functions in the wager system to ensure correct
 * business logic for multipliers, outcomes, validations, and stats.
 */

import { describe, it, expect } from "vitest";
import {
  calculateMultiplier,
  validateWager,
  calculateWagerOutcome,
  createWagerRecord,
  calculateWagerStats,
  getInitialBank,
  formatPoints,
  getMultiplierDescription,
  getRecommendedWager,
} from "../wagerCalculations";
import { WAGER_CONFIG } from "@/types/wager";

describe("calculateMultiplier", () => {
  it("should return 6 for hint index 0 (first hint)", () => {
    expect(calculateMultiplier(0)).toBe(6);
  });

  it("should return 5 for hint index 1", () => {
    expect(calculateMultiplier(1)).toBe(5);
  });

  it("should return 4 for hint index 2", () => {
    expect(calculateMultiplier(2)).toBe(4);
  });

  it("should return 3 for hint index 3", () => {
    expect(calculateMultiplier(3)).toBe(3);
  });

  it("should return 2 for hint index 4", () => {
    expect(calculateMultiplier(4)).toBe(2);
  });

  it("should return 1 for hint index 5 (last hint)", () => {
    expect(calculateMultiplier(5)).toBe(1);
  });

  it("should handle out of range indices (too low)", () => {
    expect(calculateMultiplier(-1)).toBe(6); // Clamped to 0
  });

  it("should handle out of range indices (too high)", () => {
    expect(calculateMultiplier(10)).toBe(1); // Clamped to 5
  });
});

describe("validateWager", () => {
  it("should accept valid wager within range", () => {
    const result = validateWager(100, 1000);
    expect(result.isValid).toBe(true);
    expect(result.adjustedAmount).toBe(100);
    expect(result.error).toBeUndefined();
  });

  it("should reject wager below minimum", () => {
    const result = validateWager(5, 1000);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe(`Minimum wager is ${WAGER_CONFIG.MIN_WAGER} points`);
  });

  it("should reject exact minimum minus 1", () => {
    const result = validateWager(WAGER_CONFIG.MIN_WAGER - 1, 1000);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Minimum wager");
  });

  it("should accept exact minimum", () => {
    const result = validateWager(WAGER_CONFIG.MIN_WAGER, 1000);
    expect(result.isValid).toBe(true);
    expect(result.adjustedAmount).toBe(WAGER_CONFIG.MIN_WAGER);
  });

  it("should auto-adjust wager exceeding bank (all-in)", () => {
    const result = validateWager(1500, 1000);
    expect(result.isValid).toBe(true);
    expect(result.adjustedAmount).toBe(1000); // Adjusted to bank balance
  });

  it("should reject negative wager", () => {
    const result = validateWager(-50, 1000);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Wager must be a valid positive number");
  });

  it("should reject NaN wager", () => {
    const result = validateWager(NaN, 1000);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Wager must be a valid positive number");
  });

  it("should reject Infinity wager", () => {
    const result = validateWager(Infinity, 1000);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Wager must be a valid positive number");
  });

  it("should accept all-in (exact bank balance)", () => {
    const result = validateWager(1000, 1000);
    expect(result.isValid).toBe(true);
    expect(result.adjustedAmount).toBe(1000);
  });
});

describe("calculateWagerOutcome", () => {
  describe("correct guesses", () => {
    it("should calculate win on hint 1 (6x multiplier)", () => {
      const outcome = calculateWagerOutcome({
        guess: 1969,
        wagerAmount: 100,
        currentBank: 1000,
        targetYear: 1969,
        hintIndex: 0,
      });

      expect(outcome.earnings).toBe(600); // 100 × 6
      expect(outcome.newBank).toBe(1600); // 1000 + 600
      expect(outcome.isBankrupt).toBe(false);
      expect(outcome.message).toContain("Correct!");
      expect(outcome.message).toContain("600");
    });

    it("should calculate win on hint 6 (1x multiplier)", () => {
      const outcome = calculateWagerOutcome({
        guess: 1969,
        wagerAmount: 100,
        currentBank: 1000,
        targetYear: 1969,
        hintIndex: 5,
      });

      expect(outcome.earnings).toBe(100); // 100 × 1
      expect(outcome.newBank).toBe(1100); // 1000 + 100
      expect(outcome.isBankrupt).toBe(false);
    });

    it("should handle large wagers correctly", () => {
      const outcome = calculateWagerOutcome({
        guess: 2000,
        wagerAmount: 5000,
        currentBank: 10000,
        targetYear: 2000,
        hintIndex: 2, // 4x
      });

      expect(outcome.earnings).toBe(20000); // 5000 × 4
      expect(outcome.newBank).toBe(30000); // 10000 + 20000
    });
  });

  describe("incorrect guesses", () => {
    it("should calculate loss (half wager)", () => {
      const outcome = calculateWagerOutcome({
        guess: 1968,
        wagerAmount: 100,
        currentBank: 1000,
        targetYear: 1969,
        hintIndex: 0,
      });

      expect(outcome.earnings).toBe(-50); // -100 × 0.5
      expect(outcome.newBank).toBe(950); // 1000 - 50
      expect(outcome.isBankrupt).toBe(false);
      expect(outcome.message).toContain("Incorrect");
      expect(outcome.message).toContain("50");
    });

    it("should trigger bankruptcy protection when bank drops too low", () => {
      const outcome = calculateWagerOutcome({
        guess: 1968,
        wagerAmount: 100,
        currentBank: 120, // Just above bankruptcy threshold
        targetYear: 1969,
        hintIndex: 0,
      });

      expect(outcome.earnings).toBe(-50);
      // 120 - 50 = 70, which is below BANKRUPTCY_THRESHOLD (100)
      expect(outcome.newBank).toBe(WAGER_CONFIG.SAFETY_NET); // Reset to 500
      expect(outcome.isBankrupt).toBe(true);
      expect(outcome.message).toContain("Bankruptcy protection");
    });

    it("should not trigger bankruptcy if exactly at threshold", () => {
      const outcome = calculateWagerOutcome({
        guess: 1968,
        wagerAmount: 10, // Minimum wager
        currentBank: 105, // Will drop to exactly 100
        targetYear: 1969,
        hintIndex: 0,
      });

      expect(outcome.newBank).toBe(100); // 105 - 5 = 100 (exactly at threshold)
      expect(outcome.isBankrupt).toBe(false); // Should not trigger
    });

    it("should trigger bankruptcy if one point below threshold", () => {
      const outcome = calculateWagerOutcome({
        guess: 1968,
        wagerAmount: 12,
        currentBank: 105, // Will drop to 99
        targetYear: 1969,
        hintIndex: 0,
      });

      expect(outcome.newBank).toBe(WAGER_CONFIG.SAFETY_NET);
      expect(outcome.isBankrupt).toBe(true);
    });

    it("should handle odd wager amounts (floor the loss)", () => {
      const outcome = calculateWagerOutcome({
        guess: 1968,
        wagerAmount: 33, // Half is 16.5
        currentBank: 1000,
        targetYear: 1969,
        hintIndex: 0,
      });

      expect(outcome.earnings).toBe(-16); // Floor(33 × 0.5) = Floor(16.5) = 16
      expect(outcome.newBank).toBe(984); // 1000 - 16
    });
  });
});

describe("createWagerRecord", () => {
  it("should create correct record for winning wager", () => {
    const input = {
      guess: 1969,
      wagerAmount: 100,
      currentBank: 1000,
      targetYear: 1969,
      hintIndex: 0,
    };

    const outcome = calculateWagerOutcome(input);
    const record = createWagerRecord(input, outcome, 0);

    expect(record.amount).toBe(100);
    expect(record.multiplier).toBe(6);
    expect(record.guess).toBe(1969);
    expect(record.earnings).toBe(600);
    expect(record.isCorrect).toBe(true);
    expect(record.guessIndex).toBe(0);
  });

  it("should create correct record for losing wager", () => {
    const input = {
      guess: 1968,
      wagerAmount: 200,
      currentBank: 1000,
      targetYear: 1969,
      hintIndex: 2,
    };

    const outcome = calculateWagerOutcome(input);
    const record = createWagerRecord(input, outcome, 1);

    expect(record.amount).toBe(200);
    expect(record.multiplier).toBe(4);
    expect(record.guess).toBe(1968);
    expect(record.earnings).toBe(-100);
    expect(record.isCorrect).toBe(false);
    expect(record.guessIndex).toBe(1);
  });
});

describe("calculateWagerStats", () => {
  it("should calculate stats from empty wager history", () => {
    const stats = calculateWagerStats([], 1000);

    expect(stats.currentBank).toBe(1000);
    expect(stats.totalPointsEarned).toBe(0);
    expect(stats.totalPointsWagered).toBe(0);
    expect(stats.averageWinMultiplier).toBe(0);
    expect(stats.biggestWin).toBe(0);
    expect(stats.riskRewardRatio).toBe(0);
  });

  it("should calculate stats from mixed win/loss history", () => {
    const wagers = [
      { amount: 100, multiplier: 6, guess: 1969, earnings: 600, isCorrect: true, guessIndex: 0 },
      { amount: 50, multiplier: 5, guess: 1968, earnings: -25, isCorrect: false, guessIndex: 1 },
      { amount: 200, multiplier: 4, guess: 1969, earnings: 800, isCorrect: true, guessIndex: 2 },
    ];

    const stats = calculateWagerStats(wagers, 2000);

    expect(stats.currentBank).toBe(2000);
    expect(stats.totalPointsEarned).toBe(1400); // 600 + 0 + 800 (only positive)
    expect(stats.totalPointsWagered).toBe(350); // 100 + 50 + 200
    expect(stats.biggestWin).toBe(800);
    expect(stats.averageWinMultiplier).toBe(5); // (6 + 4) / 2 = 5
    expect(stats.riskRewardRatio).toBe(4); // 1400 / 350 = 4
  });

  it("should handle all losses", () => {
    const wagers = [
      { amount: 100, multiplier: 6, guess: 1968, earnings: -50, isCorrect: false, guessIndex: 0 },
      { amount: 100, multiplier: 5, guess: 1967, earnings: -50, isCorrect: false, guessIndex: 1 },
    ];

    const stats = calculateWagerStats(wagers, 900);

    expect(stats.totalPointsEarned).toBe(0); // No wins
    expect(stats.averageWinMultiplier).toBe(0); // No wins
    expect(stats.biggestWin).toBe(0);
  });
});

describe("getInitialBank", () => {
  it("should return configured initial bank", () => {
    expect(getInitialBank()).toBe(1000);
  });
});

describe("formatPoints", () => {
  it("should format points with thousand separators", () => {
    expect(formatPoints(1000)).toBe("1,000");
    expect(formatPoints(5000)).toBe("5,000");
    expect(formatPoints(123456)).toBe("123,456");
  });

  it("should handle small numbers", () => {
    expect(formatPoints(50)).toBe("50");
    expect(formatPoints(999)).toBe("999");
  });

  it("should handle zero", () => {
    expect(formatPoints(0)).toBe("0");
  });

  it("should floor decimal values", () => {
    expect(formatPoints(1234.56)).toBe("1,234");
  });
});

describe("getMultiplierDescription", () => {
  it("should return correct description for each multiplier", () => {
    expect(getMultiplierDescription(6)).toBe("Maximum risk, maximum reward!");
    expect(getMultiplierDescription(5)).toBe("Bold move with high returns");
    expect(getMultiplierDescription(4)).toBe("Confident wager");
    expect(getMultiplierDescription(3)).toBe("Moderate risk");
    expect(getMultiplierDescription(2)).toBe("Conservative play");
    expect(getMultiplierDescription(1)).toBe("Safest bet");
  });

  it("should handle invalid multipliers", () => {
    expect(getMultiplierDescription(0)).toBe("");
    expect(getMultiplierDescription(7)).toBe("");
  });
});

describe("getRecommendedWager", () => {
  it("should recommend lower percentage for high multiplier", () => {
    const rec = getRecommendedWager(1000, 6);
    // Formula: 0.2 - (6-1)*0.025 = 0.2 - 0.125 = 0.075 = 7.5%
    expect(rec).toBe(75); // 7.5% of 1000
  });

  it("should recommend higher percentage for low multiplier", () => {
    const rec = getRecommendedWager(1000, 1);
    // Formula: 0.2 - (1-1)*0.025 = 0.2 - 0 = 0.2 = 20%
    expect(rec).toBe(200); // 20% of 1000
  });

  it("should scale recommendations with bank size", () => {
    const small = getRecommendedWager(100, 3);
    const large = getRecommendedWager(10000, 3);
    expect(large).toBeGreaterThan(small);
  });

  it("should never recommend below minimum wager", () => {
    const rec = getRecommendedWager(50, 6); // Very small bank
    expect(rec).toBeGreaterThanOrEqual(WAGER_CONFIG.MIN_WAGER);
  });

  it("should never recommend above bank balance", () => {
    const bank = 200;
    const rec = getRecommendedWager(bank, 1);
    expect(rec).toBeLessThanOrEqual(bank);
  });
});
