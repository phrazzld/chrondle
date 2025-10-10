import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { isConsecutiveDay, getUTCDateString } from "./lib/streakCalculation";

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
    }

    return user;
  },
});

// Get or create current user (JIT user creation for authenticated users)
export const getOrCreateCurrentUser = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated - cannot create user without Clerk identity");
    }

    try {
      // Check if user already exists
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
        .first();

      if (existingUser) {
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

      return newUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
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
      const errorMessage = error instanceof Error ? error.message : String(error);
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
  handler: async (ctx, { userId, puzzleCompleted, guessCount, previousPuzzleDate }) => {
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
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

      if (previousPuzzleDate === yesterday) {
        // Continue streak
        updates.currentStreak = user.currentStreak + 1;
        updates.longestStreak = Math.max(user.currentStreak + 1, user.longestStreak);
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

// Merge anonymous game state when user authenticates
export const mergeAnonymousState = mutation({
  args: {
    puzzleId: v.id("puzzles"),
    guesses: v.array(v.number()),
    isComplete: v.boolean(),
    hasWon: v.boolean(),
  },
  handler: async (ctx, { puzzleId, guesses, isComplete, hasWon }) => {
    // Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated - cannot merge anonymous state");
    }

    // Get the current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found - cannot merge anonymous state");
    }

    // Don't process empty game state
    if (!guesses || guesses.length === 0) {
      return { success: true, message: "No anonymous state to merge" };
    }

    try {
      // Check if user already has a play record for this puzzle
      const existingPlay = await ctx.db
        .query("plays")
        .withIndex("by_user_puzzle", (q) => q.eq("userId", user._id).eq("puzzleId", puzzleId))
        .first();

      if (existingPlay) {
        // User already played this puzzle - merge guesses if anonymous had more progress
        if (guesses.length > existingPlay.guesses.length) {
          // Anonymous user made more progress, update with their guesses
          await ctx.db.patch(existingPlay._id, {
            guesses: guesses,
            completedAt: isComplete && hasWon ? Date.now() : existingPlay.completedAt,
            updatedAt: Date.now(),
          });
        }
        // Otherwise keep existing authenticated progress
      } else {
        // Create new play record from anonymous state
        await ctx.db.insert("plays", {
          userId: user._id,
          puzzleId: puzzleId,
          guesses: guesses,
          completedAt: isComplete && hasWon ? Date.now() : undefined,
          updatedAt: Date.now(),
        });

        // Update user stats if this was a completed puzzle
        if (isComplete && hasWon) {
          const updates: Partial<{
            totalPlays: number;
            perfectGames: number;
            updatedAt: number;
          }> = {
            totalPlays: user.totalPlays + 1,
            updatedAt: Date.now(),
          };

          // Check if it was a perfect game (1 guess)
          if (guesses.length === 1) {
            updates.perfectGames = user.perfectGames + 1;
          }

          await ctx.db.patch(user._id, updates);
        }
      }

      return {
        success: true,
        message: existingPlay
          ? "Anonymous state merged with existing progress"
          : "Anonymous state migrated to account",
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("[mergeAnonymousState] Failed to merge anonymous state:", {
        error: errorMessage,
        userId: user._id,
        puzzleId,
        guessCount: guesses.length,
        timestamp: new Date().toISOString(),
      });

      // Don't throw - we don't want to break the auth flow
      // Just log the error and return success
      return {
        success: false,
        message: `Failed to merge anonymous state: ${errorMessage}`,
      };
    }
  },
});

/**
 * Validation result for anonymous streak data
 */
interface StreakValidationResult {
  isValid: boolean;
  reason?: string;
}

/**
 * Validate anonymous streak data to prevent client-side manipulation
 *
 * Anonymous streak data comes from localStorage and is UNTRUSTED.
 * This function ensures the data is plausible and prevents users from
 * arbitrarily inflating their streaks by calling the mutation directly.
 *
 * Validation Rules:
 * 1. Date format must be valid ISO YYYY-MM-DD
 * 2. Date must not be in the future
 * 3. Date must not be too old (>90 days is suspicious)
 * 4. Streak count must be positive
 * 5. Streak count must not exceed maximum cap (365 days)
 * 6. Streak length must be consistent with date range
 *
 * @param streakCount - Claimed streak length
 * @param lastCompletedDate - Claimed last completion date
 * @returns Validation result with isValid flag and optional reason
 */
function validateAnonymousStreak(
  streakCount: number,
  lastCompletedDate: string,
): StreakValidationResult {
  // Rule 1: Validate date format
  const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoDatePattern.test(lastCompletedDate)) {
    return {
      isValid: false,
      reason: "Invalid date format (expected YYYY-MM-DD)",
    };
  }

  // Verify it's a real date (not 2024-13-45)
  const lastDate = new Date(lastCompletedDate + "T00:00:00.000Z");
  if (isNaN(lastDate.getTime())) {
    return {
      isValid: false,
      reason: "Invalid date value",
    };
  }

  // Ensure date roundtrips correctly (catches edge cases)
  if (getUTCDateString(lastDate) !== lastCompletedDate) {
    return {
      isValid: false,
      reason: "Date does not roundtrip correctly",
    };
  }

  // Rule 2: Date must not be in the future
  const now = new Date();
  const today = getUTCDateString(now);
  if (lastCompletedDate > today) {
    return {
      isValid: false,
      reason: "Date cannot be in the future",
    };
  }

  // Rule 3: Date must not be too old (90 days is generous limit)
  const ninetyDaysAgo = new Date(now);
  ninetyDaysAgo.setUTCDate(ninetyDaysAgo.getUTCDate() - 90);
  const ninetyDaysAgoString = getUTCDateString(ninetyDaysAgo);
  if (lastCompletedDate < ninetyDaysAgoString) {
    return {
      isValid: false,
      reason: "Date is too old (>90 days)",
    };
  }

  // Rule 4: Streak count must be positive
  if (streakCount < 0) {
    return {
      isValid: false,
      reason: "Streak count cannot be negative",
    };
  }

  // Rule 5: Maximum streak cap (365 days = 1 year)
  const MAX_ANONYMOUS_STREAK = 365;
  if (streakCount > MAX_ANONYMOUS_STREAK) {
    return {
      isValid: false,
      reason: `Streak count exceeds maximum (${MAX_ANONYMOUS_STREAK} days)`,
    };
  }

  // Rule 6: Streak length must be consistent with date range
  // If user claims N-day streak ending on lastDate, the first day should be N-1 days before
  // We can't verify the exact days, but we can ensure it's plausible
  if (streakCount > 0) {
    const firstDay = new Date(lastDate);
    firstDay.setUTCDate(firstDay.getUTCDate() - (streakCount - 1));
    const firstDayString = getUTCDateString(firstDay);

    // First day must be within our 90-day window
    if (firstDayString < ninetyDaysAgoString) {
      return {
        isValid: false,
        reason: "Streak extends beyond plausible date range",
      };
    }
  }

  return { isValid: true };
}

/**
 * Calculate the first day of a streak given its last day and length
 *
 * When an anonymous user builds a multi-day streak, we only store the
 * last completion date and streak count. To determine if this streak
 * is consecutive with a server streak, we need to calculate when the
 * anonymous streak STARTED.
 *
 * @param lastDate - Last day of streak (ISO YYYY-MM-DD)
 * @param streakLength - Number of consecutive days
 * @returns First day of streak (ISO YYYY-MM-DD)
 *
 * @example
 * getStreakFirstDay("2025-10-13", 3) → "2025-10-11"
 * getStreakFirstDay("2025-10-13", 1) → "2025-10-13"
 */
function getStreakFirstDay(lastDate: string, streakLength: number): string {
  if (streakLength <= 0) return lastDate;

  const date = new Date(lastDate + "T00:00:00.000Z");
  date.setUTCDate(date.getUTCDate() - (streakLength - 1));
  return getUTCDateString(date);
}

// Merge anonymous streak data when user signs in
export const mergeAnonymousStreak = mutation({
  args: {
    anonymousStreak: v.number(),
    anonymousLastCompletedDate: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated - cannot merge anonymous streak");
    }

    // Get or create the current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found - cannot merge anonymous streak");
    }

    // Don't process if anonymous streak is 0 or invalid
    if (args.anonymousStreak === 0 || !args.anonymousLastCompletedDate) {
      return {
        mergedStreak: user.currentStreak,
        source: "server" as const,
        message: "No anonymous streak to merge",
      };
    }

    // CRITICAL SECURITY: Validate anonymous streak data
    // Anonymous data comes from client-side localStorage and is UNTRUSTED
    // Users could manipulate this data or call this mutation directly with fake values
    const validation = validateAnonymousStreak(
      args.anonymousStreak,
      args.anonymousLastCompletedDate,
    );

    if (!validation.isValid) {
      console.warn("[mergeAnonymousStreak] Invalid anonymous streak data:", {
        reason: validation.reason,
        userId: user._id,
        clerkId: identity.subject,
        anonymousStreak: args.anonymousStreak,
        anonymousLastCompletedDate: args.anonymousLastCompletedDate,
        timestamp: new Date().toISOString(),
      });

      return {
        mergedStreak: user.currentStreak,
        source: "server" as const,
        message: `Invalid anonymous data: ${validation.reason}`,
      };
    }

    try {
      // Calculate first day of anonymous streak to properly check for consecutive days
      // Example: If anonymous has 3-day streak ending Oct 13, it started Oct 11
      const anonymousFirstDay =
        args.anonymousStreak > 0
          ? getStreakFirstDay(args.anonymousLastCompletedDate, args.anonymousStreak)
          : args.anonymousLastCompletedDate;

      // Check if streaks can be combined (consecutive days)
      // We compare server's LAST day with anonymous FIRST day
      // This handles multi-day anonymous streaks correctly
      const canCombine =
        user.lastCompletedDate &&
        args.anonymousLastCompletedDate &&
        isConsecutiveDay(user.lastCompletedDate, anonymousFirstDay);

      let mergedStreak: number;
      let mergedDate: string;
      let source: "anonymous" | "server" | "combined";

      if (canCombine) {
        // Streaks are consecutive - combine them
        mergedStreak = user.currentStreak + args.anonymousStreak;
        // Use most recent date (whichever is later)
        mergedDate =
          user.lastCompletedDate && user.lastCompletedDate > args.anonymousLastCompletedDate
            ? user.lastCompletedDate
            : args.anonymousLastCompletedDate;
        source = "combined";
      } else {
        // Streaks are not consecutive - pick the better one
        mergedStreak = Math.max(user.currentStreak, args.anonymousStreak);

        // Decision logic: prefer longer streak, use recency as tiebreaker
        if (args.anonymousStreak > user.currentStreak) {
          // Anonymous streak is longer - use its data
          mergedDate = args.anonymousLastCompletedDate;
          source = "anonymous";
        } else if (args.anonymousStreak < user.currentStreak) {
          // Server streak is longer - use its data
          mergedDate = user.lastCompletedDate || args.anonymousLastCompletedDate;
          source = "server";
        } else {
          // Streaks are equal length - use more recent date as tiebreaker
          // This preserves freshness and avoids next-day gap bugs
          if (args.anonymousLastCompletedDate > (user.lastCompletedDate || "")) {
            mergedDate = args.anonymousLastCompletedDate;
            source = "anonymous";
          } else {
            mergedDate = user.lastCompletedDate || args.anonymousLastCompletedDate;
            source = "server";
          }
        }
      }

      // Update user record with merged streak
      await ctx.db.patch(user._id, {
        currentStreak: mergedStreak,
        longestStreak: Math.max(mergedStreak, user.longestStreak),
        lastCompletedDate: mergedDate,
        updatedAt: Date.now(),
      });

      return {
        mergedStreak,
        source,
        message: `Streak merged successfully (${source})`,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("[mergeAnonymousStreak] Failed to merge streaks:", {
        error: errorMessage,
        userId: user._id,
        anonymousStreak: args.anonymousStreak,
        serverStreak: user.currentStreak,
        timestamp: new Date().toISOString(),
      });

      // Don't throw - return error info but don't break auth flow
      return {
        mergedStreak: user.currentStreak,
        source: "server" as const,
        message: `Failed to merge: ${errorMessage}`,
      };
    }
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
          ? Math.round((plays.filter((p) => p.completedAt).length / user.totalPlays) * 100)
          : 0,
    };
  },
});
