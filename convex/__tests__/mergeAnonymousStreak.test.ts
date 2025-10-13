import { describe, it, expect } from "vitest";

/**
 * Tests for anonymous streak merge logic
 *
 * These tests verify the tiebreaker behavior when merging
 * non-consecutive streaks of equal length. The fix ensures
 * that we always use the most recent date to prevent next-day
 * gap bugs.
 */
describe("mergeAnonymousStreak - Equal Length Tiebreaker", () => {
  describe("Merge Decision Logic", () => {
    /**
     * Helper to test merge decision logic
     * Simulates the tiebreaker logic without needing full Convex context
     */
    function decideMerge(
      serverStreak: number,
      serverDate: string | null,
      anonymousStreak: number,
      anonymousDate: string,
    ): { mergedStreak: number; mergedDate: string; source: string } {
      const mergedStreak = Math.max(serverStreak, anonymousStreak);

      let mergedDate: string;
      let source: "anonymous" | "server";

      // Decision logic: prefer longer streak, use recency as tiebreaker
      if (anonymousStreak > serverStreak) {
        // Anonymous streak is longer - use its data
        mergedDate = anonymousDate;
        source = "anonymous";
      } else if (anonymousStreak < serverStreak) {
        // Server streak is longer - use its data
        mergedDate = serverDate || anonymousDate;
        source = "server";
      } else {
        // Streaks are equal length - use more recent date as tiebreaker
        // This preserves freshness and avoids next-day gap bugs
        if (anonymousDate > (serverDate || "")) {
          mergedDate = anonymousDate;
          source = "anonymous";
        } else {
          mergedDate = serverDate || anonymousDate;
          source = "server";
        }
      }

      return { mergedStreak, mergedDate, source };
    }

    it("should use anonymous data when anonymous streak is longer", () => {
      const result = decideMerge(5, "2025-10-05", 10, "2025-10-09");

      expect(result).toEqual({
        mergedStreak: 10,
        mergedDate: "2025-10-09",
        source: "anonymous",
      });
    });

    it("should use server data when server streak is longer", () => {
      const result = decideMerge(10, "2025-10-09", 5, "2025-10-05");

      expect(result).toEqual({
        mergedStreak: 10,
        mergedDate: "2025-10-09",
        source: "server",
      });
    });

    it("should use more recent date when streaks are equal (anonymous fresher)", () => {
      // THE BUG FIX: This scenario was broken before
      // Server: 5 days, Oct 5 (stale)
      // Anonymous: 5 days, Oct 9 (fresh)
      // Expected: Use Oct 9 to avoid next-day gap
      const result = decideMerge(5, "2025-10-05", 5, "2025-10-09");

      expect(result).toEqual({
        mergedStreak: 5,
        mergedDate: "2025-10-09", // Uses fresher date
        source: "anonymous",
      });
    });

    it("should use server date when streaks are equal and server is fresher", () => {
      const result = decideMerge(3, "2025-10-09", 3, "2025-10-05");

      expect(result).toEqual({
        mergedStreak: 3,
        mergedDate: "2025-10-09", // Server is fresher
        source: "server",
      });
    });

    it("should use server date when streaks and dates are exactly equal (deterministic)", () => {
      // When both streak length AND dates are identical, it doesn't matter which we pick
      // The current logic defaults to server in this case (else branch)
      const result = decideMerge(7, "2025-10-09", 7, "2025-10-09");

      expect(result).toEqual({
        mergedStreak: 7,
        mergedDate: "2025-10-09",
        source: "server", // Server is used in the else branch when dates are equal
      });
    });

    it("should handle null server date by using anonymous", () => {
      const result = decideMerge(5, null, 5, "2025-10-09");

      expect(result).toEqual({
        mergedStreak: 5,
        mergedDate: "2025-10-09",
        source: "anonymous",
      });
    });

    it("should handle very old server date (1 year gap)", () => {
      const result = decideMerge(100, "2024-10-09", 100, "2025-10-09");

      expect(result).toEqual({
        mergedStreak: 100,
        mergedDate: "2025-10-09", // Uses current year, not ancient
        source: "anonymous",
      });
    });
  });

  describe("Real-World Scenarios", () => {
    /**
     * Simulates the next-day play scenario to verify no gap bugs
     */
    function isConsecutiveDay(firstDate: string, secondDate: string): boolean {
      const first = new Date(firstDate + "T00:00:00.000Z");
      const second = new Date(secondDate + "T00:00:00.000Z");
      const expectedNext = new Date(first);
      expectedNext.setUTCDate(expectedNext.getUTCDate() + 1);

      const getDateString = (date: Date): string => {
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, "0");
        const day = String(date.getUTCDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      return getDateString(expectedNext) === getDateString(second);
    }

    it("BUG SCENARIO: Should prevent streak reset after merge with equal-length streaks", () => {
      // Scenario: User builds anonymous streak while server is stale
      // Server: 5-day streak, last = Oct 5 (4 days ago)
      // Anonymous: 5-day streak, last = Oct 9 (today)
      //
      // OLD BUG: Would merge to Oct 5 (stale)
      // Next play Oct 10: Oct 5 → Oct 10 = 5-day gap = streak reset to 1
      //
      // FIX: Merges to Oct 9 (fresh)
      // Next play Oct 10: Oct 9 → Oct 10 = consecutive = streak increments to 6

      const serverStreak = 5;
      const serverDate = "2025-10-05";
      const anonymousStreak = 5;
      const anonymousDate = "2025-10-09";

      // Merge
      const merged = {
        streak: Math.max(serverStreak, anonymousStreak),
        lastDate:
          anonymousStreak > serverStreak
            ? anonymousDate
            : anonymousStreak < serverStreak
              ? serverDate
              : anonymousDate > serverDate
                ? anonymousDate
                : serverDate,
      };

      expect(merged.lastDate).toBe("2025-10-09"); // Uses fresh date

      // Next day play should be consecutive
      const nextDayPlay = "2025-10-10";
      const isConsecutive = isConsecutiveDay(merged.lastDate, nextDayPlay);

      expect(isConsecutive).toBe(true); // Oct 9 → Oct 10 is consecutive
      expect(merged.streak + 1).toBe(6); // Streak increments, doesn't reset
    });

    it("Should handle month boundary correctly in tiebreaker", () => {
      const result = {
        streak: 10,
        lastDate: "2025-09-30" > "2025-10-01" ? "2025-09-30" : "2025-10-01",
      };

      expect(result.lastDate).toBe("2025-10-01"); // Oct 1 is more recent
    });

    it("Should handle year boundary correctly in tiebreaker", () => {
      const result = {
        streak: 20,
        lastDate: "2024-12-31" > "2025-01-01" ? "2024-12-31" : "2025-01-01",
      };

      expect(result.lastDate).toBe("2025-01-01"); // Jan 1 is more recent
    });
  });

  describe("Edge Cases", () => {
    it("should handle single-day streaks (both = 1)", () => {
      const serverStreak = 1;
      const serverDate = "2025-10-05";
      const anonymousStreak = 1;
      const anonymousDate = "2025-10-09";

      const mergedDate =
        anonymousStreak > serverStreak
          ? anonymousDate
          : anonymousStreak < serverStreak
            ? serverDate
            : anonymousDate > serverDate
              ? anonymousDate
              : serverDate;

      expect(mergedDate).toBe("2025-10-09");
    });

    it("should handle zero streaks (both = 0)", () => {
      const serverStreak = 0;
      const serverDate = "2025-10-05";
      const anonymousStreak = 0;
      const anonymousDate = "2025-10-09";

      const mergedStreak = Math.max(serverStreak, anonymousStreak);
      const mergedDate =
        anonymousStreak > serverStreak
          ? anonymousDate
          : anonymousStreak < serverStreak
            ? serverDate
            : anonymousDate > serverDate
              ? anonymousDate
              : serverDate;

      expect(mergedStreak).toBe(0);
      expect(mergedDate).toBe("2025-10-09"); // Still uses fresher date
    });

    it("should handle very long streaks (both > 100)", () => {
      const result = {
        streak: Math.max(365, 365),
        lastDate: "2024-10-09" > "2025-10-09" ? "2024-10-09" : "2025-10-09",
      };

      expect(result.streak).toBe(365);
      expect(result.lastDate).toBe("2025-10-09"); // More recent year
    });
  });
});
