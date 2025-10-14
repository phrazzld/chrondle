import { QueryCtx } from "../_generated/server";
import { Doc } from "../_generated/dataModel";

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
