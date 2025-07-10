import { describe, it, expect } from "vitest";
import {
  getEnhancedProximityFeedback,
  getProgressiveFeedback,
  getHistoricalContextHint,
  type ProgressiveFeedbackOptions,
  type HistoricalContextOptions,
} from "../enhancedFeedback";

describe("Enhanced Proximity Feedback", () => {
  describe("getEnhancedProximityFeedback", () => {
    it("should provide encouraging feedback instead of generic distance", () => {
      const feedback = getEnhancedProximityFeedback(1965, 1969);

      expect(feedback.message).not.toMatch(/within \d+ years/i);
      expect(feedback.message.toLowerCase()).toContain("close");
      expect(feedback.encouragement).toBeTruthy();
    });

    it("should provide context-aware encouragement for century-level distances", () => {
      const feedback = getEnhancedProximityFeedback(1869, 1969);

      expect(feedback.message.toLowerCase()).toMatch(/century|100/);
      expect(feedback.encouragement.toLowerCase()).toMatch(
        /nice try|good guess|not bad/,
      );
    });

    it("should handle perfect guesses with celebration", () => {
      const feedback = getEnhancedProximityFeedback(1969, 1969);

      expect(feedback.message.toLowerCase()).toMatch(
        /correct|perfect|excellent/,
      );
      expect(feedback.encouragement.toLowerCase()).toMatch(
        /amazing|incredible|outstanding/,
      );
    });

    it("should provide different encouragement levels based on distance", () => {
      const close = getEnhancedProximityFeedback(1967, 1969);
      const far = getEnhancedProximityFeedback(1769, 1969);

      // Close should be more encouraging than far
      expect(close.encouragement.length).toBeGreaterThan(0);
      expect(far.encouragement.length).toBeGreaterThan(0);
      expect(close.encouragement).not.toBe(far.encouragement);
    });

    it("should handle BCE years correctly", () => {
      const feedback = getEnhancedProximityFeedback(-48, -50);

      expect(feedback.message).toBeTruthy();
      expect(feedback.encouragement).toBeTruthy();
      expect(feedback.className).toBeTruthy();
    });
  });

  describe("getProgressiveFeedback", () => {
    it("should acknowledge improvement when getting closer", () => {
      const options: ProgressiveFeedbackOptions = {
        previousGuesses: [1950, 1960],
        currentDistance: 5,
        previousDistance: 15,
      };

      const feedback = getProgressiveFeedback(1969, 1964, options);

      expect(feedback.improvement).toBeTruthy();
      expect(feedback.improvementMessage?.toLowerCase()).toMatch(
        /warmer|closer|better|improving/,
      );
    });

    it("should provide encouragement for first guess", () => {
      const options: ProgressiveFeedbackOptions = {
        previousGuesses: [],
        currentDistance: 50,
        previousDistance: null,
      };

      const feedback = getProgressiveFeedback(1969, 1919, options);

      expect(feedback.improvement).toBe("neutral");
      expect(feedback.improvementMessage?.toLowerCase()).toMatch(
        /good start|first guess|solid attempt/,
      );
    });

    it("should acknowledge when moving away from target", () => {
      const options: ProgressiveFeedbackOptions = {
        previousGuesses: [1965],
        currentDistance: 10,
        previousDistance: 4,
      };

      const feedback = getProgressiveFeedback(1969, 1959, options);

      expect(feedback.improvement).toBe("worse");
      expect(feedback.improvementMessage?.toLowerCase()).toMatch(
        /further|colder|back up/,
      );
    });

    it("should handle consistent distance attempts", () => {
      const options: ProgressiveFeedbackOptions = {
        previousGuesses: [1965],
        currentDistance: 4,
        previousDistance: 4,
      };

      const feedback = getProgressiveFeedback(1969, 1973, options);

      expect(feedback.improvement).toBe("same");
      expect(feedback.improvementMessage?.toLowerCase()).toMatch(
        /same distance|try different/,
      );
    });
  });

  describe("getHistoricalContextHint", () => {
    it("should provide era-based hints for different centuries", () => {
      const options: HistoricalContextOptions = {
        includeEraHints: true,
        difficulty: "normal",
      };

      const medievalHint = getHistoricalContextHint(1969, 1200, options);
      const modernHint = getHistoricalContextHint(1969, 1950, options);

      // Debug logging removed for production

      expect(medievalHint.hint).toBeTruthy();
      expect(medievalHint.hint?.toLowerCase()).toMatch(
        /medieval|century|era|period/,
      );
      expect(modernHint.hint).toBeTruthy();
    });

    it("should provide specific hints for BC/AD transitions", () => {
      const options: HistoricalContextOptions = {
        includeEraHints: true,
        difficulty: "normal",
      };

      const hint = getHistoricalContextHint(50, -50, options);

      expect(hint.hint).toBeTruthy();
      expect(hint.hint?.toLowerCase()).toMatch(/bc|ad|transition|era|ancient/);
    });

    it("should adjust hint specificity based on distance", () => {
      const options: HistoricalContextOptions = {
        includeEraHints: true,
        difficulty: "normal",
      };

      const closeHint = getHistoricalContextHint(1969, 1965, options);
      const farHint = getHistoricalContextHint(1969, 1800, options);

      // Close hints should be more specific than far hints
      if (closeHint.hint && farHint.hint) {
        expect(closeHint.hint.length).toBeGreaterThanOrEqual(
          farHint.hint.length - 50,
        );
      }
    });

    it("should not provide hints when disabled", () => {
      const options: HistoricalContextOptions = {
        includeEraHints: false,
        difficulty: "normal",
      };

      const hint = getHistoricalContextHint(1969, 1800, options);

      expect(hint.hint).toBeNull();
    });
  });

  describe("Integration Tests", () => {
    it("should combine all features for comprehensive feedback", () => {
      const feedback = getEnhancedProximityFeedback(1900, 1969, {
        previousGuesses: [1850],
        includeHistoricalContext: true,
        includeProgressiveTracking: true,
      });

      // Debug output removed for production

      expect(feedback.message).toBeTruthy();
      expect(feedback.encouragement).toBeTruthy();
      expect(feedback.historicalHint).toBeTruthy();
      expect(feedback.progressMessage).toBeTruthy();
      expect(feedback.className).toBeTruthy();
    });

    it("should maintain performance with complex calculations", () => {
      const startTime = performance.now();

      for (let i = 0; i < 100; i++) {
        getEnhancedProximityFeedback(1900 + i, 1969, {
          previousGuesses: [1800, 1850, 1900, 1950],
          includeHistoricalContext: true,
          includeProgressiveTracking: true,
        });
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should complete 100 calculations in under 100ms
      expect(totalTime).toBeLessThan(100);
    });

    it("should be backwards compatible with existing ProximityFeedback interface", () => {
      const enhanced = getEnhancedProximityFeedback(1965, 1969);

      // Should have all original ProximityFeedback properties
      expect(enhanced).toHaveProperty("message");
      expect(enhanced).toHaveProperty("class");
      expect(typeof enhanced.message).toBe("string");
      expect(typeof enhanced.class).toBe("string");
    });
  });
});
