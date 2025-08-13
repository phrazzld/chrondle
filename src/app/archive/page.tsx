import React from "react";
import Link from "next/link";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import { currentUser } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { AppHeader } from "@/components/AppHeader";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { ArchiveErrorBoundary } from "@/components/ArchiveErrorBoundary";

interface PuzzleCardData {
  index: number;
  puzzleNumber: number;
  firstHint: string;
  isCompleted: boolean;
}

interface ArchivePageProps {
  searchParams: Promise<{ page?: string }>;
}

async function ArchivePageContent({
  searchParams,
}: ArchivePageProps): Promise<React.ReactElement> {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const PUZZLES_PER_PAGE = 24 as const;

  // Runtime environment detection for debugging
  const environment = process.env.VERCEL_ENV || "local";
  // eslint-disable-next-line no-console
  console.log(`[Archive] Running in: ${environment}`);

  // Initialize Convex client
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL environment variable is not set");
  }
  const client = new ConvexHttpClient(convexUrl);

  // Performance timing
  // eslint-disable-next-line no-console
  console.time("[Archive] Auth check");

  // Request context validation
  let hasRequestContext = false;
  try {
    const headersList = await headers();
    const cookies = headersList.get("cookie");
    hasRequestContext = !!cookies;
    // eslint-disable-next-line no-console
    console.log("[Archive] Request context:", {
      hasCookies: hasRequestContext,
    });
  } catch (error) {
    console.warn("[Archive] Headers not available (SSG/ISR context):", error);
  }

  // Get current user from Clerk - comprehensive error handling
  let clerkUser = null;
  try {
    // TEST: Force error before auth call
    // throw new Error("TEST: Forced error before auth");

    // Skip auth if no request context (SSG/ISR)
    if (!hasRequestContext) {
      // eslint-disable-next-line no-console
      console.log("[Archive] Skipping auth - no request context");
    } else {
      clerkUser = await currentUser();
      // eslint-disable-next-line no-console
      console.log("[Archive] Clerk auth successful:", {
        userId: clerkUser?.id,
      });
    }
  } catch (error) {
    // Comprehensive error logging for production debugging
    console.error("[Archive] Clerk auth failed:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      environment,
      hasRequestContext,
    });
    // Explicitly set to null on ANY error
    clerkUser = null;
    // Archive is publicly accessible, continue without auth
  }

  // eslint-disable-next-line no-console
  console.timeEnd("[Archive] Auth check");

  // Fetch user data and completed puzzles if authenticated
  // eslint-disable-next-line no-console
  console.time("[Archive] Convex queries");
  let convexUser = null;
  let completedPuzzleIds = new Set<string>();

  if (clerkUser) {
    // Get the Convex user by Clerk ID with defensive error handling
    try {
      convexUser = await client.query(api.users.getUserByClerkId, {
        clerkId: clerkUser.id,
      });
      // eslint-disable-next-line no-console
      console.log("[Archive] Convex user found:", { userId: convexUser?._id });
    } catch (error) {
      console.error("[Archive] getUserByClerkId failed:", error);
      // Continue with null user - don't cascade failure
      convexUser = null;
    }

    // Only fetch completed puzzles if we have a valid Convex user
    if (convexUser && convexUser._id) {
      try {
        // Get user's completed puzzles with error handling
        const completedPlays = await client.query(
          api.puzzles.getUserCompletedPuzzles,
          {
            userId: convexUser._id,
          },
        );
        // Create a set of completed puzzle IDs for quick lookup
        completedPuzzleIds = new Set(
          completedPlays.map((play) => play.puzzleId),
        );
        // eslint-disable-next-line no-console
        console.log("[Archive] Completed puzzles loaded:", {
          count: completedPuzzleIds.size,
        });
      } catch (error) {
        console.warn(
          "[Archive] Completed puzzles fetch failed, using empty set:",
          error,
        );
        // Fallback to empty set - user won't see completion status
        completedPuzzleIds = new Set();
      }
    }
  }
  // eslint-disable-next-line no-console
  console.timeEnd("[Archive] Convex queries");

  // Fetch archive puzzles from Convex with graceful degradation
  let archiveData: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    puzzles: any[]; // Will be properly typed from Convex
    totalPages: number;
    totalCount: number;
    currentPage: number;
  } = {
    puzzles: [],
    totalPages: 0,
    totalCount: 0,
    currentPage: 1,
  };

  try {
    archiveData = await client.query(api.puzzles.getArchivePuzzles, {
      page: currentPage,
      pageSize: PUZZLES_PER_PAGE,
    });
    // eslint-disable-next-line no-console
    console.log("[Archive] Puzzles loaded:", {
      count: archiveData.puzzles.length,
      totalCount: archiveData.totalCount,
      page: currentPage,
    });
  } catch (error) {
    console.error("[Archive] Failed to load puzzles:", error);
    // Return graceful fallback - archive temporarily unavailable
    // The UI will show appropriate message based on empty data
  }

  const { puzzles, totalPages, totalCount } = archiveData;

  // Transform Convex puzzles to PuzzleCardData format
  const paginatedData: PuzzleCardData[] = puzzles.map((puzzle) => ({
    index: puzzle.puzzleNumber - 1, // 0-based index for compatibility
    puzzleNumber: puzzle.puzzleNumber,
    firstHint: puzzle.events[0] || "Historical event puzzle",
    isCompleted: completedPuzzleIds.has(puzzle._id),
  }));

  // Calculate completed count
  const completedCount = completedPuzzleIds.size;

  // Auth state telemetry for debugging
  const authState = {
    hasClerkUser: !!clerkUser,
    hasConvexUser: !!convexUser,
    completedCount,
    totalCount,
    environment,
    timestamp: new Date().toISOString(),
  };
  // eslint-disable-next-line no-console
  console.log("[Archive] Auth state:", authState);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader currentStreak={0} />

      <main className="flex-grow max-w-2xl mx-auto w-full py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-2">
            Puzzle Archive
          </h1>
          <p className="text-muted-foreground text-lg">
            Explore and play past Chrondle puzzles
          </p>
        </div>

        {/* Completion Statistics - Show loading state or data */}
        {clerkUser && (
          <div className="mb-6" suppressHydrationWarning>
            {convexUser ? (
              // Show actual completion data
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-foreground font-medium">
                    Completed: {completedCount} of {totalCount}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {totalCount > 0
                      ? Math.round((completedCount / totalCount) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-green-600 h-full transition-all duration-300 ease-out"
                    style={{
                      width:
                        totalCount > 0
                          ? `${(completedCount / totalCount) * 100}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>
            ) : (
              // Show skeleton loader while user data loads
              <div className="animate-pulse">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-5 bg-muted rounded w-32" />
                  <div className="h-4 bg-muted rounded w-12" />
                </div>
                <div className="w-full bg-muted rounded-full h-2" />
              </div>
            )}
          </div>
        )}

        {/* Archive grid */}
        {archiveData.puzzles.length === 0 && totalCount === 0 ? (
          // Empty archive or connection issue
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {archiveData.currentPage === 1
                ? "Archive temporarily unavailable. Please try again later."
                : "No puzzles available yet. Check back tomorrow!"}
            </p>
          </div>
        ) : paginatedData.length === 0 ? (
          // Loading skeleton cards
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(Math.min(totalCount, PUZZLES_PER_PAGE))].map((_, i) => (
              <Card
                key={i}
                className="h-[10rem] p-4 animate-pulse flex flex-col gap-2"
              >
                <div className="h-5 bg-muted rounded w-12" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-4/5" />
                  <div className="h-3 bg-muted rounded w-3/5" />
                </div>
                <div className="h-3 bg-muted rounded w-20 mt-auto" />
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Actual archive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedData.map((puzzle) => (
                <Link
                  key={puzzle.puzzleNumber}
                  href={`/archive/puzzle/${puzzle.puzzleNumber}`}
                >
                  <Card
                    className={`h-[10rem] p-4 flex flex-col gap-2 transition-all hover:shadow-md cursor-pointer ${
                      puzzle.isCompleted
                        ? "border-green-600/30 hover:border-green-600/50 bg-green-600/5"
                        : "hover:border-primary"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-mono text-muted-foreground">
                        Puzzle #{puzzle.puzzleNumber}
                      </span>
                      {puzzle.isCompleted && (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                    </div>

                    <p className="flex-1 text-sm text-foreground overflow-hidden">
                      <span className="line-clamp-3">{puzzle.firstHint}</span>
                    </p>

                    <div className="text-xs text-muted-foreground mt-auto">
                      Play puzzle →
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {currentPage > 1 ? (
                  <Link href={`/archive?page=${currentPage - 1}`}>
                    <Button variant="outline" size="sm">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" size="sm" disabled>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                )}

                <span className="text-sm text-muted-foreground px-4">
                  Page {currentPage} of {totalPages}
                </span>

                {currentPage < totalPages ? (
                  <Link href={`/archive?page=${currentPage + 1}`}>
                    <Button variant="outline" size="sm">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" size="sm" disabled>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function ArchivePage({
  searchParams,
}: ArchivePageProps): React.ReactElement {
  return (
    <ArchiveErrorBoundary>
      <React.Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">
              Loading archive...
            </div>
          </div>
        }
      >
        <ArchivePageContent searchParams={searchParams} />
      </React.Suspense>
    </ArchiveErrorBoundary>
  );
}
