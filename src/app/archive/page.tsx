"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getPuzzleYears, getPuzzleForYear } from "@/lib/puzzleData";
import { isPuzzleCompleted } from "@/lib/storage";
import { sortEventsByRecognizability } from "@/lib/gameState";
import { AppHeader } from "@/components/AppHeader";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Check } from "lucide-react";
import { ArchiveErrorBoundary } from "@/components/ArchiveErrorBoundary";
import { getPuzzleNumberForYear } from "@/lib/puzzleUtils";

function ArchivePageContent() {
  const [puzzleYears, setPuzzleYears] = useState<number[]>([]);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const years = getPuzzleYears();
    setPuzzleYears(years);

    // Calculate completed puzzles
    const completed = years.filter(isPuzzleCompleted).length;
    setCompletedCount(completed);
  }, []);

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
        {puzzleYears.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-foreground font-medium">
                Completed: {completedCount} of {puzzleYears.length}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round((completedCount / puzzleYears.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-green-600 h-full transition-all duration-300 ease-out"
                style={{
                  width: `${(completedCount / puzzleYears.length) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Archive grid */}
        {puzzleYears.length === 0 ? (
          // Loading skeleton cards
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(12)].map((_, i) => (
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
          // Actual archive grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {puzzleYears.map((year) => {
              const isCompleted = isPuzzleCompleted(year);
              const puzzleNumber = getPuzzleNumberForYear(year);

              // Get the first hint for this puzzle
              const events = getPuzzleForYear(year);
              const sortedEvents =
                events.length > 0 ? sortEventsByRecognizability(events) : [];
              const firstHint = sortedEvents[0] || "Historical event puzzle";

              return (
                <Link key={year} href={`/archive/${year}`}>
                  <Card
                    className={`min-h-[8rem] p-4 flex flex-col gap-2 transition-all hover:shadow-md cursor-pointer ${
                      isCompleted
                        ? "border-green-600/30 hover:border-green-600/50 bg-green-600/5"
                        : "hover:border-primary"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-mono text-muted-foreground">
                        #{puzzleNumber}
                      </span>
                      {isCompleted && (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                    </div>

                    <p className="flex-1 text-sm line-clamp-3 text-foreground">
                      {firstHint}
                    </p>

                    <div className="text-xs text-muted-foreground mt-auto pt-2">
                      Play puzzle →
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
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
