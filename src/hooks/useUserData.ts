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

  // Check premium status
  const premiumStatus = useQuery(
    api.users.checkPremiumStatus,
    isSignedIn ? {} : undefined,
  );

  return {
    isLoading:
      !clerkLoaded ||
      (isSignedIn && (userStats === undefined || premiumStatus === undefined)),
    isSignedIn,
    userStats,
    isPremium: premiumStatus?.isPremium || false,
    subscriptionEnd: premiumStatus?.subscriptionEnd,
  };
}
