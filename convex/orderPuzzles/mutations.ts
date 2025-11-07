import { v } from "convex/values";
import { internalMutation, mutation } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import {
  type OrderEventCandidate,
  type SelectionConfig,
  selectEventsWithSpread,
} from "./generation";

const ORDER_SELECTION_CONFIG: SelectionConfig = {
  count: 6,
  minSpan: 100,
  maxSpan: 2000,
  excludeYears: [],
  maxAttempts: 10,
};

const ORDER_SEED_SALT = process.env.ORDER_PUZZLE_SALT ?? "chrondle-order";

type StoredOrderEvent = {
  id: string;
  year: number;
  text: string;
};

type GenerateArgs = {
  date?: string;
};

type GenerationResult =
  | { status: "already_exists"; puzzle: Doc<"orderPuzzles"> }
  | { status: "created"; puzzle: Doc<"orderPuzzles"> };

/**
 * Internal mutation triggered by cron to ensure the Order puzzle exists for a given date.
 */
export const generateDailyOrderPuzzle = internalMutation({
  args: {
    date: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<GenerationResult> => {
    return generateOrderPuzzleForDate(ctx, args?.date);
  },
});

/**
 * Public mutation so the frontend can guarantee Order puzzles exist on demand.
 */
export const ensureTodaysOrderPuzzle = mutation({
  handler: async (ctx): Promise<GenerationResult> => generateOrderPuzzleForDate(ctx),
});

async function generateOrderPuzzleForDate(
  ctx: MutationCtx,
  dateOverride?: string,
): Promise<GenerationResult> {
  const targetDate = dateOverride ?? getUTCDateString();

  const existing = await ctx.db
    .query("orderPuzzles")
    .withIndex("by_date", (q) => q.eq("date", targetDate))
    .first();

  if (existing) {
    console.info(`[generateDailyOrderPuzzle] Order puzzle already exists for ${targetDate}`);
    return { status: "already_exists", puzzle: existing };
  }

  const excludeYears = await lookupClassicYear(ctx, targetDate);

  const seed = hashDateSeed(targetDate);
  const allEvents = await loadEventCandidates(ctx);

  const { selection, attempts } = selectEventsWithAttempts(allEvents, seed, {
    ...ORDER_SELECTION_CONFIG,
    excludeYears,
  });

  const shuffledEvents = shuffleEvents(selection, seed);
  const storedEvents: StoredOrderEvent[] = shuffledEvents.map((event) => ({
    id: event._id,
    year: event.year,
    text: event.event,
  }));

  const latestPuzzle = await ctx.db.query("orderPuzzles").order("desc").first();
  const nextPuzzleNumber = (latestPuzzle?.puzzleNumber ?? 0) + 1;

  const puzzleId = await ctx.db.insert("orderPuzzles", {
    puzzleNumber: nextPuzzleNumber,
    date: targetDate,
    events: storedEvents,
    seed: String(seed),
    updatedAt: Date.now(),
  });

  const span = calculateSpan(selection);
  console.info(
    `[generateDailyOrderPuzzle] Created Order puzzle #${nextPuzzleNumber} for ${targetDate}`,
    {
      span,
      retryCount: attempts,
      excludedYears: excludeYears,
    },
  );

  const puzzle = await ctx.db.get(puzzleId);
  if (!puzzle) {
    throw new Error("Failed to load newly created Order puzzle.");
  }
  return { status: "created", puzzle };
}

async function lookupClassicYear(ctx: MutationCtx, targetDate: string): Promise<number[]> {
  const classicPuzzle = await ctx.db
    .query("puzzles")
    .withIndex("by_date", (q) => q.eq("date", targetDate))
    .first();

  if (!classicPuzzle) {
    console.warn(
      `[generateDailyOrderPuzzle] No Classic puzzle found for ${targetDate}, skipping exclusion`,
    );
    return [];
  }

  return [classicPuzzle.targetYear];
}

async function loadEventCandidates(ctx: MutationCtx): Promise<OrderEventCandidate[]> {
  const events = await ctx.db.query("events").collect();
  return events.map((event) => ({
    _id: event._id,
    year: event.year,
    event: event.event,
  }));
}

type SelectionOutcome = {
  selection: OrderEventCandidate[];
  attempts: number;
};

function selectEventsWithAttempts(
  events: OrderEventCandidate[],
  seed: number,
  config: SelectionConfig,
): SelectionOutcome {
  const maxAttempts = config.maxAttempts ?? ORDER_SELECTION_CONFIG.maxAttempts ?? 10;
  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const selection = selectEventsWithSpread(events, seed + attempt, {
        ...config,
        maxAttempts: 1,
      });
      return { selection, attempts: attempt };
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    `Unable to generate Order puzzle selection after ${maxAttempts} attempts: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`,
  );
}

function shuffleEvents(events: OrderEventCandidate[], seed: number): OrderEventCandidate[] {
  const prng = createPrng(seed);
  const array = [...events];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function hashDateSeed(date: string): number {
  const input = `${ORDER_SEED_SALT}:${date}`;
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function getUTCDateString(date: Date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function calculateSpan(events: OrderEventCandidate[]): number {
  if (events.length < 2) return 0;
  const years = events.map((event) => event.year).sort((a, b) => a - b);
  return years[years.length - 1] - years[0];
}

function createPrng(seed: number): () => number {
  let state = seed >>> 0 || 0x6d2b79f5;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
