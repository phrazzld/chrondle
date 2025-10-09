import { v } from "convex/values";
import { query, mutation, internalMutation, DatabaseWriter } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { calculateStreak, getUTCDateString } from "./lib/streakCalculation";

// Game configuration constants
const MAX_GUESSES = 6;

// Internal mutation for cron job to generate daily puzzle
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

    // Get available years with 6+ unused events
    // Inline the logic to avoid circular dependency
    const unusedEvents = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("puzzleId"), undefined))
      .collect();

    // Group by year and count
    const yearCounts = new Map<number, number>();
    for (const event of unusedEvents) {
      const count = yearCounts.get(event.year) || 0;
      yearCounts.set(event.year, count + 1);
    }

    // Filter years with 6+ events
    const availableYears = Array.from(yearCounts.entries())
      .filter(([, count]) => count >= 6)
      .map(([year, count]) => ({ year, availableEvents: count }))
      .sort((a, b) => a.year - b.year);

    if (availableYears.length === 0) {
      throw new Error("No years available with enough unused events");
    }

    // Select a random year
    const randomYear = availableYears[Math.floor(Math.random() * availableYears.length)];

    // Get all unused events for the selected year
    const yearEvents = await ctx.db
      .query("events")
      .withIndex("by_year", (q) => q.eq("year", randomYear.year))
      .filter((q) => q.eq(q.field("puzzleId"), undefined))
      .collect();

    // Randomly select 6 events
    const shuffled = [...yearEvents].sort(() => Math.random() - 0.5);
    const selectedEvents = shuffled.slice(0, 6);

    if (selectedEvents.length < 6) {
      throw new Error(`Not enough events for year ${randomYear.year}`);
    }

    // Create the puzzle
    const puzzleId = await ctx.db.insert("puzzles", {
      puzzleNumber: nextPuzzleNumber,
      date: targetDate,
      targetYear: randomYear.year,
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
          year: randomYear.year,
          events: selectedEvents.map((e) => e.event),
        },
      );

      console.warn(
        `Scheduled historical context generation for puzzle ${puzzleId} (year ${randomYear.year})`,
      );
    } catch (schedulerError) {
      // Log but don't fail puzzle creation - graceful degradation
      console.error(
        `[generateDailyPuzzle] Failed to schedule context generation for puzzle ${puzzleId}:`,
        schedulerError,
      );
    }

    console.warn(
      `Created puzzle #${nextPuzzleNumber} for ${targetDate} with year ${randomYear.year}`,
    );

    return {
      status: "created",
      puzzle: {
        _id: puzzleId,
        puzzleNumber: nextPuzzleNumber,
        date: targetDate,
        targetYear: randomYear.year,
      },
    };
  },
});

// Get today's puzzle - just returns the puzzle or null
export const getDailyPuzzle = query({
  handler: async (ctx) => {
    const today = new Date().toISOString().slice(0, 10);

    const puzzle = await ctx.db
      .query("puzzles")
      .withIndex("by_date", (q) => q.eq("date", today))
      .first();

    return puzzle;
  },
});

// Public mutation to ensure today's puzzle exists
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

    // Trigger generation using our internal mutation logic
    // We'll inline the generation logic here to avoid circular dependencies
    console.warn(`[ensureTodaysPuzzle] Generating puzzle for ${today}`);

    // Get the highest puzzle number
    const latestPuzzle = await ctx.db.query("puzzles").order("desc").first();
    const nextPuzzleNumber = (latestPuzzle?.puzzleNumber || 0) + 1;

    // Get available years with 6+ unused events
    const unusedEvents = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("puzzleId"), undefined))
      .collect();

    const yearCounts = new Map<number, number>();
    for (const event of unusedEvents) {
      const count = yearCounts.get(event.year) || 0;
      yearCounts.set(event.year, count + 1);
    }

    const availableYears = Array.from(yearCounts.entries())
      .filter(([, count]) => count >= 6)
      .map(([year, count]) => ({ year, availableEvents: count }))
      .sort((a, b) => a.year - b.year);

    if (availableYears.length === 0) {
      throw new Error("No years available with enough unused events");
    }

    const randomYear = availableYears[Math.floor(Math.random() * availableYears.length)];

    const yearEvents = await ctx.db
      .query("events")
      .withIndex("by_year", (q) => q.eq("year", randomYear.year))
      .filter((q) => q.eq(q.field("puzzleId"), undefined))
      .collect();

    const shuffled = [...yearEvents].sort(() => Math.random() - 0.5);
    const selectedEvents = shuffled.slice(0, 6);

    if (selectedEvents.length < 6) {
      throw new Error(`Not enough events for year ${randomYear.year}`);
    }

    const puzzleId = await ctx.db.insert("puzzles", {
      puzzleNumber: nextPuzzleNumber,
      date: today,
      targetYear: randomYear.year,
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

    console.warn(`Created puzzle #${nextPuzzleNumber} for ${today} with year ${randomYear.year}`);

    return { status: "created", puzzle: newPuzzle };
  },
});

// Get total number of puzzles
export const getTotalPuzzles = query({
  handler: async (ctx) => {
    const puzzles = await ctx.db.query("puzzles").collect();
    return { count: puzzles.length };
  },
});

// Get all unique puzzle years
export const getPuzzleYears = query({
  handler: async (ctx) => {
    const puzzles = await ctx.db.query("puzzles").collect();

    // Extract unique years
    const yearsSet = new Set<number>();
    for (const puzzle of puzzles) {
      yearsSet.add(puzzle.targetYear);
    }

    // Convert to array and sort descending (newest first)
    const years = Array.from(yearsSet).sort((a, b) => b - a);

    return { years };
  },
});

// Get puzzle by ID
export const getPuzzleById = query({
  args: { puzzleId: v.id("puzzles") },
  handler: async (ctx, { puzzleId }) => {
    const puzzle = await ctx.db.get(puzzleId);
    return puzzle;
  },
});

// Get puzzle by number
export const getPuzzleByNumber = query({
  args: { puzzleNumber: v.number() },
  handler: async (ctx, { puzzleNumber }) => {
    const puzzle = await ctx.db
      .query("puzzles")
      .withIndex("by_number", (q) => q.eq("puzzleNumber", puzzleNumber))
      .first();

    return puzzle;
  },
});

// Get archive puzzles (paginated)
export const getArchivePuzzles = query({
  args: {
    page: v.number(),
    pageSize: v.number(),
  },
  handler: async (ctx, { page, pageSize }) => {
    // Get total count
    const allPuzzles = await ctx.db.query("puzzles").collect();
    const totalCount = allPuzzles.length;

    // Get puzzles sorted by puzzle number (newest first)
    const puzzles = await ctx.db.query("puzzles").order("desc").collect();

    // Manual pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedPuzzles = puzzles.slice(startIndex, endIndex);

    return {
      puzzles: paginatedPuzzles,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
      totalCount,
    };
  },
});

// Submit a guess (for authenticated users)
export const submitGuess = mutation({
  args: {
    puzzleId: v.id("puzzles"),
    userId: v.id("users"),
    guess: v.number(),
  },
  handler: async (ctx, args) => {
    // Get the puzzle to check the target year
    const puzzle = await ctx.db.get(args.puzzleId);
    if (!puzzle) {
      throw new Error("Puzzle not found");
    }

    // Check if play record exists
    const existingPlay = await ctx.db
      .query("plays")
      .withIndex("by_user_puzzle", (q) => q.eq("userId", args.userId).eq("puzzleId", args.puzzleId))
      .first();

    const isCorrect = args.guess === puzzle.targetYear;

    if (existingPlay) {
      // Don't allow guesses on completed puzzles
      if (existingPlay.completedAt) {
        throw new Error("Puzzle already completed");
      }

      // Add guess to existing play
      const updatedGuesses = [...existingPlay.guesses, args.guess];

      await ctx.db.patch(existingPlay._id, {
        guesses: updatedGuesses,
        completedAt: isCorrect ? Date.now() : undefined,
        updatedAt: Date.now(),
      });

      // Update puzzle stats and streak
      if (isCorrect) {
        await updatePuzzleStats(ctx, args.puzzleId);
        await updateUserStreak(ctx, args.userId, true);
      } else if (updatedGuesses.length >= MAX_GUESSES) {
        // Game lost - reset streak to 0
        await updateUserStreak(ctx, args.userId, false);
      }

      return {
        correct: isCorrect,
        guesses: updatedGuesses,
        targetYear: puzzle.targetYear,
      };
    } else {
      // Create new play record
      await ctx.db.insert("plays", {
        userId: args.userId,
        puzzleId: args.puzzleId,
        guesses: [args.guess],
        completedAt: isCorrect ? Date.now() : undefined,
        updatedAt: Date.now(),
      });

      // Update puzzle stats and streak
      if (isCorrect) {
        await updatePuzzleStats(ctx, args.puzzleId);
        await updateUserStreak(ctx, args.userId, true);
      }
      // Note: For new play records, we never have MAX_GUESSES on first submission
      // Loss streak reset only happens in the existing play path above

      return {
        correct: isCorrect,
        guesses: [args.guess],
        targetYear: puzzle.targetYear,
      };
    }
  },
});

// Helper function to update puzzle statistics
async function updatePuzzleStats(ctx: { db: DatabaseWriter }, puzzleId: Id<"puzzles">) {
  // Get all completed plays for this puzzle
  const completedPlays = await ctx.db
    .query("plays")
    .withIndex("by_puzzle", (q) => q.eq("puzzleId", puzzleId))
    .filter((q) => q.neq(q.field("completedAt"), null))
    .collect();

  const playCount = completedPlays.length;
  if (playCount === 0) return;

  // Calculate average guesses
  const totalGuesses = completedPlays.reduce((sum: number, play) => sum + play.guesses.length, 0);
  const avgGuesses = totalGuesses / playCount;

  // Update puzzle
  await ctx.db.patch(puzzleId, {
    playCount,
    avgGuesses: Math.round(avgGuesses * 10) / 10, // Round to 1 decimal
    updatedAt: Date.now(),
  });
}

// Helper function to update user streak after completing a puzzle
async function updateUserStreak(ctx: { db: DatabaseWriter }, userId: Id<"users">, hasWon: boolean) {
  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const today = getUTCDateString();
  const result = calculateStreak(user.lastCompletedDate || null, user.currentStreak, today, hasWon);

  // Special case: same-day completion returns currentStreak = 0 as signal
  // Don't update if already played today
  if (result.currentStreak === 0 && result.lastCompletedDate === user.lastCompletedDate) {
    return; // No update needed
  }

  await ctx.db.patch(userId, {
    currentStreak: result.currentStreak,
    lastCompletedDate: result.lastCompletedDate,
    longestStreak: Math.max(result.currentStreak, user.longestStreak),
    updatedAt: Date.now(),
  });
}

// Get user's play record for a puzzle
export const getUserPlay = query({
  args: {
    puzzleId: v.id("puzzles"),
    userId: v.id("users"),
  },
  handler: async (ctx, { puzzleId, userId }) => {
    try {
      // Validate input parameters
      if (!puzzleId || !userId) {
        console.warn("[getUserPlay] Missing required parameters:", {
          puzzleId: puzzleId ? "provided" : "missing",
          userId: userId ? "provided" : "missing",
          timestamp: new Date().toISOString(),
        });
        return null;
      }

      // Additional validation: Check if the IDs are valid format
      // Convex IDs are strings, so we check they're non-empty strings
      if (typeof puzzleId !== "string" || typeof userId !== "string") {
        console.warn("[getUserPlay] Invalid parameter types:", {
          puzzleIdType: typeof puzzleId,
          userIdType: typeof userId,
          timestamp: new Date().toISOString(),
        });
        return null;
      }

      // Perform the query with defensive programming
      const play = await ctx.db
        .query("plays")
        .withIndex("by_user_puzzle", (q) => q.eq("userId", userId).eq("puzzleId", puzzleId))
        .first();

      // Log successful query in development for debugging
      if (process.env.NODE_ENV === "development" && play) {
        console.error("[getUserPlay] Successfully retrieved play record:", {
          userId: userId.slice(0, 8) + "...", // Log partial ID for privacy
          puzzleId: puzzleId.slice(0, 8) + "...",
          hasGuesses: play.guesses?.length > 0,
          isCompleted: !!play.completedAt,
        });
      }

      return play;
    } catch (error) {
      // Log the error with context for debugging
      console.error("[getUserPlay] Error fetching user play record:", {
        error: error instanceof Error ? error.message : String(error),
        userId: userId ? userId.slice(0, 8) + "..." : "undefined",
        puzzleId: puzzleId ? puzzleId.slice(0, 8) + "..." : "undefined",
        timestamp: new Date().toISOString(),
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Return null instead of throwing to allow graceful degradation
      // The client can handle null as "no play record found"
      return null;
    }
  },
});

// Get user's completed puzzles
export const getUserCompletedPuzzles = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    const completedPlays = await ctx.db
      .query("plays")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.neq(q.field("completedAt"), null))
      .collect();

    return completedPlays;
  },
});

// Get next cron schedule for countdown system
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

// Manual trigger for generating a puzzle (for testing)
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

// Internal mutation to update puzzle with historical context
export const updateHistoricalContext = internalMutation({
  args: {
    puzzleId: v.id("puzzles"),
    context: v.string(),
  },
  handler: async (ctx, { puzzleId, context }) => {
    // Validate puzzle exists
    const puzzle = await ctx.db.get(puzzleId);
    if (!puzzle) {
      throw new Error("Puzzle not found");
    }

    // Validate context is non-empty string (min 100 chars)
    if (!context || typeof context !== "string") {
      throw new Error("Context must be a non-empty string");
    }

    if (context.length < 100) {
      throw new Error("Context must be at least 100 characters long");
    }

    // Update puzzle with historical context and timestamp
    await ctx.db.patch(puzzleId, {
      historicalContext: context,
      historicalContextGeneratedAt: Date.now(),
      updatedAt: Date.now(),
    });

    console.error(
      `[updateHistoricalContext] Successfully updated puzzle ${puzzleId} with ${context.length} character context`,
    );

    // Read back the updated puzzle to verify the update succeeded
    const updatedPuzzle = await ctx.db.get(puzzleId);

    return {
      success: true,
      puzzleId,
      contextLength: context.length,
      generatedAt: Date.now(),
      updatedPuzzle, // Include the updated puzzle for verification
    };
  },
});
