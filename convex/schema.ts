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
    historicalContext: v.optional(v.string()), // AI-generated narrative (3000-4000 chars)
    historicalContextGeneratedAt: v.optional(v.number()), // Unix timestamp when context was generated
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

  // Bitcoin Lightning donations via Strike API
  donations: defineTable({
    // Identity
    kind: v.union(v.literal("receive_request"), v.literal("invoice")),
    strikeEntityId: v.string(), // receiveRequestId or invoiceId from Strike

    // Payment Details
    lnInvoice: v.optional(v.string()), // Bolt11 string
    btcAddress: v.optional(v.string()), // On-chain fallback address
    requestedAmount: v.optional(v.number()), // Can be null for open-amount
    requestedCurrency: v.union(v.literal("BTC"), v.literal("USD")),
    settlementCurrency: v.literal("BTC"), // Always settle in BTC

    // State Machine
    state: v.union(
      v.literal("CREATED"),
      v.literal("PENDING"),
      v.literal("PAID"),
      v.literal("EXPIRED"),
      v.literal("FAILED"),
    ),

    // Metadata
    correlationId: v.string(), // For idempotency and tracking
    payerNote: v.optional(v.string()), // Optional message from donor
    expiresAt: v.number(), // Unix timestamp when payment expires
    createdAt: v.number(), // When donation request was created
    updatedAt: v.number(), // Last state change

    // Payment completion metadata (populated from webhook)
    metadata: v.optional(
      v.object({
        paidAmount: v.optional(v.number()), // Actual amount paid in satoshis or currency units
        paidCurrency: v.optional(v.string()), // Currency of payment (e.g., "BTC", "USD")
        transactionId: v.optional(v.string()), // Lightning/Bitcoin transaction ID for reference
      }),
    ),
  })
    .index("by_strike_id", ["strikeEntityId"])
    .index("by_correlation", ["correlationId"])
    .index("by_state", ["state"])
    .index("by_expiry", ["expiresAt"]),

  // Strike webhook events for audit and replay
  webhooks: defineTable({
    eventId: v.string(), // Strike's unique event ID
    eventType: v.string(), // e.g., "invoice.updated", "receive_request.completed"
    entityId: v.string(), // Related Strike entity (invoice/receive_request ID)
    payload: v.string(), // Raw JSON payload for debugging/replay
    signature: v.string(), // Webhook signature for audit trail
    processedAt: v.optional(v.number()), // When we finished processing (null = pending)
    attempts: v.number(), // Number of processing attempts (for retry logic)
    status: v.union(v.literal("pending"), v.literal("processed"), v.literal("failed")),
    createdAt: v.number(), // When webhook was received
  })
    .index("by_event", ["eventId"]) // For idempotency checks
    .index("by_entity", ["entityId"]) // Find webhooks for specific donations
    .index("by_status", ["status"]) // Query failed/pending webhooks
    .index("by_type", ["eventType"]), // Query by event type
});
