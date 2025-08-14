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

    // Add debug logging when user lookup returns null
    if (!user && identity.subject) {
      // console.log("[getCurrentUser] No user found for Clerk ID:", {
      //   clerkId: identity.subject,
      //   email: identity.email,
      //   timestamp: new Date().toISOString(),
      // });
    }

    return user;
  },
});

// Get or create current user (JIT user creation for authenticated users)
export const getOrCreateCurrentUser = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error(
        "Not authenticated - cannot create user without Clerk identity",
      );
    }

    try {
      // Check if user already exists
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
        .first();

      if (existingUser) {
        // console.log("[getOrCreateCurrentUser] Found existing user:", {
        //   userId: existingUser._id,
        //   clerkId: identity.subject,
        //   email: existingUser.email,
        //   timestamp: new Date().toISOString(),
        // });
        return existingUser;
      }

      // Create new user with comprehensive field mapping
      // Extract email with proper type handling
      let email = "";
      if (typeof identity.email === "string") {
        email = identity.email;
      } else {
        // Fallback to placeholder email using Clerk ID
        email = `${identity.subject}@placeholder.local`;
      }

      // Extract username with proper type handling
      let username: string | undefined = undefined;
      if (typeof identity.nickname === "string") {
        username = identity.nickname;
      } else if (typeof identity.firstName === "string") {
        username = identity.firstName;
      }

      // console.log("[getOrCreateCurrentUser] Creating new user:", {
      //   clerkId: identity.subject,
      //   email,
      //   username,
      //   hasEmail: typeof identity.email === "string",
      //   hasNickname: typeof identity.nickname === "string",
      //   hasFirstName: typeof identity.firstName === "string",
      //   timestamp: new Date().toISOString(),
      // });

      const userId = await ctx.db.insert("users", {
        clerkId: identity.subject,
        email,
        username,
        currentStreak: 0,
        longestStreak: 0,
        totalPlays: 0,
        perfectGames: 0,
        updatedAt: Date.now(),
      });

      // Retrieve and return the created user record
      const newUser = await ctx.db.get(userId);
      if (!newUser) {
        throw new Error("Failed to retrieve newly created user record");
      }

      // console.log("[getOrCreateCurrentUser] User created successfully:", {
      //   userId: newUser._id,
      //   clerkId: newUser.clerkId,
      //   email: newUser.email,
      //   username: newUser.username,
      //   timestamp: new Date().toISOString(),
      // });

      return newUser;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("[getOrCreateCurrentUser] Failed to create user:", {
        error: errorMessage,
        clerkId: identity.subject,
        email: identity.email,
        identityKeys: Object.keys(identity),
        timestamp: new Date().toISOString(),
      });

      // Re-throw error to prevent silent failures
      throw new Error(`User creation failed: ${errorMessage}`);
    }
  },
});

// Check if user exists (helper query for debugging and validation)
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
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        exists: false,
        error: errorMessage,
        clerkId: targetClerkId,
      };
    }
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
