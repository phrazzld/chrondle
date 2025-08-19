import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useChrondle } from "../useChrondle";
import { FC, ReactNode } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { UserCreationProvider } from "@/components/UserCreationProvider";

// Mock Clerk
vi.mock("@clerk/nextjs", () => ({
  useUser: vi.fn(),
  useAuth: vi.fn(() => ({ isSignedIn: false })),
  ClerkProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

// Mock Convex
vi.mock("convex/react", async () => {
  const actual =
    await vi.importActual<typeof import("convex/react")>("convex/react");
  return {
    ...actual,
    useQuery: vi.fn(),
    useMutation: vi.fn(),
  };
});

// Mock UserCreationProvider
vi.mock("@/components/UserCreationProvider", async () => {
  const actual = await vi.importActual<
    typeof import("@/components/UserCreationProvider")
  >("@/components/UserCreationProvider");
  return {
    ...actual,
    useUserCreation: vi.fn(),
  };
});

import { useUser, useAuth } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { useUserCreation } from "@/components/UserCreationProvider";

describe("Authentication Flow Integration", () => {
  const mockClient = {} as ConvexReactClient;

  const wrapper: FC<{ children: ReactNode }> = ({ children }) => (
    <ConvexProvider client={mockClient}>
      <UserCreationProvider>{children}</UserCreationProvider>
    </ConvexProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock useMutation to return a function
    vi.mocked(useMutation).mockReturnValue(vi.fn());
    // Default auth state
    vi.mocked(useAuth).mockReturnValue({ isSignedIn: false });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should handle complete authentication flow with correct ID translation", async () => {
    const CLERK_ID = "user_2gFqK5X7B8hM9nL0P3rT6vY1dZ4w";
    const CONVEX_ID = "jh7k3n4m8p9q2r5s6t1u0v3w4x8y9z0a"; // 32-char alphanumeric

    // Step 1: Start with loading state
    vi.mocked(useUser).mockReturnValue({
      user: null,
      isLoaded: false,
      isSignedIn: false,
    });

    vi.mocked(useUserCreation).mockReturnValue({
      currentUser: null,
      userCreationLoading: false,
    });

    vi.mocked(useQuery).mockReturnValue(undefined); // Loading

    const { result, rerender } = renderHook(() => useChrondle(), { wrapper });

    // Should be in loading state initially
    expect(result.current.gameState.status).toBe("loading-auth");

    // Step 2: Clerk loads and user signs in
    vi.mocked(useUser).mockReturnValue({
      user: { id: CLERK_ID },
      isLoaded: true,
      isSignedIn: true,
    });

    vi.mocked(useAuth).mockReturnValue({ isSignedIn: true });

    // User creation in progress
    vi.mocked(useUserCreation).mockReturnValue({
      currentUser: null,
      userCreationLoading: true,
    });

    rerender();

    // Should still be loading while user creation happens
    expect(result.current.gameState.status).toBe("loading-auth");

    // Step 3: Convex user created with database ID
    vi.mocked(useUserCreation).mockReturnValue({
      currentUser: {
        _id: CONVEX_ID,
        clerkId: CLERK_ID,
        username: "testuser",
        createdAt: Date.now(),
      },
      userCreationLoading: false,
    });

    // Mock puzzle data loaded
    vi.mocked(useQuery).mockImplementation(
      (query: unknown, params: unknown) => {
        const q = query as { _name?: string };
        if (q._name === "puzzles:getDailyPuzzle") {
          return {
            _id: "puzzle123456789012345678901234",
            targetYear: 1969,
            events: ["Apollo 11 lands on the moon"],
            puzzleNumber: 1,
            createdAt: Date.now(),
          };
        }
        if (q._name === "puzzles:getUserPlay") {
          // Verify the correct Convex ID is being used
          if (params === "skip") return undefined;
          expect(params.userId).toBe(CONVEX_ID); // Should use Convex ID, not Clerk ID
          return null; // No progress yet
        }
        return undefined;
      },
    );

    rerender();

    await waitFor(() => {
      expect(result.current.gameState.status).toBe("ready");
    });

    // Verify the game state is properly initialized
    if (result.current.gameState.status === "ready") {
      expect(result.current.gameState.puzzle.targetYear).toBe(1969);
      expect(result.current.gameState.guesses).toEqual([]);
      expect(result.current.gameState.isComplete).toBe(false);
    }
  });

  it("should validate ID format and skip query with invalid IDs", async () => {
    const INVALID_CLERK_ID = "user_2gFqK5X7B8hM9nL0P3rT6vY1dZ4w"; // Not 32-char alphanumeric

    // Mock authenticated with Clerk ID (before translation)
    vi.mocked(useUser).mockReturnValue({
      user: { id: INVALID_CLERK_ID },
      isLoaded: true,
      isSignedIn: true,
    });

    vi.mocked(useAuth).mockReturnValue({ isSignedIn: true });

    // Mock user creation returns invalid ID (simulating error)
    vi.mocked(useUserCreation).mockReturnValue({
      currentUser: {
        _id: INVALID_CLERK_ID, // Wrong! Should be Convex ID
        clerkId: INVALID_CLERK_ID,
        username: "testuser",
        createdAt: Date.now(),
      },
      userCreationLoading: false,
    });

    let queryAttempted = false;
    vi.mocked(useQuery).mockImplementation(
      (query: unknown, params: unknown) => {
        if (query._name === "puzzles:getUserPlay" && params !== "skip") {
          queryAttempted = true; // Should not reach here
        }
        return undefined;
      },
    );

    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    renderHook(() => useChrondle(), { wrapper });

    // Query should be skipped due to invalid ID format
    expect(queryAttempted).toBe(false);

    // Should have logged warning about invalid ID
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("[useUserProgress] Invalid userId format"),
      expect.any(String),
      expect.any(String),
    );

    consoleSpy.mockRestore();
  });

  it("should handle race conditions during authentication transitions", async () => {
    const CLERK_ID = "user_abc123";
    const CONVEX_ID = "convexid123456789012345678901234";

    // Start signed out
    vi.mocked(useUser).mockReturnValue({
      user: null,
      isLoaded: true,
      isSignedIn: false,
    });

    vi.mocked(useUserCreation).mockReturnValue({
      currentUser: null,
      userCreationLoading: false,
    });

    const { result, rerender } = renderHook(() => useChrondle(), { wrapper });

    // Rapid sign in
    vi.mocked(useUser).mockReturnValue({
      user: { id: CLERK_ID },
      isLoaded: true,
      isSignedIn: true,
    });
    vi.mocked(useAuth).mockReturnValue({ isSignedIn: true });

    rerender();

    // Rapid sign out before Convex user created
    vi.mocked(useUser).mockReturnValue({
      user: null,
      isLoaded: true,
      isSignedIn: false,
    });
    vi.mocked(useAuth).mockReturnValue({ isSignedIn: false });

    rerender();

    // Should handle gracefully without errors
    expect(result.current.gameState.status).toBe("loading-puzzle");

    // Sign back in with Convex user ready
    vi.mocked(useUser).mockReturnValue({
      user: { id: CLERK_ID },
      isLoaded: true,
      isSignedIn: true,
    });
    vi.mocked(useAuth).mockReturnValue({ isSignedIn: true });

    vi.mocked(useUserCreation).mockReturnValue({
      currentUser: {
        _id: CONVEX_ID,
        clerkId: CLERK_ID,
        username: "testuser",
        createdAt: Date.now(),
      },
      userCreationLoading: false,
    });

    rerender();

    // Should recover and continue normally
    expect(["loading-puzzle", "loading-progress", "ready", "error"]).toContain(
      result.current.gameState.status,
    );
  });
});
