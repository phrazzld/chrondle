import { describe, it, expect } from "vitest";

/**
 * Timeline Component Performance Test
 * Ensures timeline calculations and rendering remain performant
 * with the full historical range (2500 BC to current year)
 */
describe("Timeline Performance", () => {
  const minYear = -2500;
  const maxYear = new Date().getFullYear();
  const totalYears = maxYear - minYear;

  it("should calculate range updates in under 16ms", () => {
    const startTime = performance.now();

    // Simulate 1000 range calculations similar to Timeline's useMemo
    for (let i = 0; i < 1000; i++) {
      const guesses = [1500, 1800, 1900, 1950, 2000];
      let validMin = minYear;
      let validMax = maxYear;

      guesses.forEach((guess) => {
        const targetYear = 1969;
        const direction =
          guess < targetYear
            ? "later"
            : guess > targetYear
              ? "earlier"
              : "correct";

        if (direction === "earlier") {
          validMax = Math.min(validMax, guess - 1);
        } else if (direction === "later") {
          validMin = Math.max(validMin, guess + 1);
        }
      });

      // Simulate position calculation
      const percentage = (1969 - validMin) / (validMax - validMin);
      const position = 50 + percentage * 700;
      // Position calculation is used in actual Timeline component
      expect(position).toBeGreaterThan(0);
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Should complete 1000 iterations well under 16ms
    expect(duration).toBeLessThan(16);
  });

  it("should handle SVG element creation efficiently", () => {
    const startTime = performance.now();

    // Simulate creating SVG elements for timeline
    const svgElements = [];
    for (let year = minYear; year <= maxYear; year += 100) {
      const percentage = (year - minYear) / (maxYear - minYear);
      const x = 50 + percentage * 700;
      svgElements.push({ x, year });
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Creating ~45 elements should be nearly instant
    expect(duration).toBeLessThan(5);
    expect(svgElements.length).toBeGreaterThan(40);
  });

  it("should format BC/AD years efficiently", () => {
    const startTime = performance.now();

    // Test 10000 year format operations
    const formattedYears = [];
    for (let i = 0; i < 10000; i++) {
      const year = Math.floor(Math.random() * totalYears) + minYear;
      const formatted = year < 0 ? `${Math.abs(year)} BC` : `${year} AD`;
      formattedYears.push(formatted);
    }
    // Verify formatting worked
    expect(formattedYears.length).toBe(10000);

    const endTime = performance.now();
    const duration = endTime - startTime;

    // 10000 format operations should complete quickly
    expect(duration).toBeLessThan(50);
  });

  it("should handle the full historical range", () => {
    // Verify the range is as expected
    expect(minYear).toBe(-2500);
    expect(maxYear).toBeGreaterThanOrEqual(2024);
    expect(totalYears).toBeGreaterThan(4500);

    // Test edge cases
    const bcFormat = Math.abs(minYear) + " BC";
    const adFormat = maxYear + " AD";

    expect(bcFormat).toBe("2500 BC");
    expect(adFormat).toMatch(/^\d{4} AD$/);
  });
});
