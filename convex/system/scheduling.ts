import { query } from "../_generated/server";

/**
 * Get next cron schedule for countdown system
 *
 * Calculates the next midnight UTC for daily puzzle generation timing.
 * Provides fallback with 24-hour countdown if calculation fails.
 */
export const getCronSchedule = query({
  handler: async () => {
    try {
      // Always calculate the next upcoming midnight UTC
      const now = new Date();

      // Create tomorrow at midnight UTC
      const tomorrow = new Date(now);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      tomorrow.setUTCHours(0, 0, 0, 0);

      // If it's currently exactly midnight (rare edge case), use today's midnight
      const nextMidnightUTC =
        now.getUTCHours() === 0 && now.getUTCMinutes() === 0 && now.getUTCSeconds() < 10
          ? new Date(now.setUTCHours(0, 0, 0, 0))
          : tomorrow;

      return {
        nextScheduledTime: nextMidnightUTC.getTime(), // Unix timestamp
        currentServerTime: now.getTime(), // For time synchronization
        cronConfig: {
          hourUTC: 0,
          minuteUTC: 0,
          timezone: "UTC",
          frequency: "daily",
        },
        timeUntilNext: nextMidnightUTC.getTime() - Date.now(),
      };
    } catch (error) {
      console.error("Failed to get cron schedule:", error);

      // Fallback to 24-hour default countdown
      const now = new Date();
      const fallbackTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      return {
        nextScheduledTime: fallbackTime.getTime(),
        currentServerTime: now.getTime(),
        cronConfig: null, // Indicates fallback mode
        timeUntilNext: 24 * 60 * 60 * 1000,
        fallback: true,
      };
    }
  },
});
