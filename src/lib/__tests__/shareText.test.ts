import { describe, it, expect } from "vitest";
import { generateShareText, generateEmojiTimeline } from "../utils";

describe("Share Text Generation", () => {
  describe("generateShareText", () => {
    it("should generate properly formatted share text with emojis", () => {
      const guesses = [1990, 1960, 1969];
      const targetYear = 1969;
      const hasWon = true;
      const puzzleEvents = [
        "Civil rights movement begins",
        "Moon landing occurs",
      ];

      const result = generateShareText(
        guesses,
        targetYear,
        hasWon,
        puzzleEvents,
      );

      expect(result).toContain("Chrondle:");
      expect(result).toContain("3/6");
      expect(result).toContain("Civil rights movement begins");
      expect(result).toContain("https://www.chrondle.app");

      // Should contain emojis in the timeline
      expect(result).toMatch(/[🎯♨️🔥🌡️❄️🧊]/);
    });

    it("should preserve emoji characters without URL encoding", () => {
      const guesses = [1990, 1960, 1969];
      const targetYear = 1969;
      const hasWon = true;

      const result = generateShareText(guesses, targetYear, hasWon);

      // Check that emojis are preserved as actual emoji characters
      expect(result).toContain("🎯"); // Target emoji should be present
      expect(result).toMatch(/[♨️🔥🌡️❄️🧊]/); // At least one proximity emoji

      // Should NOT contain URL encoded characters
      expect(result).not.toContain("%");
      expect(result).not.toContain("20%");
      expect(result).not.toContain("F0%9F");
    });

    it("should handle special characters in puzzle events", () => {
      const guesses = [1990, 1960, 1969];
      const targetYear = 1969;
      const hasWon = true;
      const puzzleEvents = [
        'Martin Luther King Jr.\'s "I Have a Dream" speech',
      ];

      const result = generateShareText(
        guesses,
        targetYear,
        hasWon,
        puzzleEvents,
      );

      // Should preserve quotes and apostrophes
      expect(result).toContain(
        'Martin Luther King Jr.\'s "I Have a Dream" speech',
      );
      expect(result).not.toContain("%22"); // Should not be URL encoded
      expect(result).not.toContain("%27"); // Should not be URL encoded
    });

    it("should handle closest guess with emojis for failed games", () => {
      const guesses = [1990, 1950, 1975];
      const targetYear = 1969;
      const hasWon = false;

      const result = generateShareText(guesses, targetYear, hasWon);

      expect(result).toContain("X/6");
      // 1975 is closest to 1969 (6 years off), should get 🎖️ emoji
      expect(result).toContain("(Closest: 6 years off 🎖️)");
      expect(result).not.toContain("%"); // No URL encoding
    });

    it("should handle unicode characters properly", () => {
      const guesses = [1990, 1960, 1969];
      const targetYear = 1969;
      const hasWon = true;
      const puzzleEvents = ["Événement historique français"];

      const result = generateShareText(
        guesses,
        targetYear,
        hasWon,
        puzzleEvents,
      );

      // Should preserve unicode characters
      expect(result).toContain("Événement historique français");
      expect(result).not.toContain("%C3%A9"); // Should not be URL encoded
    });

    it("should generate fallback text on error", () => {
      // Pass invalid inputs to trigger error path
      const result = generateShareText(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        null as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "invalid" as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "not boolean" as any,
      );

      expect(result).toContain("Chrondle share text generation failed");
    });
  });

  describe("generateEmojiTimeline", () => {
    it("should generate emoji timeline with correct proximity indicators", () => {
      const guesses = [1969, 1975, 1950];
      const targetYear = 1969;

      const result = generateEmojiTimeline(guesses, targetYear);

      // 1969 vs 1969 = 0 distance = 🎯
      // 1975 vs 1969 = 6 distance = 🔥 (distance <= 10)
      // 1950 vs 1969 = 19 distance = 🔥 (distance <= 10? No, 19 > 10, so ♨️)
      expect(result).toBe("🎯 🔥 ♨️");
      expect(result).not.toContain("%"); // No URL encoding
    });

    it("should handle edge cases with extreme distances", () => {
      const guesses = [1000, 2000, 1969];
      const targetYear = 1969;

      const result = generateEmojiTimeline(guesses, targetYear);

      // Should have appropriate cold/hot indicators
      expect(result).toContain("🧊"); // Very cold for 1000
      expect(result).toContain("🧊"); // Very cold for 2000
      expect(result).toContain("🎯"); // Perfect for 1969
    });

    it("should preserve emoji integrity in timeline", () => {
      const guesses = [1969, 1979, 1989, 1999, 2009, 2019];
      const targetYear = 1969;

      const result = generateEmojiTimeline(guesses, targetYear);

      // Should be exactly 6 emojis with spaces
      const parts = result.split(" ");
      expect(parts).toHaveLength(6);

      // Each part should be a single emoji character from our valid set
      const validEmojis = ["🎯", "♨️", "🔥", "🌡️", "❄️", "🧊"];
      parts.forEach((part) => {
        expect(validEmojis).toContain(part);
      });
    });
  });

  describe("Real-world sharing scenarios", () => {
    it("should generate mobile-friendly share text", () => {
      const guesses = [1990, 1960, 1969];
      const targetYear = 1969;
      const hasWon = true;
      const puzzleEvents = ["Civil rights movement begins 🏛️"];

      const result = generateShareText(
        guesses,
        targetYear,
        hasWon,
        puzzleEvents,
      );

      // Should be properly formatted for mobile sharing
      expect(result).toMatch(/^Chrondle: .+ - 3\/6\n/);
      expect(result).toContain("Civil rights movement begins 🏛️");

      // Check emoji timeline: 1990 vs 1969 = 21 -> ♨️, 1960 vs 1969 = 9 -> 🔥, 1969 vs 1969 = 0 -> 🎯
      expect(result).toContain("♨️ 🔥 🎯");
      expect(result).toContain("\n\nhttps://www.chrondle.app");

      // Should not contain any URL encoding
      expect(result).not.toContain("%");
      expect(result).not.toContain("20%");
    });

    it("should handle complex emoji sequences", () => {
      const guesses = [1969];
      const targetYear = 1969;
      const hasWon = true;
      const puzzleEvents = ["Moon landing 🚀🌙 brings hope 🌟"];

      const result = generateShareText(
        guesses,
        targetYear,
        hasWon,
        puzzleEvents,
      );

      // Should preserve complex emoji sequences
      expect(result).toContain("🚀🌙");
      expect(result).toContain("🌟");
      expect(result).not.toContain("%"); // No URL encoding
    });

    it("should handle mixed content properly", () => {
      const guesses = [1969, 1970];
      const targetYear = 1969;
      const hasWon = true;
      const puzzleEvents = [
        'Event with émojis 🎉, quotes "test", and symbols @#$%',
      ];

      const result = generateShareText(
        guesses,
        targetYear,
        hasWon,
        puzzleEvents,
      );

      // Should preserve all special characters
      expect(result).toContain("émojis 🎉");
      expect(result).toContain('quotes "test"');
      expect(result).toContain("symbols @#$%");

      // Should not URL encode anything
      expect(result).not.toContain("%C3%A9"); // é encoded
      expect(result).not.toContain("%22"); // " encoded
      expect(result).not.toContain("%40"); // @ encoded
    });
  });
});
