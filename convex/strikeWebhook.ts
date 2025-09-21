import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { z } from "zod";
import { StrikeClient } from "../lib/strike-client";

// Strike webhook event schema
const StrikeWebhookEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({
    entityId: z.string(),
    changes: z.array(z.string()).optional(),
  }),
  eventTime: z.string(),
});

/**
 * Strike webhook handler
 * Verifies signature, checks idempotency, and queues for processing
 */
export const strikeWebhook = httpAction(async (ctx, request) => {
  try {
    // 1. Extract raw body before parsing (required for signature verification)
    const rawBody = await request.text();

    // 2. Get signature from headers
    const signature = request.headers.get("X-Webhook-Signature");

    // 3. Get Strike API key and webhook secret from environment
    const apiKey = process.env.STRIKE_API_KEY;
    const webhookSecret = process.env.STRIKE_WEBHOOK_SECRET;

    if (!apiKey || !webhookSecret) {
      console.error("Strike API credentials not configured");
      return new Response("Internal server error", { status: 500 });
    }

    // 4. Verify signature using StrikeClient
    const strikeClient = new StrikeClient(apiKey, webhookSecret);
    const isValidSignature = await strikeClient.verifyWebhookSignature(rawBody, signature || "");

    if (!isValidSignature) {
      console.error("Invalid Strike webhook signature");
      return new Response("Unauthorized", { status: 401 });
    }

    // 5. Parse and validate event
    let event;
    try {
      event = StrikeWebhookEventSchema.parse(JSON.parse(rawBody));
    } catch (parseError) {
      console.error("Invalid Strike webhook payload:", parseError);
      return new Response("Bad request", { status: 400 });
    }

    // 6. Check for duplicate events (idempotency)
    const existingWebhook = await ctx.runQuery(internal.webhooks.getByEventId, {
      eventId: event.id,
    });

    if (existingWebhook) {
      // Webhook already processed - this is normal with retries
      return new Response("Already processed", { status: 200 });
    }

    // 7. Store webhook for async processing
    await ctx.runMutation(internal.webhooks.enqueue, {
      eventId: event.id,
      eventType: event.type,
      entityId: event.data.entityId,
      payload: rawBody,
      signature: signature || "",
    });

    // 8. Return success immediately (Strike expects quick response)
    return new Response("Accepted", { status: 200 });
  } catch (error) {
    console.error("Error processing Strike webhook:", error);
    return new Response("Internal server error", { status: 500 });
  }
});
