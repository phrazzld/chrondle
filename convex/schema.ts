import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Pool of all historical events (one event per row for maximum reusability)
  events: defineTable({
    year: v.number(), // e.g., 1969
    event: v.string(), // "Neil Armstrong walks on the moon"
    puzzleId: v.optional(v.id("puzzles")), // null if unused, links to puzzle if used
    updatedAt: v.number(), // Manual timestamp (Convex provides _creationTime)
  })
    .index("by_year", ["year"])
    .index("by_puzzle", ["puzzleId"])
    .index("by_year_available", ["year", "puzzleId"]), // Efficient unused event queries

  // Daily puzzles (starts empty, populated by cron job)
  puzzles: defineTable({
    puzzleNumber: v.number(), // Human-readable: #1, #2, etc.
    date: v.string(), // "2024-07-16"
    targetYear: v.number(), // Year to guess
    events: v.array(v.string()), // 6 events (denormalized for performance)
    playCount: v.number(), // Social proof: "1,234 players"
    avgGuesses: v.number(), // Difficulty: "Avg: 3.2 guesses"
    updatedAt: v.number(), // For stats updates
  })
    .index("by_number", ["puzzleNumber"])
    .index("by_date", ["date"]),

  // User puzzle attempts (authenticated users only)
  plays: defineTable({
    userId: v.id("users"),
    puzzleId: v.id("puzzles"),
    guesses: v.array(v.number()), // [1945, 1939, 1941] - just years
    completedAt: v.optional(v.number()), // null = in progress, timestamp = done
    updatedAt: v.number(), // Last guess timestamp
  })
    .index("by_user_puzzle", ["userId", "puzzleId"])
    .index("by_user", ["userId"])
    .index("by_puzzle", ["puzzleId"]), // For stats calculation

  // User accounts
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    username: v.optional(v.string()), // For future leaderboards
    currentStreak: v.number(),
    longestStreak: v.number(),
    totalPlays: v.number(),
    perfectGames: v.number(), // Guessed in 1 try
    updatedAt: v.number(), // For streak updates
  }).index("by_clerk", ["clerkId"]),
});
