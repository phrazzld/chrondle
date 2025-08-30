"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { AuthButtons } from "@/components/AuthButtons";
import { Settings, Flame, Archive } from "lucide-react";
import { getStreakColorClasses, cn } from "@/lib/utils";
import { formatPuzzleNumber } from "@/lib/puzzleUtils";

interface AppHeaderProps {
  onShowSettings?: () => void;
  currentStreak?: number;
  isDebugMode?: boolean;
  puzzleNumber?: number;
  isArchive?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onShowSettings,
  currentStreak,
  isDebugMode = false,
  puzzleNumber,
  isArchive = false,
}) => {
  const streakColors = currentStreak
    ? getStreakColorClasses(currentStreak)
    : null;
  return (
    <header className="w-full border-b border-border bg-card py-4">
      <div className="max-w-2xl mx-auto px-6 sm:px-0">
        <div className="flex items-center justify-between min-h-[40px]">
          {/* Logo/Brand - Clean and uncluttered */}
          <Link href="/" className="flex items-baseline h-10">
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-primary m-0 flex items-baseline hover:opacity-80 transition-opacity cursor-pointer">
              <span className="sm:hidden flex items-center justify-center w-10 h-10">
                C
              </span>
              <span className="hidden sm:inline">CHRONDLE</span>
              {puzzleNumber && (
                <span
                  className={cn(
                    "text-xs font-mono ml-2",
                    isArchive
                      ? "text-muted-foreground italic"
                      : "text-foreground/70",
                  )}
                >
                  {formatPuzzleNumber(puzzleNumber)}
                </span>
              )}
              {isDebugMode && (
                <span
                  className="ml-2 mb-1 w-2 h-2 rounded-full bg-orange-600 opacity-75"
                  title="Debug mode active"
                  aria-label="Debug mode indicator"
                />
              )}
            </h1>
          </Link>

          {/* Action Buttons with Streak Counter */}
          <div className="flex items-center gap-3 h-10">
            {/* Streak Counter - Horizontal Badge */}
            {currentStreak !== undefined &&
              currentStreak > 0 &&
              streakColors && (
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-full border ${streakColors.borderColor} shadow-sm h-10`}
                  title={
                    streakColors.milestone || `${currentStreak} day streak`
                  }
                  aria-label={`Current streak: ${currentStreak} day streak`}
                >
                  <Flame className={`w-4 h-4 ${streakColors.textColor}`} />
                  <span
                    className={`text-sm font-accent font-bold ${streakColors.textColor} whitespace-nowrap`}
                  >
                    <span className="hidden sm:inline">
                      {currentStreak} day streak
                    </span>
                    <span className="sm:hidden">{currentStreak}</span>
                  </span>
                </div>
              )}

            {/* Archive Button */}
            <Button
              variant="ghost"
              size="icon"
              asChild
              title="Browse puzzle archive"
              aria-label="Browse puzzle archive"
              className="h-10 w-10 rounded-full"
            >
              <Link href="/archive">
                <Archive className="h-5 w-5" />
              </Link>
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {onShowSettings && (
              <Button
                onClick={onShowSettings}
                variant="ghost"
                size="icon"
                title="Settings - Adjust theme and accessibility options"
                aria-label="Show settings for theme and accessibility"
                className="h-10 w-10 rounded-full"
              >
                <Settings className="h-5 w-5" />
              </Button>
            )}

            {/* Auth Buttons - Rightmost */}
            <AuthButtons />
          </div>
        </div>
      </div>
    </header>
  );
};
