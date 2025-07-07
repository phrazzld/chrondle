import { describe, it, expect } from "vitest";
import {
  calculateClosestGuess,
  formatClosestGuessMessage,
  generateShareText,
} from "../utils";

describe("Closest Guess Functionality", () => {
  describe("calculateClosestGuess", () => {
    it("should find the closest guess correctly", () => {
      const guesses = [1990, 1950, 1975, 1960];
      const target = 1969;

      const result = calculateClosestGuess(guesses, target);

      expect(result).toEqual({
        guess: 1975,
        distance: 6,
      });
    });

    it("should handle perfect guess", () => {
      const guesses = [1990, 1969, 1975];
      const target = 1969;

      const result = calculateClosestGuess(guesses, target);

      expect(result).toEqual({
        guess: 1969,
        distance: 0,
      });
    });

    it("should handle empty guesses array", () => {
      const result = calculateClosestGuess([], 1969);
      expect(result).toBeNull();
    });

    it("should handle invalid inputs gracefully", () => {
      expect(
        calculateClosestGuess(null as unknown as number[], 1969),
      ).toBeNull();
      expect(
        calculateClosestGuess([1969], "invalid" as unknown as number),
      ).toBeNull();
    });
  });

  describe("formatClosestGuessMessage", () => {
    it("should format distance message for non-winning games", () => {
      const closestData = { guess: 1975, distance: 6 };
      const result = formatClosestGuessMessage(closestData, false);
      expect(result).toBe(" (Closest: 6 years off 🎖️)");
    });

    it("should show special formatting for 1 year off", () => {
      const closestData = { guess: 1970, distance: 1 };
      const result = formatClosestGuessMessage(closestData, false);
      expect(result).toBe(" (Closest: 1 year off! 🎯)");
    });

    it("should return empty string for winning games", () => {
      const closestData = { guess: 1969, distance: 0 };
      const result = formatClosestGuessMessage(closestData, true);
      expect(result).toBe("");
    });

    it("should return empty string for perfect guesses", () => {
      const closestData = { guess: 1969, distance: 0 };
      const result = formatClosestGuessMessage(closestData, false);
      expect(result).toBe("");
    });

    it("should handle invalid data gracefully", () => {
      expect(formatClosestGuessMessage(null, false)).toBe("");
      expect(
        formatClosestGuessMessage({ guess: 1969, distance: -1 }, false),
      ).toBe("");
    });
  });

  describe("generateShareText with closest guess", () => {
    it("should include closest guess message in share text for lost games", () => {
      const guesses = [1990, 1950, 1975];
      const target = 1969;
      const hasWon = false;

      const result = generateShareText(guesses, target, hasWon);

      expect(result).toContain("(Closest: 6 years off 🎖️)");
      expect(result).toContain("X/6");
      expect(result).toContain("♨️"); // Temperature emojis instead of boxes
      // Temperature emojis should be on same line without arrows
      expect(result).toContain("♨️ ♨️ 🔥");
    });

    it("should not include closest guess message for winning games", () => {
      const guesses = [1990, 1969];
      const target = 1969;
      const hasWon = true;

      const result = generateShareText(guesses, target, hasWon);

      expect(result).not.toContain("Closest:");
      expect(result).toContain("2/6");
    });

    it("should handle edge cases gracefully", () => {
      // Test with empty guesses
      expect(() => generateShareText([], 1969, false)).not.toThrow();

      // Test with invalid inputs
      const result = generateShareText(
        null as unknown as number[],
        1969,
        false,
      );
      expect(result).toContain("share text generation failed");
    });
  });
});
