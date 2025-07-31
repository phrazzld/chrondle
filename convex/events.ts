import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Import events into the pool (one event per row)
export const importEvent = mutation({
  args: {
    year: v.number(),
    event: v.string(),
  },
  handler: async (ctx, { year, event }) => {
    // Check if this exact event already exists
    const existing = await ctx.db
      .query("events")
      .withIndex("by_year", (q) => q.eq("year", year))
      .filter((q) => q.eq(q.field("event"), event))
      .first();

    if (existing) {
      // Event already exists, skip
      return { skipped: true, id: existing._id };
    }

    // Create new event with undefined puzzleId (unassigned)
    const id = await ctx.db.insert("events", {
      year,
      event,
      puzzleId: undefined,
      updatedAt: Date.now(),
    });

    return { created: true, id };
  },
});

// Batch import events for a year
export const importYearEvents = mutation({
  args: {
    year: v.number(),
    events: v.array(v.string()),
  },
  handler: async (ctx, { year, events }) => {
    const results = [];

    for (const event of events) {
      // Check if this exact event already exists
      const existing = await ctx.db
        .query("events")
        .withIndex("by_year", (q) => q.eq("year", year))
        .filter((q) => q.eq(q.field("event"), event))
        .first();

      if (existing) {
        results.push({ event, skipped: true, id: existing._id });
        continue;
      }

      // Create new event
      const id = await ctx.db.insert("events", {
        year,
        event,
        puzzleId: undefined,
        updatedAt: Date.now(),
      });

      results.push({ event, created: true, id });
    }

    return {
      year,
      total: events.length,
      created: results.filter((r) => r.created).length,
      skipped: results.filter((r) => r.skipped).length,
      results,
    };
  },
});

// Get events for a specific year
export const getYearEvents = query({
  args: { year: v.number() },
  handler: async (ctx, { year }) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_year", (q) => q.eq("year", year))
      .collect();

    return events;
  },
});

// Get available years (years with 6+ unused events)
export const getAvailableYears = query({
  handler: async (ctx) => {
    // Get all events that aren't assigned to a puzzle
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

    return availableYears;
  },
});

// Mark events as used by a puzzle
export const assignEventsToPuzzle = mutation({
  args: {
    eventIds: v.array(v.id("events")),
    puzzleId: v.id("puzzles"),
  },
  handler: async (ctx, { eventIds, puzzleId }) => {
    for (const eventId of eventIds) {
      await ctx.db.patch(eventId, {
        puzzleId,
        updatedAt: Date.now(),
      });
    }

    return { assigned: eventIds.length };
  },
});

// Delete all events for a year (only if none are used in puzzles)
export const deleteYearEvents = mutation({
  args: {
    year: v.number(),
  },
  handler: async (ctx, { year }) => {
    // Get all events for the year
    const events = await ctx.db
      .query("events")
      .withIndex("by_year", (q) => q.eq("year", year))
      .collect();

    // Check if any events are used in puzzles
    const usedEvents = events.filter((e) => e.puzzleId !== undefined);
    if (usedEvents.length > 0) {
      throw new Error(
        `Cannot delete events for year ${year}: ${usedEvents.length} events are used in puzzles`,
      );
    }

    // Delete all events for the year
    let deletedCount = 0;
    for (const event of events) {
      await ctx.db.delete(event._id);
      deletedCount++;
    }

    return {
      year,
      deletedCount,
    };
  },
});

// Get all years with event counts
export const getAllYearsWithStats = query({
  handler: async (ctx) => {
    const allEvents = await ctx.db.query("events").collect();

    // Group events by year
    const yearStats = new Map<number, { total: number; used: number }>();

    for (const event of allEvents) {
      const stats = yearStats.get(event.year) || { total: 0, used: 0 };
      stats.total++;
      if (event.puzzleId !== undefined) {
        stats.used++;
      }
      yearStats.set(event.year, stats);
    }

    // Convert to sorted array
    const result = Array.from(yearStats.entries())
      .map(([year, stats]) => ({
        year,
        total: stats.total,
        used: stats.used,
        available: stats.total - stats.used,
      }))
      .sort((a, b) => a.year - b.year); // Chronological order

    return result;
  },
});

// Get pool statistics
export const getEventPoolStats = query({
  handler: async (ctx) => {
    const allEvents = await ctx.db.query("events").collect();
    const assignedEvents = allEvents.filter((e) => e.puzzleId !== undefined);
    const unassignedEvents = allEvents.filter((e) => e.puzzleId === undefined);

    // Count unique years
    const uniqueYears = new Set(allEvents.map((e) => e.year));

    // Count years with enough events
    const yearEventCounts = new Map<number, number>();
    for (const event of unassignedEvents) {
      const count = yearEventCounts.get(event.year) || 0;
      yearEventCounts.set(event.year, count + 1);
    }

    const yearsWithEnoughEvents = Array.from(yearEventCounts.values()).filter(
      (count) => count >= 6,
    ).length;

    return {
      totalEvents: allEvents.length,
      assignedEvents: assignedEvents.length,
      unassignedEvents: unassignedEvents.length,
      uniqueYears: uniqueYears.size,
      availableYearsForPuzzles: yearsWithEnoughEvents,
    };
  },
});
