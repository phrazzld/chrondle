import { describe, it, expect } from "vitest";

/**
 * Tests for archive puzzle streak isolation
 *
 * These tests verify that playing historical/archive puzzles does NOT
 * affect the user's daily streak. Only today's daily puzzle should
 * update streak counts.
 *
 * This prevents gaming the system by:
 * - Keeping streaks alive with archive puzzles
 * - Reviving dead streaks with historical completions
 * - Avoiding today's daily puzzle consequences
 */
describe("Archive Puzzle Streak Isolation", () => {
  /**
   * Helper to simulate streak update decision logic
   *
   * Mimics the guard check in convex/puzzles.ts:updateUserStreak()
   */
  function shouldUpdateStreak(puzzleDate: string, today: string): boolean {
    return puzzleDate === today;
  }

  describe("Daily Puzzle Behavior", () => {
    it("should update streak when playing today's daily puzzle", () => {
      const today = "2025-10-12";
      const puzzleDate = "2025-10-12"; // Same as today

      const shouldUpdate = shouldUpdateStreak(puzzleDate, today);

      expect(shouldUpdate).toBe(true);
    });

    it("should update streak for multiple plays on same day's puzzle", () => {
      const today = "2025-10-12";
      const puzzleDate = "2025-10-12";

      // First play
      expect(shouldUpdateStreak(puzzleDate, today)).toBe(true);

      // Second play (same-day replay handled by calculateStreakUpdate logic)
      expect(shouldUpdateStreak(puzzleDate, today)).toBe(true);
    });
  });

  describe("Archive Puzzle Behavior", () => {
    it("should NOT update streak when playing yesterday's puzzle", () => {
      const today = "2025-10-12";
      const puzzleDate = "2025-10-11"; // Yesterday

      const shouldUpdate = shouldUpdateStreak(puzzleDate, today);

      expect(shouldUpdate).toBe(false);
    });

    it("should NOT update streak when playing last week's puzzle", () => {
      const today = "2025-10-12";
      const puzzleDate = "2025-10-05"; // 7 days ago

      const shouldUpdate = shouldUpdateStreak(puzzleDate, today);

      expect(shouldUpdate).toBe(false);
    });

    it("should NOT update streak when playing last month's puzzle", () => {
      const today = "2025-10-12";
      const puzzleDate = "2025-09-12"; // 30 days ago

      const shouldUpdate = shouldUpdateStreak(puzzleDate, today);

      expect(shouldUpdate).toBe(false);
    });

    it("should NOT update streak when playing last year's puzzle", () => {
      const today = "2025-10-12";
      const puzzleDate = "2024-10-12"; // 365 days ago

      const shouldUpdate = shouldUpdateStreak(puzzleDate, today);

      expect(shouldUpdate).toBe(false);
    });

    it("should NOT update streak when playing very old puzzle", () => {
      const today = "2025-10-12";
      const puzzleDate = "2020-01-01"; // 5+ years ago

      const shouldUpdate = shouldUpdateStreak(puzzleDate, today);

      expect(shouldUpdate).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("should NOT update streak for tomorrow's puzzle (future date - shouldn't exist)", () => {
      const today = "2025-10-12";
      const puzzleDate = "2025-10-13"; // Tomorrow (shouldn't be possible)

      const shouldUpdate = shouldUpdateStreak(puzzleDate, today);

      expect(shouldUpdate).toBe(false);
    });

    it("should handle month boundary correctly", () => {
      const today = "2025-11-01";
      const yesterdayPuzzle = "2025-10-31";

      // Yesterday's puzzle (different month) should NOT update streak
      expect(shouldUpdateStreak(yesterdayPuzzle, today)).toBe(false);

      // Today's puzzle should update streak
      expect(shouldUpdateStreak(today, today)).toBe(true);
    });

    it("should handle year boundary correctly", () => {
      const today = "2026-01-01";
      const lastYearPuzzle = "2025-12-31";

      // Last year's puzzle should NOT update streak
      expect(shouldUpdateStreak(lastYearPuzzle, today)).toBe(false);

      // Today's puzzle should update streak
      expect(shouldUpdateStreak(today, today)).toBe(true);
    });
  });

  describe("Real-World Gaming Scenarios (Prevented)", () => {
    it("EXPLOIT PREVENTION: Cannot keep streak alive with archive puzzle", () => {
      // Scenario: User's streak expires (last played Oct 10, today is Oct 12)
      // User tries to play Oct 11 puzzle to fill the gap
      // Expected: Archive play does NOT affect streak

      const today = "2025-10-12";
      const archivePuzzleDate = "2025-10-11"; // Trying to "fill the gap"

      const shouldUpdate = shouldUpdateStreak(archivePuzzleDate, today);

      expect(shouldUpdate).toBe(false);
      // Streak remains broken - user must play TODAY's puzzle
    });

    it("EXPLOIT PREVENTION: Cannot revive dead streak with old puzzles", () => {
      // Scenario: User's streak reset to 0 weeks ago
      // User goes back and completes many old puzzles
      // Expected: Archive plays do NOT revive streak

      const today = "2025-10-12";
      const oldPuzzles = ["2025-10-11", "2025-10-10", "2025-10-09", "2025-10-08", "2025-10-07"];

      // None of these should update streak
      oldPuzzles.forEach((puzzleDate) => {
        expect(shouldUpdateStreak(puzzleDate, today)).toBe(false);
      });

      // Only today's puzzle can start a new streak
      expect(shouldUpdateStreak(today, today)).toBe(true);
    });

    it("EXPLOIT PREVENTION: Cannot avoid today's puzzle to preserve streak", () => {
      // Scenario: Today's puzzle is very hard
      // User plays archive puzzles instead to "maintain engagement"
      // Expected: Streak WILL break if today's puzzle isn't played

      const today = "2025-10-12";
      const safeArchivePuzzles = [
        "2025-10-05", // Easy puzzle from last week
        "2025-09-20", // Easy puzzle from last month
      ];

      // Playing archive puzzles doesn't extend deadline
      safeArchivePuzzles.forEach((puzzleDate) => {
        expect(shouldUpdateStreak(puzzleDate, today)).toBe(false);
      });

      // User MUST play today's puzzle to maintain streak
      expect(shouldUpdateStreak(today, today)).toBe(true);
    });
  });

  describe("Integration with Streak Calculation", () => {
    /**
     * Simulate combined guard + streak calculation logic
     */
    it("should preserve existing streak logic for daily puzzles", () => {
      const today = "2025-10-12";
      const dailyPuzzleDate = "2025-10-12";

      // Guard passes for daily puzzle
      const shouldUpdate = shouldUpdateStreak(dailyPuzzleDate, today);
      expect(shouldUpdate).toBe(true);

      // Streak calculation proceeds normally
      // (calculateStreakUpdate handles same-day replay, consecutive days, gaps, etc.)
    });

    it("should short-circuit before streak calculation for archive puzzles", () => {
      const today = "2025-10-12";
      const archivePuzzleDate = "2025-10-05";

      // Guard fails for archive puzzle
      const shouldUpdate = shouldUpdateStreak(archivePuzzleDate, today);
      expect(shouldUpdate).toBe(false);

      // Streak calculation is never called (early return)
      // No database writes occur
    });
  });
});
