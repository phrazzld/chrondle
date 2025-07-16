import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Pool of all available years and their events
  yearEvents: defineTable({
    year: v.number(), // The year
    events: v.array(v.string()), // All events for this year
    used: v.boolean(), // Whether this year has been used in a puzzle
    usedDate: v.optional(v.string()), // Date when it was used (YYYY-MM-DD)
  })
    .index("by_year", ["year"])
    .index("by_used", ["used"]),

  // Daily puzzles - permanent historical record
  dailyPuzzles: defineTable({
    date: v.string(), // "2024-01-15"
    year: v.number(), // Target year (e.g., 1969)
    events: v.array(v.string()), // The 6 hints in exact order
    playCount: v.number(), // Track popularity
    avgGuesses: v.number(), // Difficulty metric
    createdAt: v.optional(v.number()), // Timestamp when puzzle was created
  })
    .index("by_date", ["date"])
    .index("by_year", ["year"]),

  // User game history
  userGames: defineTable({
    userId: v.string(),
    date: v.string(),
    year: v.number(),
    guesses: v.array(v.number()),
    completed: v.boolean(),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "date"]),

  // User accounts
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    isPremium: v.boolean(),
    subscriptionId: v.optional(v.string()),
    subscriptionEnd: v.optional(v.number()),
    currentStreak: v.number(),
    bestStreak: v.number(),
    totalCompleted: v.number(),
    joinedAt: v.number(),
  }).index("by_clerk", ["clerkId"]),
});
