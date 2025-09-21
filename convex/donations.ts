import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { createStrikeClient } from "../lib/strike-client";
import { nanoid } from "nanoid";

/**
 * Generate a unique correlation ID for tracking donations
 */
function generateCorrelationId(): string {
  return `chrondle_${Date.now()}_${nanoid(8)}`;
}

/**
 * Create a new donation request via Strike API
 * Supports both fixed amounts and pay-what-you-want flows
 */
export const createDonation = mutation({
  args: {
    amount: v.optional(v.number()),
    currency: v.union(v.literal("BTC"), v.literal("USD")),
    railPreference: v.union(v.literal("LN"), v.literal("ONCHAIN"), v.literal("BOTH")),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      // 1. Generate unique correlation ID for this donation
      const correlationId = generateCorrelationId();

      // 2. Create Strike client
      const strikeClient = createStrikeClient();

      // 3. Prepare Strike API request based on rail preference
      const receiveRequestParams = {
        ...(args.amount && {
          amount: {
            currency: args.currency,
            amount: args.amount.toString(),
          },
        }),
        ...(args.railPreference !== "ONCHAIN" && { bolt11: {} }),
        ...(args.railPreference !== "LN" && { onchain: {} }),
      };

      // 4. Call Strike API to create receive request
      const strikeResponse = await strikeClient.createReceiveRequest(receiveRequestParams);

      // 5. Calculate expiration time (use bolt11 expiration or default to 24h)
      const expiresAt = strikeResponse.bolt11?.expiresAt
        ? strikeResponse.bolt11.expiresAt
        : Date.now() + 24 * 60 * 60 * 1000; // 24 hours default

      // 6. Store donation record in database
      const donationId = await ctx.db.insert("donations", {
        kind: "receive_request",
        strikeEntityId: strikeResponse.receiveRequestId,
        lnInvoice: strikeResponse.bolt11?.lnInvoice,
        btcAddress: strikeResponse.onchain?.address,
        requestedAmount: args.amount,
        requestedCurrency: args.currency,
        settlementCurrency: "BTC",
        state: "CREATED",
        correlationId,
        payerNote: args.note,
        expiresAt,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // 7. Return payment details for frontend
      return {
        donationId,
        lnInvoice: strikeResponse.bolt11?.lnInvoice,
        btcAddress: strikeResponse.onchain?.address,
        expiresAt,
        correlationId,
      };
    } catch (error) {
      console.error("Error creating donation:", error);

      // Provide user-friendly error messages
      if (error instanceof Error && error.message.includes("rate limit")) {
        throw new Error("Payment system is temporarily busy. Please try again in a moment.");
      }

      if (error instanceof Error && error.message.includes("Strike API")) {
        throw new Error("Payment service is temporarily unavailable. Please try again later.");
      }

      throw new Error("Failed to create donation request. Please try again.");
    }
  },
});

/**
 * Get donation details by ID
 */
export const getDonation = query({
  args: { donationId: v.id("donations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.donationId);
  },
});

/**
 * Get donation by Strike entity ID (for webhook processing)
 */
export const getDonationByStrikeId = query({
  args: { strikeEntityId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("donations")
      .withIndex("by_strike_id", (q) => q.eq("strikeEntityId", args.strikeEntityId))
      .first();
  },
});

/**
 * Get donations by state (for monitoring)
 */
export const getDonationsByState = query({
  args: {
    state: v.union(
      v.literal("CREATED"),
      v.literal("PENDING"),
      v.literal("PAID"),
      v.literal("EXPIRED"),
      v.literal("FAILED"),
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const query = ctx.db
      .query("donations")
      .withIndex("by_state", (q) => q.eq("state", args.state))
      .order("desc");

    if (args.limit) {
      return await query.take(args.limit);
    }

    return await query.collect();
  },
});

/**
 * Update donation state (internal use by webhook processor)
 */
export const updateDonationState = internalMutation({
  args: {
    donationId: v.id("donations"),
    state: v.union(
      v.literal("CREATED"),
      v.literal("PENDING"),
      v.literal("PAID"),
      v.literal("EXPIRED"),
      v.literal("FAILED"),
    ),
    metadata: v.optional(
      v.object({
        paidAmount: v.optional(v.number()),
        paidCurrency: v.optional(v.string()),
        transactionId: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.donationId, {
      state: args.state,
      updatedAt: Date.now(),
      // Store any additional metadata if provided
      ...(args.metadata && { metadata: args.metadata }),
    });
  },
});

/**
 * Mark expired donations (cron job helper)
 */
export const markExpiredDonations = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Find all donations that are created or pending but past expiration
    const expiredDonations = await ctx.db
      .query("donations")
      .withIndex("by_expiry", (q) => q.lt("expiresAt", now))
      .filter((q) => q.or(q.eq(q.field("state"), "CREATED"), q.eq(q.field("state"), "PENDING")))
      .collect();

    // Update all expired donations
    for (const donation of expiredDonations) {
      await ctx.db.patch(donation._id, {
        state: "EXPIRED",
        updatedAt: now,
      });
    }

    return { expiredCount: expiredDonations.length };
  },
});

/**
 * Get donation statistics (for admin dashboard)
 */
export const getDonationStats = query({
  args: {},
  handler: async (ctx) => {
    const allDonations = await ctx.db.query("donations").collect();

    const stats = {
      total: allDonations.length,
      created: 0,
      pending: 0,
      paid: 0,
      expired: 0,
      failed: 0,
      totalAmount: 0,
      averageAmount: 0,
    };

    let totalAmount = 0;
    let paidCount = 0;

    for (const donation of allDonations) {
      stats[donation.state.toLowerCase() as keyof typeof stats]++;

      if (donation.state === "PAID" && donation.requestedAmount) {
        totalAmount += donation.requestedAmount;
        paidCount++;
      }
    }

    stats.totalAmount = totalAmount;
    stats.averageAmount = paidCount > 0 ? totalAmount / paidCount : 0;

    return stats;
  },
});
