import { describe, expect, it } from "vitest";

import { SCORING_CONSTANTS, scoreRange, scoreRangeDetailed } from "../scoring";

describe("scoreRange", () => {
  it("awards the maximum score for a perfect one-year range", () => {
    expect(scoreRange(1969, 1969, 1969)).toBe(697);
  });

  it("applies the correct hint multiplier (H2 → 0.7)", () => {
    expect(scoreRange(1969, 1969, 1969, 0, 2)).toBe(488);
  });

  it("returns zero when the answer falls outside the range", () => {
    expect(scoreRange(1900, 1950, 1969)).toBe(0);
  });

  it("extends containment using tolerance for fuzzy events", () => {
    const withinTolerance = scoreRange(1900, 1910, 1912, 2);
    expect(withinTolerance).toBeGreaterThan(0);
  });

  it("supports BC years naturally", () => {
    const bcScore = scoreRange(-120, -80, -90);
    expect(bcScore).toBeGreaterThan(0);
  });

  it("throws when range width exceeds the maximum", () => {
    expect(() => scoreRange(0, 500, 42)).toThrow(/range width/i);
  });

  it("throws when start is after end", () => {
    expect(() => scoreRange(2000, 1990, 1995)).toThrow(/start year/i);
  });

  it("rejects non-finite input", () => {
    expect(() => scoreRange(Number.NaN, 1900, 1900)).toThrow(/start must be a finite number/);
  });

  it("ensures narrower ranges never score less than wider ones", () => {
    const answer = 1950;
    const scores: number[] = [];

    for (let width = 1; width <= 10; width += 1) {
      const start = answer - Math.floor(width / 2);
      const end = start + width - 1;
      scores.push(scoreRange(start, end, answer));
    }

    for (let i = 1; i < scores.length; i += 1) {
      expect(scores[i - 1]).toBeGreaterThanOrEqual(scores[i]);
    }
  });
});

describe("scoreRangeDetailed", () => {
  it("exposes metadata useful for debugging and UI", () => {
    const result = scoreRangeDetailed(1969, 1969, 1969);

    expect(result).toMatchObject({
      contained: true,
      width: 1,
      score: 697,
    });

    const expectedBase =
      SCORING_CONSTANTS.S * Math.log2((SCORING_CONSTANTS.W_MAX + 1) / (result.width + 1));

    expect(result.baseScore).toBeCloseTo(expectedBase, 6);
  });

  it("returns zeros when the range misses the answer", () => {
    expect(scoreRangeDetailed(1500, 1600, 1700)).toEqual({
      baseScore: 0,
      contained: false,
      score: 0,
      width: 101,
    });
  });
});
