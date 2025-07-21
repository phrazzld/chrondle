import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";

// Create a new user (called by Clerk webhook) - internal version
export const createUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
  },
  handler: async (ctx, { clerkId, email }) => {
    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", clerkId))
      .first();

    if (existing) {
      return existing._id;
    }

    // Create new user with schema-compliant fields
    const userId = await ctx.db.insert("users", {
      clerkId,
      email,
      username: undefined, // Optional, can be set later
      currentStreak: 0,
      longestStreak: 0,
      totalPlays: 0,
      perfectGames: 0,
      updatedAt: Date.now(),
    });

    return userId;
  },
});

// Public mutation for webhook to create user
export const createUserFromWebhook = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
  },
  handler: async (ctx, { clerkId, email }) => {
    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", clerkId))
      .first();

    if (existing) {
      return existing._id;
    }

    // Create new user with schema-compliant fields
    const userId = await ctx.db.insert("users", {
      clerkId,
      email,
      username: undefined, // Optional, can be set later
      currentStreak: 0,
      longestStreak: 0,
      totalPlays: 0,
      perfectGames: 0,
      updatedAt: Date.now(),
    });

    return userId;
  },
});

// Get current user
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

    return user;
  },
});

// Get user by clerk ID (for webhooks and internal use)
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

// Update username
export const updateUsername = mutation({
  args: {
    username: v.string(),
  },
  handler: async (ctx, { username }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      username,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Update user stats after completing a puzzle
export const updateUserStats = internalMutation({
  args: {
    userId: v.id("users"),
    puzzleCompleted: v.boolean(),
    guessCount: v.number(),
    previousPuzzleDate: v.optional(v.string()),
  },
  handler: async (
    ctx,
    { userId, puzzleCompleted, guessCount, previousPuzzleDate },
  ) => {
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const updates: Partial<{
      updatedAt: number;
      totalPlays: number;
      perfectGames: number;
      currentStreak: number;
      longestStreak: number;
    }> = {
      updatedAt: Date.now(),
    };

    if (puzzleCompleted) {
      // Increment total plays
      updates.totalPlays = user.totalPlays + 1;

      // Check if it was a perfect game (1 guess)
      if (guessCount === 1) {
        updates.perfectGames = user.perfectGames + 1;
      }

      // Update streak
      const yesterday = new Date(Date.now() - 86400000)
        .toISOString()
        .slice(0, 10);

      if (previousPuzzleDate === yesterday) {
        // Continue streak
        updates.currentStreak = user.currentStreak + 1;
        updates.longestStreak = Math.max(
          user.currentStreak + 1,
          user.longestStreak,
        );
      } else if (!previousPuzzleDate || previousPuzzleDate < yesterday) {
        // Start new streak
        updates.currentStreak = 1;
        updates.longestStreak = Math.max(1, user.longestStreak);
      }
      // If previousPuzzleDate is today, don't update streak (already played today)
    } else {
      // Failed puzzle breaks streak
      updates.currentStreak = 0;
    }

    await ctx.db.patch(userId, updates);

    return {
      currentStreak: updates.currentStreak ?? user.currentStreak,
      longestStreak: updates.longestStreak ?? user.longestStreak,
      totalPlays: updates.totalPlays ?? user.totalPlays,
      perfectGames: updates.perfectGames ?? user.perfectGames,
    };
  },
});

// Get user statistics with play history
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
          ? Math.round(
              (plays.filter((p) => p.completedAt).length / user.totalPlays) *
                100,
            )
          : 0,
    };
  },
});
