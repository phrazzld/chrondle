import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Daily puzzle generation - runs at midnight UTC
crons.daily(
  "generate daily puzzle",
  { hourUTC: 0, minuteUTC: 0 },
  internal.puzzles.generateDailyPuzzle,
);

export default crons;
