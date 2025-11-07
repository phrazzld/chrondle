import { describe, expect, it } from "vitest";

import { generateHints } from "../hintGeneration";

describe("generateHints", () => {
  it("always returns the three hint levels", () => {
    const hints = generateHints(1969);

    expect(hints).toHaveLength(3);
    expect(hints.map((hint) => hint.level)).toEqual([1, 2, 3]);
  });

  it("classifies era buckets according to the spec", () => {
    const samples: Array<{ year: number; expected: string }> = [
      { year: 2000, expected: "20th century or later" },
      { year: 1800, expected: "Modern era (1700-1900)" },
      { year: 1500, expected: "Early Modern era (1400-1700)" },
      { year: 800, expected: "Medieval period (500-1400)" },
      { year: 200, expected: "Classical antiquity (0-500)" },
      { year: -400, expected: "Ancient history (before 0 AD)" },
    ];

    for (const { year, expected } of samples) {
      expect(generateHints(year)[0].content).toBe(expected);
    }
  });

  it("uses ±25 years for the coarse hint", () => {
    const hints = generateHints(1969);
    const coarse = hints[1];

    expect(coarse.content).toContain("1944");
    expect(coarse.content).toContain("1994");
  });

  it("uses ±10 years for the fine hint", () => {
    const hints = generateHints(1969);
    const fine = hints[2];

    expect(fine.content).toContain("1959");
    expect(fine.content).toContain("1979");
  });

  it("applies the correct hint multipliers for each level", () => {
    const hints = generateHints(1969);

    expect(hints[0].multiplier).toBeCloseTo(0.85);
    expect(hints[1].multiplier).toBeCloseTo(0.7);
    expect(hints[2].multiplier).toBeCloseTo(0.5);
  });

  it("formats BC ranges using the existing formatter", () => {
    const hints = generateHints(-100);

    expect(hints[1].content).toMatch(/BC/);
    expect(hints[2].content).toMatch(/BC/);
  });

  it("throws when provided a non-finite year", () => {
    expect(() => generateHints(Number.NaN)).toThrow(/finite number/);
  });
});
