/**
 * Daylight Saving Time (DST) utilities for Central Time Zone
 *
 * US DST Rules (since 2007):
 * - Starts: Second Sunday of March at 2:00 AM (spring forward)
 * - Ends: First Sunday of November at 2:00 AM (fall back)
 *
 * Central Time Zone:
 * - CST (Central Standard Time): UTC-6
 * - CDT (Central Daylight Time): UTC-5
 */

/**
 * Find the nth occurrence of a specific day in a month
 * @param year - The year
 * @param month - The month (0-based, 0 = January)
 * @param dayOfWeek - The day of week (0 = Sunday)
 * @param occurrence - Which occurrence (1 = first, 2 = second, etc.)
 * @returns Date object for the specified day
 */
function getNthDayOfMonth(
  year: number,
  month: number,
  dayOfWeek: number,
  occurrence: number,
): Date {
  const firstDay = new Date(year, month, 1);
  const firstDayOfWeek = firstDay.getDay();

  // Calculate days until the first occurrence of the target day
  const daysUntilTarget = (dayOfWeek - firstDayOfWeek + 7) % 7;

  // If the first day is the target day and we want the first occurrence
  if (daysUntilTarget === 0 && occurrence === 1) {
    return new Date(year, month, 1);
  }

  // Add days to get to the nth occurrence
  const targetDate = 1 + daysUntilTarget + (occurrence - 1) * 7;

  return new Date(year, month, targetDate);
}

/**
 * Determine if a given date is in Daylight Saving Time for US Central Time
 * @param date - The date to check (defaults to current date)
 * @returns true if the date is in CDT, false if in CST
 */
export function isDaylightSavingTime(date: Date = new Date()): boolean {
  const year = date.getFullYear();

  // DST starts on the second Sunday of March at 2:00 AM
  const dstStart = getNthDayOfMonth(year, 2, 0, 2); // March = month 2, Sunday = 0, 2nd occurrence
  dstStart.setHours(2, 0, 0, 0); // Set to 2:00 AM

  // DST ends on the first Sunday of November at 2:00 AM
  const dstEnd = getNthDayOfMonth(year, 10, 0, 1); // November = month 10, Sunday = 0, 1st occurrence
  dstEnd.setHours(2, 0, 0, 0); // Set to 2:00 AM

  // Check if date falls within DST period
  return date >= dstStart && date < dstEnd;
}

/**
 * Get the UTC hour that corresponds to midnight Central Time
 * @param date - The date to check (defaults to tomorrow for cron scheduling)
 * @returns The UTC hour (0-23) that equals midnight CT
 */
export function getUTCHourForCentralMidnight(date?: Date): number {
  // Default to tomorrow since we're scheduling for the next day
  const targetDate = date || new Date(Date.now() + 24 * 60 * 60 * 1000);

  // During CDT (UTC-5): midnight CT = 5:00 AM UTC
  // During CST (UTC-6): midnight CT = 6:00 AM UTC
  return isDaylightSavingTime(targetDate) ? 5 : 6;
}

/**
 * Get the current Central Time offset from UTC
 * @param date - The date to check (defaults to current date)
 * @returns The offset in hours (5 for CDT, 6 for CST)
 */
export function getCentralTimeOffset(date: Date = new Date()): number {
  return isDaylightSavingTime(date) ? 5 : 6;
}

/**
 * Convert a Central Time date to UTC
 * @param centralDate - A date in Central Time
 * @returns The equivalent UTC date
 */
export function centralTimeToUTC(centralDate: Date): Date {
  const offset = getCentralTimeOffset(centralDate);
  const utcTime = new Date(centralDate);
  utcTime.setHours(utcTime.getHours() + offset);
  return utcTime;
}

/**
 * Convert a UTC date to Central Time
 * @param utcDate - A date in UTC
 * @returns The equivalent Central Time date
 */
export function utcToCentralTime(utcDate: Date): Date {
  const offset = getCentralTimeOffset(utcDate);
  const centralTime = new Date(utcDate);
  centralTime.setHours(centralTime.getHours() - offset);
  return centralTime;
}

/**
 * Format a date for display in Central Time
 * @param date - The date to format (assumed to be in UTC)
 * @returns A string representation in Central Time
 */
export function formatCentralTime(date: Date): string {
  const centralDate = utcToCentralTime(date);
  const isDST = isDaylightSavingTime(centralDate);
  const timezone = isDST ? "CDT" : "CST";

  return `${centralDate.toLocaleString("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  })} ${timezone}`;
}

/**
 * Get information about the next DST transition
 * @param fromDate - The date to check from (defaults to current date)
 * @returns Object with transition details
 */
export function getNextDSTTransition(fromDate: Date = new Date()): {
  date: Date;
  type: "spring-forward" | "fall-back";
  fromOffset: number;
  toOffset: number;
} {
  const year = fromDate.getFullYear();

  // Calculate this year's transitions
  const springForward = getNthDayOfMonth(year, 2, 0, 2);
  springForward.setHours(2, 0, 0, 0);

  const fallBack = getNthDayOfMonth(year, 10, 0, 1);
  fallBack.setHours(2, 0, 0, 0);

  // Determine which transition is next
  if (fromDate < springForward) {
    return {
      date: springForward,
      type: "spring-forward",
      fromOffset: 6,
      toOffset: 5,
    };
  } else if (fromDate < fallBack) {
    return {
      date: fallBack,
      type: "fall-back",
      fromOffset: 5,
      toOffset: 6,
    };
  } else {
    // Next transition is next year's spring forward
    const nextYearSpring = getNthDayOfMonth(year + 1, 2, 0, 2);
    nextYearSpring.setHours(2, 0, 0, 0);
    return {
      date: nextYearSpring,
      type: "spring-forward",
      fromOffset: 6,
      toOffset: 5,
    };
  }
}

/**
 * Determine whether the provided moment corresponds to midnight in Central Time
 * Allows for slight scheduler drift (<= 5 seconds)
 */
const MIDNIGHT_SECOND_DRIFT = 5;

function getCentralTimeParts(date: Date): {
  hour: number;
  minute: number;
  second: number;
} {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  }).formatToParts(date);

  const lookup = (type: "hour" | "minute" | "second"): number => {
    const value = parts.find((part) => part.type === type)?.value ?? "0";
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  return {
    hour: lookup("hour"),
    minute: lookup("minute"),
    second: lookup("second"),
  };
}

export function shouldRunDailyPuzzleJob(date: Date = new Date()): boolean {
  const { hour, minute, second } = getCentralTimeParts(date);
  return (
    hour === 0 && minute === 0 && second >= 0 && second <= MIDNIGHT_SECOND_DRIFT
  );
}
