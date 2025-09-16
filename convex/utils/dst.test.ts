/**
 * Tests for DST detection utilities
 *
 * Test cases cover:
 * - Standard Time periods (CST)
 * - Daylight Saving Time periods (CDT)
 * - Transition dates and edge cases
 * - Historical and future dates
 */

import { describe, expect, test } from "vitest";
import {
  isDaylightSavingTime,
  getUTCHourForCentralMidnight,
  getCentralTimeOffset,
  getNextDSTTransition,
  centralTimeToUTC,
  utcToCentralTime,
  shouldRunDailyPuzzleJob,
} from "./dst";

describe("isDaylightSavingTime", () => {
  describe("2024 - Standard Time (CST)", () => {
    test("January is in CST", () => {
      expect(isDaylightSavingTime(new Date("2024-01-15T12:00:00"))).toBe(false);
    });

    test("February is in CST", () => {
      expect(isDaylightSavingTime(new Date("2024-02-15T12:00:00"))).toBe(false);
    });

    test("Early March (before transition) is in CST", () => {
      expect(isDaylightSavingTime(new Date("2024-03-09T12:00:00"))).toBe(false);
    });

    test("November (after transition) is in CST", () => {
      expect(isDaylightSavingTime(new Date("2024-11-15T12:00:00"))).toBe(false);
    });

    test("December is in CST", () => {
      expect(isDaylightSavingTime(new Date("2024-12-15T12:00:00"))).toBe(false);
    });
  });

  describe("2024 - Daylight Saving Time (CDT)", () => {
    test("Late March is in CDT", () => {
      expect(isDaylightSavingTime(new Date("2024-03-15T12:00:00"))).toBe(true);
    });

    test("April is in CDT", () => {
      expect(isDaylightSavingTime(new Date("2024-04-15T12:00:00"))).toBe(true);
    });

    test("June is in CDT", () => {
      expect(isDaylightSavingTime(new Date("2024-06-15T12:00:00"))).toBe(true);
    });

    test("July is in CDT", () => {
      expect(isDaylightSavingTime(new Date("2024-07-15T12:00:00"))).toBe(true);
    });

    test("September is in CDT", () => {
      expect(isDaylightSavingTime(new Date("2024-09-15T12:00:00"))).toBe(true);
    });

    test("October is in CDT", () => {
      expect(isDaylightSavingTime(new Date("2024-10-15T12:00:00"))).toBe(true);
    });
  });

  describe("2024 DST Transitions", () => {
    // Spring Forward: March 10, 2024, at 2:00 AM
    test("March 10, 2024 at 1:59 AM is still CST", () => {
      expect(isDaylightSavingTime(new Date("2024-03-10T01:59:59"))).toBe(false);
    });

    test("March 10, 2024 at 2:00 AM transitions to CDT", () => {
      expect(isDaylightSavingTime(new Date("2024-03-10T02:00:00"))).toBe(true);
    });

    test("March 10, 2024 at 3:00 AM is in CDT", () => {
      expect(isDaylightSavingTime(new Date("2024-03-10T03:00:00"))).toBe(true);
    });

    // Fall Back: November 3, 2024, at 2:00 AM
    test("November 3, 2024 at 1:59 AM is still CDT", () => {
      expect(isDaylightSavingTime(new Date("2024-11-03T01:59:59"))).toBe(true);
    });

    test("November 3, 2024 at 2:00 AM transitions to CST", () => {
      expect(isDaylightSavingTime(new Date("2024-11-03T02:00:00"))).toBe(false);
    });

    test("November 3, 2024 at 3:00 AM is in CST", () => {
      expect(isDaylightSavingTime(new Date("2024-11-03T03:00:00"))).toBe(false);
    });
  });

  describe("2025 DST Transitions", () => {
    // Spring Forward: March 9, 2025
    test("March 9, 2025 at 1:59 AM is CST", () => {
      expect(isDaylightSavingTime(new Date("2025-03-09T01:59:59"))).toBe(false);
    });

    test("March 9, 2025 at 2:00 AM is CDT", () => {
      expect(isDaylightSavingTime(new Date("2025-03-09T02:00:00"))).toBe(true);
    });

    // Fall Back: November 2, 2025
    test("November 2, 2025 at 1:59 AM is CDT", () => {
      expect(isDaylightSavingTime(new Date("2025-11-02T01:59:59"))).toBe(true);
    });

    test("November 2, 2025 at 2:00 AM is CST", () => {
      expect(isDaylightSavingTime(new Date("2025-11-02T02:00:00"))).toBe(false);
    });
  });

  describe("2026 DST Transitions", () => {
    // Spring Forward: March 8, 2026
    test("March 8, 2026 at 1:59 AM is CST", () => {
      expect(isDaylightSavingTime(new Date("2026-03-08T01:59:59"))).toBe(false);
    });

    test("March 8, 2026 at 2:00 AM is CDT", () => {
      expect(isDaylightSavingTime(new Date("2026-03-08T02:00:00"))).toBe(true);
    });

    // Fall Back: November 1, 2026
    test("November 1, 2026 at 1:59 AM is CDT", () => {
      expect(isDaylightSavingTime(new Date("2026-11-01T01:59:59"))).toBe(true);
    });

    test("November 1, 2026 at 2:00 AM is CST", () => {
      expect(isDaylightSavingTime(new Date("2026-11-01T02:00:00"))).toBe(false);
    });
  });
});

describe("shouldRunDailyPuzzleJob", () => {
  test("returns true for CST midnight (06:00 UTC)", () => {
    expect(shouldRunDailyPuzzleJob(new Date("2024-02-20T06:00:00Z"))).toBe(
      true,
    );
  });

  test("returns true for CDT midnight (05:00 UTC)", () => {
    expect(shouldRunDailyPuzzleJob(new Date("2024-07-15T05:00:01Z"))).toBe(
      true,
    );
  });

  test("returns false for non-midnight hours", () => {
    expect(shouldRunDailyPuzzleJob(new Date("2024-02-20T05:00:00Z"))).toBe(
      false,
    );
    expect(shouldRunDailyPuzzleJob(new Date("2024-07-15T06:00:00Z"))).toBe(
      false,
    );
  });

  test("tolerates small scheduler drift", () => {
    expect(shouldRunDailyPuzzleJob(new Date("2024-02-20T06:00:05Z"))).toBe(
      true,
    );
    expect(shouldRunDailyPuzzleJob(new Date("2024-02-20T06:00:06Z"))).toBe(
      false,
    );
  });
});

describe("getUTCHourForCentralMidnight", () => {
  test("returns 6 during CST (winter)", () => {
    const januaryDate = new Date("2024-01-15T12:00:00");
    expect(getUTCHourForCentralMidnight(januaryDate)).toBe(6);
  });

  test("returns 5 during CDT (summer)", () => {
    const julyDate = new Date("2024-07-15T12:00:00");
    expect(getUTCHourForCentralMidnight(julyDate)).toBe(5);
  });

  test("handles spring transition correctly", () => {
    // Day before spring forward
    expect(getUTCHourForCentralMidnight(new Date("2024-03-09T12:00:00"))).toBe(
      6,
    );
    // Day of spring forward (after 2 AM)
    expect(getUTCHourForCentralMidnight(new Date("2024-03-10T12:00:00"))).toBe(
      5,
    );
  });

  test("handles fall transition correctly", () => {
    // Day before fall back
    expect(getUTCHourForCentralMidnight(new Date("2024-11-02T12:00:00"))).toBe(
      5,
    );
    // Day of fall back (after 2 AM)
    expect(getUTCHourForCentralMidnight(new Date("2024-11-03T12:00:00"))).toBe(
      6,
    );
  });
});

describe("getCentralTimeOffset", () => {
  test("returns 6 during CST", () => {
    expect(getCentralTimeOffset(new Date("2024-01-15"))).toBe(6);
    expect(getCentralTimeOffset(new Date("2024-12-15"))).toBe(6);
  });

  test("returns 5 during CDT", () => {
    expect(getCentralTimeOffset(new Date("2024-06-15"))).toBe(5);
    expect(getCentralTimeOffset(new Date("2024-08-15"))).toBe(5);
  });
});

describe("getNextDSTTransition", () => {
  test("identifies spring forward when in winter", () => {
    const result = getNextDSTTransition(new Date("2024-01-15"));
    expect(result.type).toBe("spring-forward");
    expect(result.date.getMonth()).toBe(2); // March
    expect(result.date.getDate()).toBe(10); // March 10, 2024
    expect(result.fromOffset).toBe(6);
    expect(result.toOffset).toBe(5);
  });

  test("identifies fall back when in summer", () => {
    const result = getNextDSTTransition(new Date("2024-07-15"));
    expect(result.type).toBe("fall-back");
    expect(result.date.getMonth()).toBe(10); // November
    expect(result.date.getDate()).toBe(3); // November 3, 2024
    expect(result.fromOffset).toBe(5);
    expect(result.toOffset).toBe(6);
  });

  test("identifies next year spring forward when after fall back", () => {
    const result = getNextDSTTransition(new Date("2024-12-15"));
    expect(result.type).toBe("spring-forward");
    expect(result.date.getFullYear()).toBe(2025);
    expect(result.date.getMonth()).toBe(2); // March
    expect(result.date.getDate()).toBe(9); // March 9, 2025
  });
});

describe("Time Conversion Functions", () => {
  describe("centralTimeToUTC", () => {
    test("converts CST to UTC correctly", () => {
      // Midnight CST = 6 AM UTC
      const centralMidnight = new Date("2024-01-15T00:00:00");
      const utc = centralTimeToUTC(centralMidnight);
      expect(utc.getHours()).toBe(6);
    });

    test("converts CDT to UTC correctly", () => {
      // Midnight CDT = 5 AM UTC
      const centralMidnight = new Date("2024-07-15T00:00:00");
      const utc = centralTimeToUTC(centralMidnight);
      expect(utc.getHours()).toBe(5);
    });
  });

  describe("utcToCentralTime", () => {
    test("converts UTC to CST correctly", () => {
      // Create a UTC date explicitly
      const utc6am = new Date(Date.UTC(2024, 0, 15, 6, 0, 0)); // 6 AM UTC on Jan 15
      const central = utcToCentralTime(utc6am);
      // 6 AM UTC - 6 hours = Midnight CST
      expect(central.getUTCHours()).toBe(0);
    });

    test("converts UTC to CDT correctly", () => {
      // Create a UTC date explicitly
      const utc5am = new Date(Date.UTC(2024, 6, 15, 5, 0, 0)); // 5 AM UTC on July 15
      const central = utcToCentralTime(utc5am);
      // 5 AM UTC - 5 hours = Midnight CDT
      expect(central.getUTCHours()).toBe(0);
    });
  });
});

describe("Edge Cases", () => {
  test("handles leap year correctly", () => {
    // 2024 is a leap year
    expect(isDaylightSavingTime(new Date("2024-02-29T12:00:00"))).toBe(false);
  });

  test("handles year boundaries", () => {
    expect(isDaylightSavingTime(new Date("2024-12-31T23:59:59"))).toBe(false);
    expect(isDaylightSavingTime(new Date("2025-01-01T00:00:00"))).toBe(false);
  });

  test("handles very old dates", () => {
    // DST rules changed in 2007, but function should still work
    expect(isDaylightSavingTime(new Date("2000-07-15T12:00:00"))).toBe(true);
  });

  test("handles future dates", () => {
    expect(isDaylightSavingTime(new Date("2030-07-15T12:00:00"))).toBe(true);
    expect(isDaylightSavingTime(new Date("2030-01-15T12:00:00"))).toBe(false);
  });
});
