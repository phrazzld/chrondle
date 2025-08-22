import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { api } from "convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

export async function POST(req: Request) {
  // Validate Convex URL configuration
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    console.error("NEXT_PUBLIC_CONVEX_URL is not configured");
    return new Response("Error: Server configuration issue", {
      status: 500,
    });
  }

  // Create Convex client inside the function to avoid build-time initialization
  const convexClient = new ConvexHttpClient(convexUrl);
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "");

  let evt: WebhookEvent;

  // Verify the webhook
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error: Webhook verification failed", {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses, primary_email_address_id } = evt.data;

    // Find the primary email
    const primaryEmail = email_addresses.find(
      (email) => email.id === primary_email_address_id,
    );

    if (!primaryEmail) {
      return new Response("Error: No primary email found", {
        status: 400,
      });
    }

    try {
      // Create or update user in Convex
      await convexClient.mutation(api.users.createUserFromWebhook, {
        clerkId: id,
        email: primaryEmail.email_address,
      });

      return new Response("User synced successfully", { status: 200 });
    } catch (error) {
      console.error("Error syncing user to Convex:", error);
      return new Response("Error: Failed to sync user", {
        status: 500,
      });
    }
  }

  return new Response("Webhook processed", { status: 200 });
}
