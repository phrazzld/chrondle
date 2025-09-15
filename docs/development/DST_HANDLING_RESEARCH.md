# DST Handling for Central Time - Research & Implementation Approach

## Executive Summary

This document outlines approaches for handling Daylight Saving Time (DST) transitions for daily puzzle generation in Central Time zone. Currently, the cron job runs at midnight UTC, which doesn't align with Central Time midnight year-round due to DST changes.

## Current State

- **Current Implementation**: `crons.daily()` runs at `{ hourUTC: 0, minuteUTC: 0 }` (midnight UTC)
- **Problem**: This corresponds to:
  - 6:00 PM CST (Central Standard Time, UTC-6)
  - 7:00 PM CDT (Central Daylight Time, UTC-5)
  - Neither aligns with midnight Central Time

## DST Transition Rules for Central Time

### Schedule

- **Spring Forward**: Second Sunday in March at 2:00 AM CST → 3:00 AM CDT
- **Fall Back**: First Sunday in November at 2:00 AM CDT → 1:00 AM CST

### Specific Dates

- **2024**: March 10 (spring), November 3 (fall)
- **2025**: March 9 (spring), November 2 (fall)
- **2026**: March 8 (spring), November 1 (fall)

### Time Zone Offsets

- **CST** (Central Standard Time): UTC-6
- **CDT** (Central Daylight Time): UTC-5

## Implementation Approaches

### Approach 1: Manual UTC Hour Adjustment (Simplest)

**Implementation:**

```typescript
// convex/crons.ts
const currentDate = new Date();
const isDST = isDaylightSavingTime(currentDate);
const utcHour = isDST ? 5 : 6; // CDT: UTC+5 = midnight CT, CST: UTC+6 = midnight CT

crons.daily(
  "generate daily puzzle",
  { hourUTC: utcHour, minuteUTC: 0 },
  internal.puzzles.generateDailyPuzzle,
);
```

**Pros:**

- Simple to implement
- No external dependencies
- Works with Convex's UTC-based cron system

**Cons:**

- Requires manual updates twice per year
- Puzzle generation time shifts by 1 hour during DST transitions

### Approach 2: Dynamic DST Detection (Recommended)

**Implementation:**

```typescript
// convex/utils/dst.ts
export function isDaylightSavingTime(date: Date = new Date()): boolean {
  const year = date.getFullYear();

  // Find second Sunday of March
  const marchFirst = new Date(year, 2, 1); // March 1st
  const daysUntilSunday = (7 - marchFirst.getDay()) % 7;
  const firstSunday = new Date(year, 2, 1 + daysUntilSunday);
  const secondSunday = new Date(year, 2, firstSunday.getDate() + 7);
  const dstStart = new Date(year, 2, secondSunday.getDate(), 2); // 2 AM

  // Find first Sunday of November
  const novemberFirst = new Date(year, 10, 1); // November 1st
  const novDaysUntilSunday = (7 - novemberFirst.getDay()) % 7;
  const novFirstSunday = new Date(year, 10, 1 + novDaysUntilSunday);
  const dstEnd = new Date(year, 10, novFirstSunday.getDate(), 2); // 2 AM

  return date >= dstStart && date < dstEnd;
}

// convex/crons.ts
import { isDaylightSavingTime } from "./utils/dst";

// Calculate UTC hour for midnight Central Time
const getUTCHourForCentralMidnight = (): number => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return isDaylightSavingTime(tomorrow) ? 5 : 6;
};

crons.daily(
  "generate daily puzzle",
  { hourUTC: getUTCHourForCentralMidnight(), minuteUTC: 0 },
  internal.puzzles.generateDailyPuzzle,
);
```

**Pros:**

- Automatically adjusts for DST transitions
- No manual intervention required
- Accurate for US Central Time zone

**Cons:**

- More complex implementation
- Requires custom DST detection logic
- May need updates if DST rules change

### Approach 3: Two Cron Jobs (Alternative)

**Implementation:**

```typescript
// Run at both possible times, let the function determine which to execute
crons.daily(
  "generate daily puzzle CST",
  { hourUTC: 6, minuteUTC: 0 }, // Midnight CST
  internal.puzzles.generateDailyPuzzleIfNeeded,
);

crons.daily(
  "generate daily puzzle CDT",
  { hourUTC: 5, minuteUTC: 0 }, // Midnight CDT
  internal.puzzles.generateDailyPuzzleIfNeeded,
);

// In the function, check if puzzle already exists for today
```

**Pros:**

- No DST calculation needed
- Handles transitions smoothly

**Cons:**

- Runs twice daily (once unnecessarily)
- Requires idempotency checks
- Uses more compute resources

### Approach 4: Library-Based Solution (Most Robust)

**Implementation using date-fns-tz:**

```typescript
// First: pnpm add date-fns-tz

import { zonedTimeToUtc } from "date-fns-tz";

// Get the next midnight in Central Time as UTC
const getNextCentralMidnightUTC = (): Date => {
  const now = new Date();
  const centralTimeZone = "America/Chicago";

  // Set to midnight tomorrow in Central Time
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  // Convert to UTC
  return zonedTimeToUtc(tomorrow, centralTimeZone);
};

const nextMidnight = getNextCentralMidnightUTC();
const utcHour = nextMidnight.getUTCHours();

crons.daily(
  "generate daily puzzle",
  { hourUTC: utcHour, minuteUTC: 0 },
  internal.puzzles.generateDailyPuzzle,
);
```

**Pros:**

- Most accurate and reliable
- Handles all edge cases
- Future-proof against DST rule changes
- Supports multiple timezones easily

**Cons:**

- Requires external dependency
- Increases bundle size
- May be overkill for single timezone

## Recommendation

**For Chrondle, I recommend Approach 2 (Dynamic DST Detection)** because:

1. **No Dependencies**: Keeps the bundle lean
2. **Automatic Adjustment**: No manual intervention needed
3. **Sufficient Accuracy**: Works perfectly for US Central Time
4. **Maintainable**: Clear, self-contained logic
5. **Convex Compatible**: Works within Convex's UTC-based cron system

## Implementation Checklist

- [ ] Create `convex/utils/dst.ts` with DST detection function
- [ ] Add comprehensive tests for DST detection
- [ ] Update `convex/crons.ts` to use dynamic UTC hour
- [ ] Add logging to track cron execution times
- [ ] Test during DST transition dates (use date mocking)
- [ ] Document the implementation in code comments
- [ ] Set up monitoring for puzzle generation times
- [ ] Create alerts for failed puzzle generation

## Testing Strategy

### Unit Tests

```typescript
describe("isDaylightSavingTime", () => {
  test("correctly identifies CST period", () => {
    expect(isDaylightSavingTime(new Date("2024-01-15"))).toBe(false);
    expect(isDaylightSavingTime(new Date("2024-12-15"))).toBe(false);
  });

  test("correctly identifies CDT period", () => {
    expect(isDaylightSavingTime(new Date("2024-06-15"))).toBe(true);
    expect(isDaylightSavingTime(new Date("2024-07-15"))).toBe(true);
  });

  test("handles DST transition dates", () => {
    // Spring forward: March 10, 2024, 2:00 AM
    expect(isDaylightSavingTime(new Date("2024-03-10T01:59:00"))).toBe(false);
    expect(isDaylightSavingTime(new Date("2024-03-10T03:00:00"))).toBe(true);

    // Fall back: November 3, 2024, 2:00 AM
    expect(isDaylightSavingTime(new Date("2024-11-03T01:59:00"))).toBe(true);
    expect(isDaylightSavingTime(new Date("2024-11-03T02:00:00"))).toBe(false);
  });
});
```

### Integration Tests

- Deploy to staging environment
- Monitor puzzle generation for several days
- Verify timing around DST transitions
- Check that puzzles generate at midnight Central Time

## Monitoring & Alerts

### Key Metrics

- Puzzle generation timestamp
- Time between puzzle generations (should be ~24 hours)
- Failed generation attempts
- User reports of missing/late puzzles

### Alert Conditions

- No puzzle generated by 1:00 AM Central Time
- Multiple generation attempts for same day
- Cron job execution failures

## Long-term Considerations

1. **DST Rule Changes**: US Congress occasionally discusses permanent DST
2. **International Expansion**: May need to support multiple timezones
3. **User Preferences**: Could allow users to set puzzle release time
4. **Gradual Rollout**: Consider testing with small user group first

## References

- [Convex Cron Jobs Documentation](https://docs.convex.dev/scheduling/cron-jobs)
- [MDN: Date.getTimezoneOffset()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset)
- [US DST Rules (timeanddate.com)](https://www.timeanddate.com/time/dst/usa.html)
- [date-fns-tz Library](https://github.com/marnusw/date-fns-tz) (if choosing library approach)

## Conclusion

Implementing DST-aware cron scheduling will ensure Chrondle puzzles release consistently at midnight Central Time year-round, improving user experience and maintaining the daily ritual aspect of the game.
