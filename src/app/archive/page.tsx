"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { TOTAL_PUZZLES, getPuzzleByIndex } from "@/lib/puzzleData";
import { isPuzzleCompleted } from "@/lib/storage";
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

function ArchivePageContent(): React.ReactElement {
  const [currentPage, setCurrentPage] = useState<number>(1);

  const PUZZLES_PER_PAGE = 24 as const;
  const totalPages = Math.ceil(TOTAL_PUZZLES / PUZZLES_PER_PAGE) as number;

  // Simple pagination - just slice indices
  const paginatedData = useMemo<PuzzleCardData[]>(() => {
    const startIndex = (currentPage - 1) * PUZZLES_PER_PAGE;
    const endIndex = Math.min(startIndex + PUZZLES_PER_PAGE, TOTAL_PUZZLES);

    const data: PuzzleCardData[] = [];

    for (let i = startIndex; i < endIndex; i++) {
      const puzzle = getPuzzleByIndex(i);
      if (puzzle) {
        data.push({
          index: i,
          puzzleNumber: i + 1, // 1-based for display
          firstHint: puzzle.events[0] || "Historical event puzzle",
          isCompleted: isPuzzleCompleted(puzzle.year),
        });
      }
    }

    return data;
  }, [currentPage]);

  // Calculate completed count efficiently
  const completedCount = useMemo(() => {
    let count = 0;
    for (let i = 0; i < TOTAL_PUZZLES; i++) {
      const puzzle = getPuzzleByIndex(i);
      if (puzzle && isPuzzleCompleted(puzzle.year)) {
        count++;
      }
    }
    return count;
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader onShowSettings={(): void => {}} currentStreak={0} />

      <main className="flex-grow max-w-2xl mx-auto w-full py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-2">
            Puzzle Archive
          </h1>
          <p className="text-muted-foreground text-lg">
            Explore and play past Chrondle puzzles
          </p>
        </div>

        {/* Completion Statistics */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-foreground font-medium">
              Completed: {completedCount} of {TOTAL_PUZZLES}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round((completedCount / TOTAL_PUZZLES) * 100)}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-green-600 h-full transition-all duration-300 ease-out"
              style={{
                width: `${(completedCount / TOTAL_PUZZLES) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Archive grid */}
        {paginatedData.length === 0 ? (
          // Loading skeleton cards
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(PUZZLES_PER_PAGE)].map((_, i) => (
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
                  key={puzzle.index}
                  href={`/archive/puzzle/${puzzle.index + 1}`}
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(): void =>
                    setCurrentPage(Math.max(1, currentPage - 1))
                  }
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <span className="text-sm text-muted-foreground px-4">
                  Page {currentPage} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={(): void =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function ArchivePage(): React.ReactElement {
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
        <ArchivePageContent />
      </React.Suspense>
    </ArchiveErrorBoundary>
  );
}
