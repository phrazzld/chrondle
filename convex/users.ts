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

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId,
      email,
      isPremium: false,
      currentStreak: 0,
      bestStreak: 0,
      totalCompleted: 0,
      joinedAt: Date.now(),
    });

    return userId;
  },
});

// Public user creation for webhooks
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

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId,
      email,
      isPremium: false,
      currentStreak: 0,
      bestStreak: 0,
      totalCompleted: 0,
      joinedAt: Date.now(),
    });

    return userId;
  },
});

// Get user statistics
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

    // Get user's game history
    const games = await ctx.db
      .query("userGames")
      .withIndex("by_user", (q) => q.eq("userId", user._id.toString()))
      .collect();

    return {
      ...user,
      gamesPlayed: games.length,
      gamesCompleted: games.filter((g) => g.completed).length,
      recentGames: games.slice(-10).reverse(),
    };
  },
});

// Update user's streak
export const updateUserStreak = mutation({
  args: {
    completed: v.boolean(),
  },
  handler: async (ctx, { completed }) => {
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

    // Get yesterday's date
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];

    // Check if user played yesterday
    const yesterdayGame = await ctx.db
      .query("userGames")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", user._id.toString()).eq("date", yesterday),
      )
      .first();

    let newStreak = user.currentStreak;
    let newBestStreak = user.bestStreak;
    let newTotalCompleted = user.totalCompleted;

    if (completed) {
      // If played yesterday, increment streak; otherwise reset to 1
      if (yesterdayGame && yesterdayGame.completed) {
        newStreak = user.currentStreak + 1;
      } else {
        newStreak = 1;
      }
      newTotalCompleted = user.totalCompleted + 1;
      newBestStreak = Math.max(newStreak, user.bestStreak);
    } else {
      // Failed today, reset streak
      newStreak = 0;
    }

    await ctx.db.patch(user._id, {
      currentStreak: newStreak,
      bestStreak: newBestStreak,
      totalCompleted: newTotalCompleted,
    });

    return {
      currentStreak: newStreak,
      bestStreak: newBestStreak,
      totalCompleted: newTotalCompleted,
    };
  },
});

// Check if user is premium
export const checkPremiumStatus = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { isPremium: false };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return { isPremium: false };
    }

    // Check if subscription is still valid
    if (user.isPremium && user.subscriptionEnd) {
      const isValid = user.subscriptionEnd > Date.now();
      if (!isValid) {
        // Subscription expired, return false
        // Note: We can't update in a query, need a separate mutation for cleanup
        return { isPremium: false, subscriptionExpired: true };
      }
    }

    return {
      isPremium: user.isPremium,
      subscriptionEnd: user.subscriptionEnd,
    };
  },
});

// Update user's premium status (called by Stripe webhook)
export const updatePremiumStatus = internalMutation({
  args: {
    clerkId: v.string(),
    isPremium: v.boolean(),
    subscriptionId: v.optional(v.string()),
    subscriptionEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      isPremium: args.isPremium,
      subscriptionId: args.subscriptionId,
      subscriptionEnd: args.subscriptionEnd,
    });
  },
});

// Clean up expired subscriptions
export const cleanupExpiredSubscription = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { success: false };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || !user.isPremium || !user.subscriptionEnd) {
      return { success: false };
    }

    // Check if subscription is expired
    if (user.subscriptionEnd <= Date.now()) {
      await ctx.db.patch(user._id, { isPremium: false });
      return { success: true };
    }

    return { success: false };
  },
});
