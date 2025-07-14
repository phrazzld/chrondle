import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get today's puzzle (public query - no auth required)
export const getTodaysPuzzle = query({
  handler: async (ctx) => {
    const today = new Date().toISOString().split("T")[0];

    const puzzle = await ctx.db
      .query("dailyPuzzles")
      .withIndex("by_date", (q) => q.eq("date", today))
      .first();

    // If no puzzle exists for today, return null
    // The puzzle should be created by a scheduled function or manual trigger
    return puzzle;
  },
});

// Get puzzle by specific date
export const getPuzzleByDate = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    const puzzle = await ctx.db
      .query("dailyPuzzles")
      .withIndex("by_date", (q) => q.eq("date", date))
      .first();

    return puzzle;
  },
});

// Get archive puzzles (paginated, requires auth)
export const getArchivePuzzles = query({
  args: {
    paginationOpts: v.object({
      numItems: v.number(),
      cursor: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { paginationOpts }) => {
    // This will be enhanced with premium check later
    const { cursor, numItems } = paginationOpts;

    const results = await ctx.db
      .query("dailyPuzzles")
      .order("desc")
      .paginate({ cursor: cursor ?? null, numItems });

    return results;
  },
});

// Record a user's guess
export const recordGuess = mutation({
  args: {
    date: v.string(),
    year: v.number(),
    guess: v.number(),
    guesses: v.array(v.number()),
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Get the authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Anonymous users don't save to database
      return { saved: false };
    }

    // Find the user record
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      console.error("User not found in database:", identity.subject);
      return { saved: false };
    }

    // Check if game record already exists
    const existingGame = await ctx.db
      .query("userGames")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", user._id.toString()).eq("date", args.date),
      )
      .first();

    if (existingGame) {
      // Update existing game
      await ctx.db.patch(existingGame._id, {
        guesses: args.guesses,
        completed: args.completed,
        timestamp: Date.now(),
      });
    } else {
      // Create new game record
      await ctx.db.insert("userGames", {
        userId: user._id.toString(),
        date: args.date,
        year: args.year,
        guesses: args.guesses,
        completed: args.completed,
        timestamp: Date.now(),
      });
    }

    // Update daily puzzle stats
    const puzzle = await ctx.db
      .query("dailyPuzzles")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .first();

    if (puzzle) {
      const newPlayCount = (puzzle.playCount || 0) + 1;
      const currentAvg = puzzle.avgGuesses || 0;
      const newAvg = args.completed
        ? (currentAvg * puzzle.playCount + args.guesses.length) / newPlayCount
        : currentAvg;

      await ctx.db.patch(puzzle._id, {
        playCount: newPlayCount,
        avgGuesses: newAvg,
      });
    }

    return { saved: true };
  },
});

// Create today's puzzle (should be called by a daily cron job)
export const createDailyPuzzle = mutation({
  args: {
    date: v.string(), // YYYY-MM-DD format
  },
  handler: async (ctx, { date }) => {
    // Check if puzzle already exists for this date
    const existing = await ctx.db
      .query("dailyPuzzles")
      .withIndex("by_date", (q) => q.eq("date", date))
      .first();

    if (existing) {
      return { created: false, puzzle: existing };
    }

    // Get all unused years with at least 6 events
    const unusedYears = await ctx.db
      .query("yearEvents")
      .withIndex("by_used", (q) => q.eq("used", false))
      .collect();

    const eligibleYears = unusedYears.filter((y) => y.events.length >= 6);

    if (eligibleYears.length === 0) {
      throw new Error("No more unused years available for puzzles!");
    }

    // Use deterministic selection based on date
    const dateHash = date.split("").reduce((acc, char) => {
      return (acc << 5) + acc + char.charCodeAt(0);
    }, 5381);

    const selectedYear =
      eligibleYears[Math.abs(dateHash) % eligibleYears.length];

    // Take the first 6 events
    const puzzleEvents = selectedYear.events.slice(0, 6);

    // Create the puzzle
    const puzzleId = await ctx.db.insert("dailyPuzzles", {
      date,
      year: selectedYear.year,
      events: puzzleEvents,
      playCount: 0,
      avgGuesses: 0,
      createdAt: Date.now(),
    });

    // Mark the year as used
    await ctx.db.patch(selectedYear._id, {
      used: true,
      usedDate: date,
    });

    return {
      created: true,
      puzzle: {
        _id: puzzleId,
        date,
        year: selectedYear.year,
        events: puzzleEvents,
      },
    };
  },
});
