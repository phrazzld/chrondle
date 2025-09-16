import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Schedule runs for both potential UTC offsets and let the mutation
// self-select based on Central Time midnight detection
crons.daily(
  "generate daily puzzle (05 UTC)",
  { hourUTC: 5, minuteUTC: 0 },
  internal.puzzles.generateDailyPuzzle,
  { force: false },
);

crons.daily(
  "generate daily puzzle (06 UTC)",
  { hourUTC: 6, minuteUTC: 0 },
  internal.puzzles.generateDailyPuzzle,
  { force: false },
);

export default crons;
