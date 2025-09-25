"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { AnimationToggle } from "@/components/ui/AnimationToggle";
import { AuthButtons } from "@/components/AuthButtons";
import BitcoinModal from "@/components/BitcoinModal";
import { Flame, Archive, Heart } from "lucide-react";
import { getStreakColorClasses, cn } from "@/lib/utils";
import { formatPuzzleNumber } from "@/lib/puzzleUtils";

interface AppHeaderProps {
  currentStreak?: number;
  isDebugMode?: boolean;
  puzzleNumber?: number;
  isArchive?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentStreak,
  isDebugMode = false,
  puzzleNumber,
  isArchive = false,
}) => {
  const [showBitcoin, setShowBitcoin] = useState(false);
  const [animateStreak, setAnimateStreak] = useState(false);
  const [milestonePulse, setMilestonePulse] = useState(false);
  const previousStreakRef = useRef(currentStreak);
  const streakColors = currentStreak ? getStreakColorClasses(currentStreak) : null;

  // Define milestone thresholds
  const milestones = [7, 30, 100];
  const majorMilestones = [30, 100]; // Major milestones get gold pulse

  // Detect streak increment and trigger animations
  useEffect(() => {
    if (currentStreak !== undefined && previousStreakRef.current !== undefined) {
      // Check if streak increased
      if (currentStreak > previousStreakRef.current) {
        setAnimateStreak(true);

        // Check if we hit a milestone
        if (milestones.includes(currentStreak)) {
          setMilestonePulse(true);
        }

        // Remove animation classes after animations complete
        const streakTimer = setTimeout(() => {
          setAnimateStreak(false);
        }, 600); // Match number roll duration

        const milestoneTimer = setTimeout(() => {
          setMilestonePulse(false);
        }, 3600); // 3 pulses at 1.2s each

        // Clean up timers
        return () => {
          clearTimeout(streakTimer);
          clearTimeout(milestoneTimer);
        };
      }
    }

    // Update previous streak for next comparison
    previousStreakRef.current = currentStreak;
  }, [currentStreak, milestones]);
  return (
    <header id="navigation" className="border-border bg-card w-full border-b py-4" tabIndex={-1}>
      <div className="mx-auto max-w-2xl px-6 sm:px-0">
        <div className="flex min-h-[40px] items-center justify-between">
          {/* Logo/Brand - Clean and uncluttered */}
          <Link href="/" className="flex h-10 items-baseline">
            <h1 className="font-heading text-primary m-0 flex cursor-pointer items-baseline text-2xl font-bold transition-opacity hover:opacity-80 md:text-3xl">
              <span className="flex h-10 w-10 items-center justify-center sm:hidden">C</span>
              <span className="hidden sm:inline">CHRONDLE</span>
              {puzzleNumber && (
                <span
                  className={cn(
                    "ml-2 font-mono text-xs",
                    isArchive ? "text-muted-foreground italic" : "text-foreground/70",
                  )}
                >
                  {formatPuzzleNumber(puzzleNumber)}
                </span>
              )}
              {isDebugMode && (
                <span
                  className="mb-1 ml-2 h-2 w-2 rounded-full bg-orange-600 opacity-75"
                  title="Debug mode active"
                  aria-label="Debug mode indicator"
                />
              )}
            </h1>
          </Link>

          {/* Action Buttons with Streak Counter */}
          <div className="flex h-10 items-center gap-3">
            {/* Streak Counter - Horizontal Badge */}
            {currentStreak !== undefined && currentStreak > 0 && streakColors && (
              <div
                className={`flex items-center gap-2 rounded-full border px-3 py-2 ${streakColors.borderColor} h-10 shadow-sm ${
                  milestonePulse
                    ? currentStreak && majorMilestones.includes(currentStreak)
                      ? "animate-milestone-pulse-gold"
                      : "animate-milestone-pulse"
                    : ""
                }`}
                title={streakColors.milestone || `${currentStreak} day streak`}
                aria-label={`Current streak: ${currentStreak} day streak`}
              >
                <Flame
                  className={`h-4 w-4 ${streakColors.textColor} ${
                    currentStreak >= 30
                      ? "animate-flame-hot"
                      : currentStreak >= 7
                        ? "animate-flame-flicker"
                        : "animate-flame-mild"
                  }`}
                />
                <span
                  className={`font-accent text-sm font-bold ${streakColors.textColor} whitespace-nowrap`}
                >
                  <span className="hidden sm:inline">
                    <span className={animateStreak ? "animate-number-roll" : ""}>
                      {currentStreak}
                    </span>{" "}
                    day streak
                  </span>
                  <span className={`sm:hidden ${animateStreak ? "animate-number-roll" : ""}`}>
                    {currentStreak}
                  </span>
                </span>
              </div>
            )}

            {/* Support Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowBitcoin(true)}
              title="Support Chrondle"
              aria-label="Support Chrondle with donations"
              className="group rounded-full transition-transform"
            >
              <Heart className="group-hover:animate-heartbeat h-5 w-5" />
            </Button>

            {/* Archive Button */}
            <Button
              variant="ghost"
              size="icon"
              asChild
              title="Browse puzzle archive"
              aria-label="Browse puzzle archive"
              className="rounded-full"
            >
              <Link href="/archive">
                <Archive className="h-5 w-5" />
              </Link>
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Animation Toggle */}
            <AnimationToggle />

            {/* Auth Buttons - Rightmost */}
            <AuthButtons />
          </div>
        </div>
      </div>

      <BitcoinModal open={showBitcoin} onOpenChange={setShowBitcoin} />
    </header>
  );
};
