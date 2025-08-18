"use client";

import { useMemo, useRef } from "react";
import { useUser } from "@clerk/nextjs";

/**
 * Return type for the useAuthState hook
 */
interface UseAuthStateReturn {
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Hook to provide stable authentication state from Clerk
 *
 * This hook wraps Clerk's useUser with a stable state shape that prevents
 * unnecessary re-renders. It's completely orthogonal - focused solely on
 * authentication state without any knowledge of other app concerns.
 *
 * @returns Object containing user ID, authentication status, and loading state
 *
 * @example
 * const { userId, isAuthenticated, isLoading } = useAuthState();
 *
 * if (isLoading) return <div>Loading auth...</div>;
 * if (isAuthenticated) return <div>Welcome user {userId}</div>;
 * return <div>Please sign in</div>;
 */
export function useAuthState(): UseAuthStateReturn {
  const { user, isLoaded, isSignedIn } = useUser();
  const prevStateRef = useRef<UseAuthStateReturn | null>(null);

  // Memoize the return value to ensure stable references
  return useMemo<UseAuthStateReturn>(() => {
    // Handle loading state - Clerk not yet loaded
    if (!isLoaded) {
      const result: UseAuthStateReturn = {
        userId: null,
        isAuthenticated: false,
        isLoading: true,
      };

      // Development-only debug logging for state transitions
      if (process.env.NODE_ENV === "development") {
        if (
          !prevStateRef.current ||
          prevStateRef.current.isLoading !== result.isLoading
        ) {
          // eslint-disable-next-line no-console
          console.log("[useAuthState] Auth loading...");
        }
      }

      prevStateRef.current = result;
      return result;
    }

    // Handle signed out state
    if (!isSignedIn || !user) {
      const result: UseAuthStateReturn = {
        userId: null,
        isAuthenticated: false,
        isLoading: false,
      };

      // Development-only debug logging for state transitions
      if (process.env.NODE_ENV === "development") {
        if (
          !prevStateRef.current ||
          prevStateRef.current.isAuthenticated !== result.isAuthenticated
        ) {
          // eslint-disable-next-line no-console
          console.log("[useAuthState] User signed out");
        }
      }

      prevStateRef.current = result;
      return result;
    }

    // Handle edge case: user exists but no ID (defensive programming)
    if (!user.id) {
      const result: UseAuthStateReturn = {
        userId: null,
        isAuthenticated: false,
        isLoading: false,
      };

      // Development-only debug logging for edge case
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[useAuthState] Edge case: User object exists but no ID found",
          { user },
        );
      }

      prevStateRef.current = result;
      return result;
    }

    // Handle authenticated state
    const result: UseAuthStateReturn = {
      userId: user.id,
      isAuthenticated: true,
      isLoading: false,
    };

    // Development-only debug logging for state transitions
    if (process.env.NODE_ENV === "development") {
      if (
        !prevStateRef.current ||
        prevStateRef.current.isAuthenticated !== result.isAuthenticated ||
        prevStateRef.current.userId !== result.userId
      ) {
        // eslint-disable-next-line no-console
        console.log("[useAuthState] User authenticated:", {
          userId: result.userId,
          previousState: prevStateRef.current,
        });
      }
    }

    prevStateRef.current = result;
    return result;
  }, [user, isLoaded, isSignedIn]);
}
