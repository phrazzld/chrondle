import { v } from "convex/values";
import { mutation, internalMutation, QueryCtx } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";
import { internal } from "../_generated/api";

/**
 * Puzzle Generation Module
 *
 * Module: Single responsibility - puzzle creation
 * Deep Module Value: Hides complex generation/scheduling logic behind simple APIs
 *
 * Exports:
 * - generateDailyPuzzle: Internal mutation for cron job
 * - ensureTodaysPuzzle: Public mutation to ensure today's puzzle exists
 * - manualGeneratePuzzle: Development-only manual trigger
 * - selectYearForPuzzle: Helper for year selection algorithm
 */

/**
 * Selects a random year with 6+ unused events for puzzle generation.
 *
 * Algorithm:
 * 1. Query all unused events (puzzleId = undefined)
 * 2. Group by year and count available events
 * 3. Filter to years with 6+ events (minimum for puzzle)
 * 4. Randomly select one eligible year
 * 5. Return selected year with its events
 *
 * Module Value: Hides complex year selection algorithm behind simple interface.
 * Deep Module: 40 lines of implementation complexity → 1 function call
 *
 * @param ctx - Database query context
 * @returns Selected year, its events, and availability count
 * @throws Error if no years have 6+ unused events
 */
export async function selectYearForPuzzle(ctx: QueryCtx): Promise<{
  year: number;
  events: Doc<"events">[];
  availableEvents: number;
}> {
  // Get all unused events from pool
  const unusedEvents = await ctx.db
    .query("events")
    .filter((q) => q.eq(q.field("puzzleId"), undefined))
    .collect();

  // Group by year and count available events per year
  const yearCounts = new Map<number, number>();
  for (const event of unusedEvents) {
    const count = yearCounts.get(event.year) || 0;
    yearCounts.set(event.year, count + 1);
  }

  // Filter to years with sufficient events (6 minimum for puzzle)
  const availableYears = Array.from(yearCounts.entries())
    .filter(([, count]) => count >= 6)
    .map(([year, count]) => ({ year, availableEvents: count }))
    .sort((a, b) => a.year - b.year);

  if (availableYears.length === 0) {
    throw new Error("No years available with enough unused events");
  }

  // Randomly select one eligible year
  const randomYear = availableYears[Math.floor(Math.random() * availableYears.length)];

  // Get all unused events for the selected year
  const yearEvents = await ctx.db
    .query("events")
    .withIndex("by_year", (q) => q.eq("year", randomYear.year))
    .filter((q) => q.eq(q.field("puzzleId"), undefined))
    .collect();

  // Randomly select 6 events from the year's available events
  const shuffled = [...yearEvents].sort(() => Math.random() - 0.5);
  const selectedEvents = shuffled.slice(0, 6);

  if (selectedEvents.length < 6) {
    throw new Error(`Not enough events for year ${randomYear.year}`);
  }

  return {
    year: randomYear.year,
    events: selectedEvents,
    availableEvents: randomYear.availableEvents,
  };
}

/**
 * Internal mutation for cron job to generate daily puzzle
 *
 * Triggered by scheduled cron job to create puzzles at midnight UTC.
 * Can also be called with specific date for on-demand generation.
 *
 * @param force - Optional flag to force generation (unused currently)
 * @param date - Optional specific date (YYYY-MM-DD) for generation
 * @returns Status and puzzle metadata
 */
export const generateDailyPuzzle = internalMutation({
  args: {
    force: v.optional(v.boolean()),
    date: v.optional(v.string()), // Allow specific date for on-demand generation
  },
  handler: async (ctx, args) => {
    // Get the target date - either specified or today in UTC
    const targetDate = args.date || new Date().toISOString().slice(0, 10);

    // Check if puzzle already exists for this date
    const existingPuzzle = await ctx.db
      .query("puzzles")
      .withIndex("by_date", (q) => q.eq("date", targetDate))
      .first();

    if (existingPuzzle) {
      console.warn(`Puzzle for ${targetDate} already exists`);
      return { status: "already_exists", puzzle: existingPuzzle };
    }

    // Get the highest puzzle number
    const latestPuzzle = await ctx.db.query("puzzles").order("desc").first();

    const nextPuzzleNumber = (latestPuzzle?.puzzleNumber || 0) + 1;

    // Select a year with 6+ unused events and get random events from it
    const { year: selectedYear, events: selectedEvents } = await selectYearForPuzzle(ctx);

    // Create the puzzle
    const puzzleId = await ctx.db.insert("puzzles", {
      puzzleNumber: nextPuzzleNumber,
      date: targetDate,
      targetYear: selectedYear,
      events: selectedEvents.map((e) => e.event),
      playCount: 0,
      avgGuesses: 0,
      updatedAt: Date.now(),
    });

    // Update the selected events with the puzzleId
    for (const event of selectedEvents) {
      await ctx.db.patch(event._id, {
        puzzleId,
        updatedAt: Date.now(),
      });
    }

    // Schedule historical context generation (non-blocking)
    try {
      await ctx.scheduler.runAfter(
        0, // Run immediately
        internal.actions.historicalContext.generateHistoricalContext,
        {
          puzzleId,
          year: selectedYear,
          events: selectedEvents.map((e) => e.event),
        },
      );

      console.warn(
        `Scheduled historical context generation for puzzle ${puzzleId} (year ${selectedYear})`,
      );
    } catch (schedulerError) {
      // Log but don't fail puzzle creation - graceful degradation
      console.error(
        `[generateDailyPuzzle] Failed to schedule context generation for puzzle ${puzzleId}:`,
        schedulerError,
      );
    }

    console.warn(`Created puzzle #${nextPuzzleNumber} for ${targetDate} with year ${selectedYear}`);

    return {
      status: "created",
      puzzle: {
        _id: puzzleId,
        puzzleNumber: nextPuzzleNumber,
        date: targetDate,
        targetYear: selectedYear,
      },
    };
  },
});

/**
 * Public mutation to ensure today's puzzle exists
 *
 * Called by frontend on load to guarantee today's puzzle is available.
 * Idempotent - returns existing puzzle if already created.
 *
 * @returns Status and puzzle data
 */
export const ensureTodaysPuzzle = mutation({
  handler: async (ctx) => {
    const today = new Date().toISOString().slice(0, 10);

    // Check if puzzle already exists
    const existingPuzzle = await ctx.db
      .query("puzzles")
      .withIndex("by_date", (q) => q.eq("date", today))
      .first();

    if (existingPuzzle) {
      return { status: "exists", puzzle: existingPuzzle };
    }

    // Trigger generation using shared logic
    console.warn(`[ensureTodaysPuzzle] Generating puzzle for ${today}`);

    // Get the highest puzzle number
    const latestPuzzle = await ctx.db.query("puzzles").order("desc").first();
    const nextPuzzleNumber = (latestPuzzle?.puzzleNumber || 0) + 1;

    // Select a year with 6+ unused events and get random events from it
    const { year: selectedYear, events: selectedEvents } = await selectYearForPuzzle(ctx);

    const puzzleId = await ctx.db.insert("puzzles", {
      puzzleNumber: nextPuzzleNumber,
      date: today,
      targetYear: selectedYear,
      events: selectedEvents.map((e) => e.event),
      playCount: 0,
      avgGuesses: 0,
      updatedAt: Date.now(),
    });

    // Update events with puzzleId
    for (const event of selectedEvents) {
      await ctx.db.patch(event._id, {
        puzzleId,
        updatedAt: Date.now(),
      });
    }

    const newPuzzle = await ctx.db.get(puzzleId);

    console.warn(`Created puzzle #${nextPuzzleNumber} for ${today} with year ${selectedYear}`);

    return { status: "created", puzzle: newPuzzle };
  },
});

/**
 * Manual trigger for generating a puzzle (development only)
 *
 * TODO: Implement proper manual generation with date selection
 * Currently disabled to avoid circular dependency issues.
 *
 * @returns Error status in development, throws in production
 */
export const manualGeneratePuzzle = mutation({
  handler: async () => {
    // Only allow in development
    if (process.env.NODE_ENV === "production") {
      throw new Error("Manual puzzle generation not allowed in production");
    }

    // TODO: Refactor to avoid circular dependency
    // For now, returning a placeholder since this is dev-only
    return {
      status: "error",
      message:
        "Manual generation temporarily disabled due to circular dependency. Use cron job instead.",
    };
  },
});
