import { describe, it, expect } from "vitest";
import { formatYear } from "../displayFormatting";

describe("formatYear utility", () => {
  it("formats BC years correctly", () => {
    expect(formatYear(-776)).toBe("776 BC");
    expect(formatYear(-1)).toBe("1 BC");
    expect(formatYear(-100)).toBe("100 BC");
    expect(formatYear(-2500)).toBe("2500 BC");
  });

  it("formats AD years correctly", () => {
    expect(formatYear(1)).toBe("1 AD");
    expect(formatYear(476)).toBe("476 AD");
    expect(formatYear(2024)).toBe("2024 AD");
    expect(formatYear(1969)).toBe("1969 AD");
  });

  it("handles year 0 as 0 AD (edge case)", () => {
    // Year 0 doesn't exist in BC/AD calendar, but the function treats it as AD
    expect(formatYear(0)).toBe("0 AD");
  });

  it("formats large years correctly", () => {
    expect(formatYear(-10000)).toBe("10000 BC");
    expect(formatYear(3000)).toBe("3000 AD");
  });

  it("maintains absolute value for BC years", () => {
    expect(formatYear(-44)).toBe("44 BC");
    expect(formatYear(-753)).toBe("753 BC");
  });
});
