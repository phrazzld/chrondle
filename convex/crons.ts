import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
import { getUTCHourForCentralMidnight } from "./utils/dst";

const crons = cronJobs();

// Daily puzzle generation - runs at midnight Central Time (CT)
// Automatically adjusts for DST: 5 AM UTC during CDT, 6 AM UTC during CST
crons.daily(
  "generate daily puzzle",
  { hourUTC: getUTCHourForCentralMidnight(), minuteUTC: 0 },
  internal.puzzles.generateDailyPuzzle,
);

export default crons;
