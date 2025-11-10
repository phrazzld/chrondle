// Server component for the Order mode.

import { preloadQuery } from "convex/nextjs";
import { api } from "../../../convex/_generated/api";
import { OrderGameIsland } from "@/components/order/OrderGameIsland";
import { logger } from "@/lib/logger";

export default async function OrderPage() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!convexUrl) {
    throw new Error(
      "NEXT_PUBLIC_CONVEX_URL is not configured. Set it in .env.local (or Vercel env vars) and restart the dev server.",
    );
  }

  try {
    const preloadedPuzzle = await preloadQuery(api.orderPuzzles.getDailyOrderPuzzle);
    return <OrderGameIsland preloadedPuzzle={preloadedPuzzle} />;
  } catch (error) {
    logger.error("Failed to preload Order puzzle from Convex", error);
    throw new Error(
      "Unable to load Order puzzle. Ensure `npx convex dev` is running (use `pnpm dev:full`) or that NEXT_PUBLIC_CONVEX_URL points to a reachable Convex deployment.",
    );
  }
}
