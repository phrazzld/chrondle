import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useUser } from "@clerk/nextjs";

export function useUserData() {
  const { isLoaded: clerkLoaded, isSignedIn } = useUser();

  // Get user stats from Convex
  const userStats = useQuery(
    api.users.getUserStats,
    isSignedIn ? {} : undefined,
  );

  // Premium status removed in new schema

  return {
    isLoading: !clerkLoaded || (isSignedIn && userStats === undefined),
    isSignedIn,
    userStats,
    isPremium: false, // Premium feature removed
    subscriptionEnd: undefined,
  };
}
