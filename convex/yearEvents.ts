import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Import year events into the pool
export const importYearEvents = mutation({
  args: {
    year: v.number(),
    events: v.array(v.string()),
  },
  handler: async (ctx, { year, events }) => {
    // Check if year already exists
    const existing = await ctx.db
      .query("yearEvents")
      .withIndex("by_year", (q) => q.eq("year", year))
      .first();

    if (existing) {
      // Update existing record
      await ctx.db.patch(existing._id, { events });
      return { updated: true, id: existing._id };
    } else {
      // Create new record
      const id = await ctx.db.insert("yearEvents", {
        year,
        events,
        used: false,
      });
      return { updated: false, id };
    }
  },
});

// Get all unused years with sufficient events
export const getUnusedYears = query({
  handler: async (ctx) => {
    const unusedYears = await ctx.db
      .query("yearEvents")
      .withIndex("by_used", (q) => q.eq("used", false))
      .collect();

    // Filter for years with at least 6 events
    return unusedYears.filter((y) => y.events.length >= 6);
  },
});

// Mark a year as used
export const markYearAsUsed = mutation({
  args: {
    year: v.number(),
    date: v.string(),
  },
  handler: async (ctx, { year, date }) => {
    const yearEvent = await ctx.db
      .query("yearEvents")
      .withIndex("by_year", (q) => q.eq("year", year))
      .first();

    if (!yearEvent) {
      throw new Error(`Year ${year} not found in pool`);
    }

    await ctx.db.patch(yearEvent._id, {
      used: true,
      usedDate: date,
    });
  },
});

// Get pool statistics
export const getPoolStats = query({
  handler: async (ctx) => {
    const allYears = await ctx.db.query("yearEvents").collect();
    const usedYears = allYears.filter((y) => y.used);
    const unusedWithEnoughEvents = allYears.filter(
      (y) => !y.used && y.events.length >= 6,
    );

    return {
      total: allYears.length,
      used: usedYears.length,
      available: unusedWithEnoughEvents.length,
      insufficientEvents: allYears.filter((y) => y.events.length < 6).length,
    };
  },
});
