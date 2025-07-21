import { v } from "convex/values";
import {
  query,
  mutation,
  internalMutation,
  DatabaseWriter,
} from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Internal mutation for cron job to generate daily puzzle
export const generateDailyPuzzle = internalMutation({
  handler: async (ctx) => {
    // Get today's date in UTC
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10); // YYYY-MM-DD format

    // Check if today's puzzle already exists
    const existingPuzzle = await ctx.db
      .query("puzzles")
      .withIndex("by_date", (q) => q.eq("date", dateStr))
      .first();

    if (existingPuzzle) {
      console.warn(`Puzzle for ${dateStr} already exists`);
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
    const randomYear =
      availableYears[Math.floor(Math.random() * availableYears.length)];

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
      date: dateStr,
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

    console.warn(
      `Created puzzle #${nextPuzzleNumber} for ${dateStr} with year ${randomYear.year}`,
    );

    return {
      status: "created",
      puzzle: {
        _id: puzzleId,
        puzzleNumber: nextPuzzleNumber,
        date: dateStr,
        targetYear: randomYear.year,
      },
    };
  },
});

// Get today's puzzle
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
      .withIndex("by_user_puzzle", (q) =>
        q.eq("userId", args.userId).eq("puzzleId", args.puzzleId),
      )
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

      // Update puzzle stats if completed
      if (isCorrect) {
        await updatePuzzleStats(ctx, args.puzzleId);
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

      // Update puzzle stats
      if (isCorrect) {
        await updatePuzzleStats(ctx, args.puzzleId);
      }

      return {
        correct: isCorrect,
        guesses: [args.guess],
        targetYear: puzzle.targetYear,
      };
    }
  },
});

// Helper function to update puzzle statistics
async function updatePuzzleStats(
  ctx: { db: DatabaseWriter },
  puzzleId: Id<"puzzles">,
) {
  // Get all completed plays for this puzzle
  const completedPlays = await ctx.db
    .query("plays")
    .withIndex("by_puzzle", (q) => q.eq("puzzleId", puzzleId))
    .filter((q) => q.neq(q.field("completedAt"), null))
    .collect();

  const playCount = completedPlays.length;
  if (playCount === 0) return;

  // Calculate average guesses
  const totalGuesses = completedPlays.reduce(
    (sum: number, play) => sum + play.guesses.length,
    0,
  );
  const avgGuesses = totalGuesses / playCount;

  // Update puzzle
  await ctx.db.patch(puzzleId, {
    playCount,
    avgGuesses: Math.round(avgGuesses * 10) / 10, // Round to 1 decimal
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
    const play = await ctx.db
      .query("plays")
      .withIndex("by_user_puzzle", (q) =>
        q.eq("userId", userId).eq("puzzleId", puzzleId),
      )
      .first();

    return play;
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
