"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getPuzzleYears, getPuzzleForYear } from "@/lib/puzzleData";
import { isPuzzleCompleted } from "@/lib/storage";
import { sortEventsByRecognizability } from "@/lib/gameState";
import { AppHeader } from "@/components/AppHeader";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { ArchiveErrorBoundary } from "@/components/ArchiveErrorBoundary";
import { getPuzzleNumberForYear } from "@/lib/puzzleUtils";

interface PuzzleCardData {
  year: number;
  puzzleNumber: number;
  firstHint: string;
  isCompleted: boolean;
}

function ArchivePageContent() {
  const [puzzleYears, setPuzzleYears] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isComputing, setIsComputing] = useState(true);

  const PUZZLES_PER_PAGE = 24;

  useEffect(() => {
    const years = getPuzzleYears();
    setPuzzleYears(years);
  }, []);

  // Pre-compute all puzzle card data ONCE
  const puzzleCardData = useMemo<PuzzleCardData[]>(() => {
    if (puzzleYears.length === 0) return [];

    try {
      const data = puzzleYears.map((year) => {
        try {
          const events = getPuzzleForYear(year);
          const sortedEvents =
            events.length > 0 ? sortEventsByRecognizability(events) : [];

          return {
            year,
            puzzleNumber: getPuzzleNumberForYear(year) || 0,
            firstHint: sortedEvents[0] || "Historical event puzzle",
            isCompleted: isPuzzleCompleted(year),
          };
        } catch {
          // Silently handle individual puzzle errors
          return {
            year,
            puzzleNumber: getPuzzleNumberForYear(year) || 0,
            firstHint: "Historical event puzzle",
            isCompleted: false,
          };
        }
      });

      return data;
    } catch (error) {
      console.error("Failed to compute puzzle data:", error);
      return [];
    }
  }, [puzzleYears]);

  // Update computing state based on data availability
  useEffect(() => {
    setIsComputing(puzzleYears.length > 0 && puzzleCardData.length === 0);
  }, [puzzleYears.length, puzzleCardData.length]);

  // Calculate completed count from pre-computed data
  const completedCount = useMemo(
    () => puzzleCardData.filter((puzzle) => puzzle.isCompleted).length,
    [puzzleCardData],
  );

  // Paginate the results
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * PUZZLES_PER_PAGE;
    return puzzleCardData.slice(startIndex, startIndex + PUZZLES_PER_PAGE);
  }, [puzzleCardData, currentPage]);

  // Calculate total pages
  const totalPages = Math.ceil(puzzleCardData.length / PUZZLES_PER_PAGE);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader onShowSettings={() => {}} currentStreak={0} />

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
        {puzzleCardData.length > 0 && !isComputing && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-foreground font-medium">
                Completed: {completedCount} of {puzzleCardData.length}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round((completedCount / puzzleCardData.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-green-600 h-full transition-all duration-300 ease-out"
                style={{
                  width: `${(completedCount / puzzleCardData.length) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Archive grid */}
        {isComputing || puzzleYears.length === 0 ? (
          // Loading skeleton cards
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(PUZZLES_PER_PAGE)].map((_, i) => (
              <Card
                key={i}
                className="min-h-[8rem] p-4 animate-pulse flex flex-col gap-2"
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
            {/* Actual archive grid with pre-computed data */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedData.map((puzzle) => (
                <Link key={puzzle.year} href={`/archive/${puzzle.year}`}>
                  <Card
                    className={`min-h-[8rem] p-4 flex flex-col gap-2 transition-all hover:shadow-md cursor-pointer ${
                      puzzle.isCompleted
                        ? "border-green-600/30 hover:border-green-600/50 bg-green-600/5"
                        : "hover:border-primary"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-mono text-muted-foreground">
                        #{puzzle.puzzleNumber}
                      </span>
                      {puzzle.isCompleted && (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                    </div>

                    <p className="flex-1 text-sm line-clamp-3 text-foreground">
                      {puzzle.firstHint}
                    </p>

                    <div className="text-xs text-muted-foreground mt-auto pt-2">
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
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                  onClick={() =>
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

export default function ArchivePage() {
  return (
    <ArchiveErrorBoundary>
      <ArchivePageContent />
    </ArchiveErrorBoundary>
  );
}
