import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Simple UTC midnight schedule - puzzles generate at 00:00 UTC daily
// With on-demand generation as fallback, this is just an optimization
crons.daily(
  "generate daily puzzle at UTC midnight",
  { hourUTC: 0, minuteUTC: 0 },
  internal.puzzles.generateDailyPuzzle,
  {}, // No args needed - will use today's date
);

// Mark expired Lightning invoices hourly (24h expiration)
crons.hourly(
  "mark expired donations",
  { minuteUTC: 0 },
  internal.donations.markExpiredDonations,
  {}, // No args needed - checks expiresAt field
);

export default crons;
