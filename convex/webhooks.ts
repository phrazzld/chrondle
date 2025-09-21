import { internalMutation, internalQuery, query, MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { createStrikeClient } from "../lib/strike-client";

/**
 * Store webhook event for processing (called by webhook handler)
 */
export const enqueue = internalMutation({
  args: {
    eventId: v.string(),
    eventType: v.string(),
    entityId: v.string(),
    payload: v.string(),
    signature: v.string(),
  },
  handler: async (ctx, args) => {
    // Store webhook event for async processing
    const webhookId = await ctx.db.insert("webhooks", {
      eventId: args.eventId,
      eventType: args.eventType,
      entityId: args.entityId,
      payload: args.payload,
      signature: args.signature,
      processedAt: undefined,
      attempts: 0,
      status: "pending",
      createdAt: Date.now(),
    });

    // Schedule immediate processing
    await ctx.scheduler.runAfter(0, internal.webhooks.processWebhook, {
      webhookId,
    });

    return webhookId;
  },
});

/**
 * Check if webhook event has already been processed (idempotency)
 */
export const getByEventId = internalQuery({
  args: { eventId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("webhooks")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .first();
  },
});

/**
 * Process webhook event (scheduled function)
 */
export const processWebhook = internalMutation({
  args: { webhookId: v.id("webhooks") },
  handler: async (ctx, args) => {
    const webhook = await ctx.db.get(args.webhookId);
    if (!webhook || webhook.status !== "pending") {
      return; // Already processed or doesn't exist
    }

    try {
      const event = JSON.parse(webhook.payload);

      // Handle different event types
      switch (webhook.eventType) {
        case "invoice.updated":
          await handleInvoiceUpdated(ctx, event, webhook.entityId);
          break;

        case "receive_request.completed":
          await handleReceiveRequestCompleted(ctx, event, webhook.entityId);
          break;

        case "receive_request.updated":
          await handleReceiveRequestUpdated(ctx, event, webhook.entityId);
          break;

        default:
        // Unhandled webhook event type - not an error, just log for monitoring
      }

      // Mark webhook as successfully processed
      await ctx.db.patch(webhook._id, {
        processedAt: Date.now(),
        status: "processed",
      });
    } catch (error) {
      console.error(`Error processing webhook ${webhook.eventId}:`, error);

      // Increment attempt counter
      const newAttempts = webhook.attempts + 1;
      const maxAttempts = 3;

      if (newAttempts >= maxAttempts) {
        // Mark as failed after max attempts
        await ctx.db.patch(webhook._id, {
          attempts: newAttempts,
          status: "failed",
        });
        console.error(`Webhook ${webhook.eventId} failed after ${maxAttempts} attempts`);
      } else {
        // Retry with exponential backoff
        await ctx.db.patch(webhook._id, {
          attempts: newAttempts,
        });

        const delayMs = Math.pow(2, newAttempts) * 1000; // 2s, 4s, 8s
        await ctx.scheduler.runAfter(delayMs, internal.webhooks.processWebhook, {
          webhookId: webhook._id,
        });
      }

      throw error; // Re-throw for monitoring
    }
  },
});

/**
 * Handle invoice state updates
 */
async function handleInvoiceUpdated(
  ctx: MutationCtx,
  event: { data?: { changes?: string[] } },
  entityId: string,
) {
  // Find the donation record
  const donation = await ctx.db
    .query("donations")
    .withIndex("by_strike_id", (q) => q.eq("strikeEntityId", entityId))
    .first();

  if (!donation) {
    console.warn(`No donation found for invoice ${entityId}`);
    return;
  }

  // Fetch latest invoice state from Strike API
  const strikeClient = createStrikeClient();
  const invoice = await strikeClient.getInvoice(entityId);

  // Map Strike state to our internal state
  let newState: "CREATED" | "PENDING" | "PAID" | "EXPIRED" | "FAILED";
  switch (invoice.state) {
    case "PAID":
      newState = "PAID";
      break;
    case "CANCELLED":
      newState = "FAILED";
      break;
    default:
      newState = "PENDING";
  }

  // Update donation state if changed
  if (donation.state !== newState) {
    await ctx.runMutation(internal.donations.updateDonationState, {
      donationId: donation._id,
      state: newState,
      metadata:
        invoice.state === "PAID"
          ? {
              paidAmount: parseFloat(invoice.amount.amount),
              paidCurrency: invoice.amount.currency,
            }
          : undefined,
    });
  }
}

/**
 * Handle receive request completion
 */
async function handleReceiveRequestCompleted(
  ctx: MutationCtx,
  event: { data?: { amount?: { amount?: string; currency?: string }; transactionId?: string } },
  entityId: string,
) {
  // Find the donation record
  const donation = await ctx.db
    .query("donations")
    .withIndex("by_strike_id", (q) => q.eq("strikeEntityId", entityId))
    .first();

  if (!donation) {
    console.warn(`No donation found for receive request ${entityId}`);
    return;
  }

  // Mark as paid
  if (donation.state !== "PAID") {
    await ctx.runMutation(internal.donations.updateDonationState, {
      donationId: donation._id,
      state: "PAID",
      metadata: {
        // Extract amount from event data if available
        paidAmount: event.data?.amount?.amount ? parseFloat(event.data.amount.amount) : undefined,
        paidCurrency: event.data?.amount?.currency,
        transactionId: event.data?.transactionId,
      },
    });
  }
}

/**
 * Handle receive request updates (state changes)
 */
async function handleReceiveRequestUpdated(
  ctx: MutationCtx,
  event: { data?: { changes?: string[] } },
  entityId: string,
) {
  // Find the donation record
  const donation = await ctx.db
    .query("donations")
    .withIndex("by_strike_id", (q) => q.eq("strikeEntityId", entityId))
    .first();

  if (!donation) {
    console.warn(`No donation found for receive request ${entityId}`);
    return;
  }

  // Check if this indicates payment pending
  if (event.data?.changes?.includes("state") && donation.state === "CREATED") {
    await ctx.runMutation(internal.donations.updateDonationState, {
      donationId: donation._id,
      state: "PENDING",
    });
  }
}

/**
 * Get webhook processing statistics (for monitoring)
 */
export const getWebhookStats = query({
  args: {},
  handler: async (ctx) => {
    const allWebhooks = await ctx.db.query("webhooks").collect();

    const stats = {
      total: allWebhooks.length,
      pending: 0,
      processed: 0,
      failed: 0,
      byEventType: {} as Record<string, number>,
      avgProcessingTime: 0,
    };

    let totalProcessingTime = 0;
    let processedCount = 0;

    for (const webhook of allWebhooks) {
      stats[webhook.status]++;

      // Count by event type
      stats.byEventType[webhook.eventType] = (stats.byEventType[webhook.eventType] || 0) + 1;

      // Calculate processing time for completed webhooks
      if (webhook.processedAt && webhook.status === "processed") {
        const processingTime = webhook.processedAt - webhook.createdAt;
        totalProcessingTime += processingTime;
        processedCount++;
      }
    }

    stats.avgProcessingTime = processedCount > 0 ? totalProcessingTime / processedCount : 0;

    return stats;
  },
});

/**
 * Get failed webhooks for debugging
 */
export const getFailedWebhooks = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const query = ctx.db
      .query("webhooks")
      .withIndex("by_status", (q) => q.eq("status", "failed"))
      .order("desc");

    return args.limit ? await query.take(args.limit) : await query.collect();
  },
});

/**
 * Retry failed webhook processing (admin function)
 */
export const retryFailedWebhook = internalMutation({
  args: { webhookId: v.id("webhooks") },
  handler: async (ctx, args) => {
    const webhook = await ctx.db.get(args.webhookId);
    if (!webhook || webhook.status !== "failed") {
      return false;
    }

    // Reset webhook status and schedule retry
    await ctx.db.patch(webhook._id, {
      status: "pending",
      attempts: 0,
    });

    await ctx.scheduler.runAfter(0, internal.webhooks.processWebhook, {
      webhookId: webhook._id,
    });

    return true;
  },
});
