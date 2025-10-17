import { v } from "convex/values";
import { query } from "../_generated/server";

/**
 * User Queries - Read-Only User Access
 *
 * Module: Single responsibility - user data retrieval
 * Deep Module Value: Hides database query complexity behind simple interface
 *
 * Exports:
 * - getCurrentUser: Get authenticated user data
 * - getUserByClerkId: Get user by Clerk ID (for webhooks/internal use)
 * - userExists: Check if user exists by Clerk ID
 * - getUserStats: Get user statistics with recent play history
 *
 * Dependencies:
 * - Convex auth: getUserIdentity() for authentication
 * - Database: users and plays tables
 */

/**
 * Get current authenticated user
 *
 * Returns null if not authenticated or user not found.
 * Used by frontend to load user data on initial page load.
 */
export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .first();

    // Add debug logging when user lookup returns null
    if (!user && identity.subject) {
    }

    return user;
  },
});

/**
 * Get user by Clerk ID
 *
 * Used by webhooks and internal operations to find users.
 * Returns null if user not found.
 */
export const getUserByClerkId = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", clerkId))
      .first();

    return user;
  },
});

/**
 * Check if user exists
 *
 * Returns existence status with optional error details.
 * If no clerkId provided, checks current authenticated user.
 */
export const userExists = query({
  args: {
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, { clerkId }) => {
    let targetClerkId = clerkId;

    // If no clerkId provided, use current authenticated user's ID
    if (!targetClerkId) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          exists: false,
          error: "No clerkId provided and no authenticated user",
        };
      }
      targetClerkId = identity.subject;
    }

    try {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk", (q) => q.eq("clerkId", targetClerkId))
        .first();

      return {
        exists: !!user,
        userId: user?._id,
        clerkId: targetClerkId,
        email: user?.email,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        exists: false,
        error: errorMessage,
        clerkId: targetClerkId,
      };
    }
  },
});

/**
 * Get user statistics with recent play history
 *
 * Returns user data with:
 * - Recent plays (last 20)
 * - Completion rate calculation
 * - All user stats (streaks, totals)
 *
 * Returns null if not authenticated or user not found.
 */
export const getUserStats = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return null;
    }

    // Get user's play history
    const plays = await ctx.db
      .query("plays")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(20);

    return {
      ...user,
      recentPlays: plays,
      completionRate:
        user.totalPlays > 0
          ? Math.round((plays.filter((p) => p.completedAt).length / user.totalPlays) * 100)
          : 0,
    };
  },
});
