import { describe, it, expect } from "vitest";
import {
  getEnhancedProximityFeedback,
  getProgressiveFeedback,
  getHistoricalContextHint,
} from "../enhancedFeedback";

describe("Enhanced Feedback System", () => {
  describe("Proximity Severity Classification", () => {
    const target = 1969;

    it("classifies perfect match", () => {
      const result = getEnhancedProximityFeedback(1969, target);
      expect(result.severity).toBe("perfect");
      expect(result.message).toBe("Perfect!");
      expect(result.className).toContain("green");
    });

    it("classifies excellent severity (distance <= 2)", () => {
      const result = getEnhancedProximityFeedback(1968, target);
      expect(result.severity).toBe("excellent");
      expect(result.message).toBe("Incredibly close");
      expect(result.className).toContain("green");
    });

    it("classifies excellent severity (distance <= 5)", () => {
      const result = getEnhancedProximityFeedback(1965, target);
      expect(result.severity).toBe("excellent");
      expect(result.message).toBe("Very close");
      expect(result.className).toContain("green");
    });

    it("classifies excellent severity (distance <= 10)", () => {
      const result = getEnhancedProximityFeedback(1960, target);
      expect(result.severity).toBe("excellent");
      expect(result.message).toBe("Close");
      expect(result.className).toContain("lime");
    });

    it("classifies good severity (distance <= 25)", () => {
      const result = getEnhancedProximityFeedback(1950, target);
      expect(result.severity).toBe("good");
      expect(result.message).toBe("Getting warm");
      expect(result.className).toContain("yellow");
    });

    it("classifies okay severity (distance <= 50)", () => {
      const result = getEnhancedProximityFeedback(1920, target);
      expect(result.severity).toBe("okay");
      expect(result.message).toBe("In the ballpark");
      expect(result.className).toContain("orange");
    });

    it("classifies cold severity (distance <= 100)", () => {
      const result = getEnhancedProximityFeedback(1870, target);
      expect(result.severity).toBe("cold");
      expect(result.message).toBe("One century off");
      expect(result.className).toContain("red-400");
    });

    it("classifies cold severity (distance <= 250)", () => {
      const result = getEnhancedProximityFeedback(1750, target);
      expect(result.severity).toBe("cold");
      expect(result.message).toBe("A few centuries off");
      expect(result.className).toContain("red-500");
    });

    it("classifies frozen severity (distance <= 500)", () => {
      const result = getEnhancedProximityFeedback(1500, target);
      expect(result.severity).toBe("frozen");
      expect(result.message).toBe("Half a millennium off");
      expect(result.className).toContain("red-600");
    });

    it("classifies frozen severity (distance <= 1000)", () => {
      const result = getEnhancedProximityFeedback(1000, target);
      expect(result.severity).toBe("frozen");
      expect(result.message).toBe("Nearly a millennium off");
      expect(result.className).toContain("red-700");
    });

    it("classifies frozen severity (distance > 1000)", () => {
      const result = getEnhancedProximityFeedback(-776, target);
      expect(result.severity).toBe("frozen");
      expect(result.message).toContain("millennia apart");
      expect(result.className).toContain("gray");
    });

    it("works with distances in both directions", () => {
      const lowerGuess = getEnhancedProximityFeedback(1960, target);
      const higherGuess = getEnhancedProximityFeedback(1978, target);

      expect(lowerGuess.severity).toBe("excellent");
      expect(higherGuess.severity).toBe("excellent");
    });
  });

  describe("Threshold Boundary Edge Cases", () => {
    const target = 1000;

    it("handles exact boundary at distance 2", () => {
      const atBoundary = getEnhancedProximityFeedback(1002, target);
      const justAfter = getEnhancedProximityFeedback(1003, target);

      expect(atBoundary.severity).toBe("excellent");
      expect(atBoundary.message).toBe("Incredibly close");
      expect(justAfter.severity).toBe("excellent");
      expect(justAfter.message).toBe("Very close");
    });

    it("handles exact boundary at distance 5", () => {
      const atBoundary = getEnhancedProximityFeedback(1005, target);
      const justAfter = getEnhancedProximityFeedback(1006, target);

      expect(atBoundary.severity).toBe("excellent");
      expect(atBoundary.message).toBe("Very close");
      expect(justAfter.severity).toBe("excellent");
      expect(justAfter.message).toBe("Close");
    });

    it("handles exact boundary at distance 10", () => {
      const atBoundary = getEnhancedProximityFeedback(1010, target);
      const justAfter = getEnhancedProximityFeedback(1011, target);

      expect(atBoundary.severity).toBe("excellent");
      expect(atBoundary.message).toBe("Close");
      expect(justAfter.severity).toBe("good");
      expect(justAfter.message).toBe("Getting warm");
    });

    it("handles exact boundary at distance 25", () => {
      const atBoundary = getEnhancedProximityFeedback(1025, target);
      const justAfter = getEnhancedProximityFeedback(1026, target);

      expect(atBoundary.severity).toBe("good");
      expect(justAfter.severity).toBe("okay");
    });

    it("handles exact boundary at distance 50", () => {
      const atBoundary = getEnhancedProximityFeedback(1050, target);
      const justAfter = getEnhancedProximityFeedback(1051, target);

      expect(atBoundary.severity).toBe("okay");
      expect(justAfter.severity).toBe("cold");
    });

    it("handles exact boundary at distance 100", () => {
      const atBoundary = getEnhancedProximityFeedback(1100, target);
      const justAfter = getEnhancedProximityFeedback(1101, target);

      expect(atBoundary.severity).toBe("cold");
      expect(atBoundary.message).toBe("One century off");
      expect(justAfter.severity).toBe("cold");
      expect(justAfter.message).toBe("A few centuries off");
    });

    it("handles exact boundary at distance 250", () => {
      const atBoundary = getEnhancedProximityFeedback(1250, target);
      const justAfter = getEnhancedProximityFeedback(1251, target);

      expect(atBoundary.severity).toBe("cold");
      expect(justAfter.severity).toBe("frozen");
    });

    it("handles exact boundary at distance 500", () => {
      const atBoundary = getEnhancedProximityFeedback(1500, target);
      const justAfter = getEnhancedProximityFeedback(1501, target);

      expect(atBoundary.severity).toBe("frozen");
      expect(atBoundary.message).toBe("Half a millennium off");
      expect(justAfter.severity).toBe("frozen");
      expect(justAfter.message).toBe("Nearly a millennium off");
    });

    it("handles exact boundary at distance 1000", () => {
      const atBoundary = getEnhancedProximityFeedback(2000, target);
      const justAfter = getEnhancedProximityFeedback(2001, target);

      expect(atBoundary.severity).toBe("frozen");
      expect(atBoundary.message).toBe("Nearly a millennium off");
      expect(justAfter.severity).toBe("frozen");
      expect(justAfter.message).toContain("millennia apart");
    });
  });

  describe("BC/AD Era Transitions and Boundaries", () => {
    it("handles BC to AD transition (BC target, AD guess)", () => {
      const result = getHistoricalContextHint(-100, 100, {
        includeEraHints: true,
        difficulty: "normal",
      });

      expect(result.hint).toContain("BC");
      expect(result.hint).toContain("ancient-modern divide");
    });

    it("handles AD to BC transition (AD target, BC guess)", () => {
      const result = getHistoricalContextHint(100, -100, {
        includeEraHints: true,
        difficulty: "normal",
      });

      expect(result.hint).toContain("AD");
      expect(result.hint).toContain("ancient-modern divide");
    });

    it("handles year 0 edge case (treated as AD)", () => {
      const fromNegative = getEnhancedProximityFeedback(-5, 0);
      const fromPositive = getEnhancedProximityFeedback(5, 0);

      expect(fromNegative.severity).toBe("excellent");
      expect(fromPositive.severity).toBe("excellent");
    });

    it("handles year -1 to year 1 boundary", () => {
      const result = getHistoricalContextHint(1, -1, {
        includeEraHints: true,
        difficulty: "normal",
      });

      // Very close distances (2 years) don't get hints even across era boundary
      expect(result.hint).toBeNull();
    });

    it("handles large BC year (-776)", () => {
      const result = getEnhancedProximityFeedback(-776, -800);
      expect(result.severity).toBe("good");
      expect(result.message).toBe("Getting warm");
    });

    it("provides BC/AD era hints for cross-era guesses", () => {
      const result = getHistoricalContextHint(1969, -500, {
        includeEraHints: true,
        difficulty: "normal",
      });

      expect(result.hint).toBeDefined();
      expect(result.hint).toContain("AD");
    });

    it("handles same era transitions correctly", () => {
      // Both in AD era, far apart
      const result = getHistoricalContextHint(1969, 500, {
        includeEraHints: true,
        difficulty: "normal",
      });

      expect(result.hint).toBeDefined();
      expect(result.eraName).toBeDefined();
    });
  });

  describe("Progressive Improvement Tracking", () => {
    const target = 1969;

    it("provides neutral feedback for first guess", () => {
      const result = getProgressiveFeedback(target, 1950, {
        previousGuesses: [],
        currentDistance: 19,
        previousDistance: null,
      });

      expect(result.improvement).toBe("neutral");
      expect(result.improvementMessage).toBeDefined();
      expect(result.improvementMessage).toMatch(
        /Good start|Solid attempt|Nice first guess|First guess/,
      );
    });

    it("detects improvement (getting better)", () => {
      const result = getProgressiveFeedback(target, 1965, {
        previousGuesses: [1950],
        currentDistance: 4,
        previousDistance: 19,
      });

      expect(result.improvement).toBe("better");
      expect(result.improvementMessage).toBeDefined();
      expect(result.improvementMessage).toMatch(/warmer|closer|Better direction|Improving/);
    });

    it("detects regression (getting worse)", () => {
      const result = getProgressiveFeedback(target, 1930, {
        previousGuesses: [1965],
        currentDistance: 39,
        previousDistance: 4,
      });

      expect(result.improvement).toBe("worse");
      expect(result.improvementMessage).toBeDefined();
      expect(result.improvementMessage).toMatch(/colder|further|back up/i);
    });

    it("detects same distance", () => {
      const result = getProgressiveFeedback(target, 1979, {
        previousGuesses: [1959],
        currentDistance: 10,
        previousDistance: 10,
      });

      expect(result.improvement).toBe("same");
      expect(result.improvementMessage).toBeDefined();
      expect(result.improvementMessage).toMatch(
        /Same distance|different approach|different direction/,
      );
    });

    it("includes progressive tracking in main feedback", () => {
      const result = getEnhancedProximityFeedback(1965, target, {
        previousGuesses: [1950],
        includeProgressiveTracking: true,
      });

      expect(result.progressMessage).toBeDefined();
      expect(result.progressMessage).toMatch(/warmer|closer|Better|Improving/i);
    });

    it("excludes progressive tracking when disabled", () => {
      const result = getEnhancedProximityFeedback(1965, target, {
        previousGuesses: [1950],
        includeProgressiveTracking: false,
      });

      expect(result.progressMessage).toBeUndefined();
    });
  });

  describe("Encouragement Message Generation", () => {
    const target = 1969;

    it("generates perfect encouragement", () => {
      const result = getEnhancedProximityFeedback(1969, target);
      expect(result.encouragement).toContain("Incredible historical knowledge");
    });

    it("generates excellent encouragement for small distances", () => {
      const result = getEnhancedProximityFeedback(1967, target);
      expect(result.encouragement).toMatch(/year.*off.*outstanding|Within a decade/);
    });

    it("generates good encouragement", () => {
      const result = getEnhancedProximityFeedback(1950, target);
      expect(result.encouragement).toMatch(/Getting close|ballpark/);
    });

    it("generates okay encouragement", () => {
      const result = getEnhancedProximityFeedback(1920, target);
      expect(result.encouragement).toContain("Half a century off");
    });

    it("generates cold encouragement for century-level distances", () => {
      const result = getEnhancedProximityFeedback(1870, target);
      expect(result.encouragement).toMatch(/One century off|few centuries/);
    });

    it("generates frozen encouragement for millennium-level distances", () => {
      const result = getEnhancedProximityFeedback(1000, target);
      expect(result.encouragement).toMatch(/millennium|Ancient history/);
    });

    it("adds improvement bonus to encouragement", () => {
      const result = getEnhancedProximityFeedback(1965, target, {
        previousGuesses: [1950],
        includeProgressiveTracking: true,
      });

      expect(result.encouragement).toContain("getting warmer");
    });
  });

  describe("Historical Context Hints", () => {
    it("provides no hint for very close guesses", () => {
      const result = getHistoricalContextHint(1969, 1965, {
        includeEraHints: true,
        difficulty: "normal",
      });

      expect(result.hint).toBeNull();
    });

    it("provides no hint when includeEraHints is false", () => {
      const result = getHistoricalContextHint(1969, 1500, {
        includeEraHints: false,
        difficulty: "normal",
      });

      expect(result.hint).toBeNull();
    });

    it("provides era hint for different historical periods", () => {
      const result = getHistoricalContextHint(1969, 1500, {
        includeEraHints: true,
        difficulty: "normal",
      });

      expect(result.hint).toBeDefined();
      expect(result.eraName).toBeDefined();
    });

    it("provides century-based hint for medium distances", () => {
      const result = getHistoricalContextHint(1969, 1700, {
        includeEraHints: true,
        difficulty: "normal",
      });

      expect(result.hint).toBeDefined();
      expect(result.hint).toMatch(/centur/);
    });

    it("provides decade-based hint for same era, significant distance", () => {
      const result = getHistoricalContextHint(1980, 1950, {
        includeEraHints: true,
        difficulty: "normal",
      });

      expect(result.hint).toBeDefined();
      // For same era at this distance, we get era name with direction
      expect(result.hint).toMatch(/later|earlier/);
      expect(result.eraName).toBe("Late 20th Century");
    });

    it("skips hints for close guesses within same era", () => {
      const result = getHistoricalContextHint(1969, 1960, {
        includeEraHints: true,
        difficulty: "normal",
      });

      expect(result.hint).toBeNull();
    });

    it("includes historical context in main feedback when enabled", () => {
      const result = getEnhancedProximityFeedback(1500, 1969, {
        includeHistoricalContext: true,
      });

      expect(result.historicalHint).toBeDefined();
    });

    it("excludes historical context when disabled", () => {
      const result = getEnhancedProximityFeedback(1500, 1969, {
        includeHistoricalContext: false,
      });

      expect(result.historicalHint).toBeUndefined();
    });
  });

  describe("Message Consistency and Completeness", () => {
    it("always returns required fields", () => {
      const result = getEnhancedProximityFeedback(1950, 1969);

      expect(result.message).toBeDefined();
      expect(result.class).toBeDefined(); // Backwards compatibility
      expect(result.className).toBeDefined();
      expect(result.encouragement).toBeDefined();
      expect(result.severity).toBeDefined();
    });

    it("maintains backwards compatibility with class field", () => {
      const result = getEnhancedProximityFeedback(1950, 1969);

      expect(result.class).toBe(result.className);
    });

    it("handles all severity levels consistently", () => {
      const severityTests = [
        { guess: 1969, expected: "perfect" },
        { guess: 1968, expected: "excellent" },
        { guess: 1950, expected: "good" },
        { guess: 1920, expected: "okay" },
        { guess: 1870, expected: "cold" },
        { guess: 1000, expected: "frozen" },
      ];

      severityTests.forEach(({ guess, expected }) => {
        const result = getEnhancedProximityFeedback(guess, 1969);
        expect(result.severity).toBe(expected);
        expect(result.encouragement).toBeDefined();
        expect(result.encouragement.length).toBeGreaterThan(0);
      });
    });

    it("never returns undefined messages", () => {
      // Test a range of distances
      const distances = [0, 1, 5, 10, 25, 50, 100, 250, 500, 1000, 2000];

      distances.forEach((distance) => {
        const result = getEnhancedProximityFeedback(1969 + distance, 1969);
        expect(result.message).toBeDefined();
        expect(result.encouragement).toBeDefined();
        expect(typeof result.message).toBe("string");
        expect(typeof result.encouragement).toBe("string");
        expect(result.message.length).toBeGreaterThan(0);
        expect(result.encouragement.length).toBeGreaterThan(0);
      });
    });
  });
});
