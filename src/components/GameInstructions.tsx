"use client";

import React from "react";
import { RippleButton } from "@/components/magicui/ripple-button";
import { ModeHero } from "@/components/ui/ModeHero";
import { HistoricalContextCard } from "@/components/HistoricalContextCard";
import { useShareGame } from "@/hooks/useShareGame";
import { formatYear } from "@/lib/displayFormatting";
import { cn } from "@/lib/utils";
import type { ClosestGuessData } from "@/types/game";

interface GameInstructionsProps {
  className?: string;
  isGameComplete?: boolean;
  hasWon?: boolean;
  targetYear?: number;
  guesses?: number[];
  timeString?: string;
  currentStreak?: number;
  puzzleEvents?: string[];
  closestGuess?: ClosestGuessData | null;
  isArchive?: boolean;
  historicalContext?: string;
  puzzleNumber?: number;
}

export const GameInstructions: React.FC<GameInstructionsProps> = ({
  className = "",
  isGameComplete = false,
  hasWon = false,
  targetYear,
  guesses = [],
  timeString,
  puzzleEvents = [],
  historicalContext,
  closestGuess,
  isArchive = false,
  puzzleNumber,
}) => {
  // Share functionality - always initialize hook (React hooks rule)
  const { shareGame, shareStatus, shareMethod, isSharing } = useShareGame(
    guesses,
    targetYear || 0,
    hasWon,
    puzzleEvents,
    puzzleNumber,
  );

  // Active game state - show normal instructions
  if (!isGameComplete) {
    return (
      <ModeHero
        className={cn("mb-6", className)}
        title="Guess the Year"
        subtitle="Each hint is an event from the same year."
      />
    );
  }

  // Game completed - show results with answer reveal

  const getShareButtonContent = () => {
    switch (shareStatus) {
      case "success":
        return (
          <div className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>{shareMethod === "webshare" ? "Shared!" : "Copied!"}</span>
          </div>
        );
      case "error":
        return (
          <div className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <span>Try again</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
              />
            </svg>
            <span>Share</span>
          </div>
        );
    }
  };

  const getShareButtonStyles = () => {
    const baseStyles =
      "flex-1 py-3 px-4 font-semibold text-sm transition-all duration-300 rounded-lg";

    switch (shareStatus) {
      case "success":
        return `${baseStyles} bg-green-500 text-white hover:bg-green-600`;
      case "error":
        return `${baseStyles} bg-red-500 text-white hover:bg-red-600`;
      default:
        return `${baseStyles} bg-primary text-primary-foreground hover:bg-primary/90`;
    }
  };

  return (
    <div className={cn("mb-1", className)}>
      {/* Answer Reveal Section - Compact for Loss State */}
      {!hasWon && targetYear && (
        <div className="mb-6 flex w-full items-center gap-4 rounded-xl border border-red-500/20 bg-gradient-to-br from-red-500/5 to-red-600/10 p-6">
          <div className="flex flex-1 flex-col items-start">
            <div className="mb-1 text-xs font-medium tracking-wide text-red-600 uppercase dark:text-red-400">
              The answer was
            </div>
            <div className="text-2xl font-bold text-red-700 sm:text-3xl dark:text-red-300">
              {formatYear(targetYear)}
            </div>
            {/* Show closest guess information if available */}
            {closestGuess && (
              <div className="mt-1 text-sm text-red-600/80 dark:text-red-400/80">
                Your closest: {formatYear(closestGuess.guess)} ({closestGuess.distance} year
                {closestGuess.distance === 1 ? "" : "s"} off)
              </div>
            )}
          </div>

          <div className="text-sm font-medium text-red-600 dark:text-red-400">
            Better luck tomorrow!
          </div>
        </div>
      )}

      {/* Success State - Show answer with celebration */}
      {hasWon && targetYear && (
        <div className="mb-6 flex w-full items-center gap-4 rounded-xl border border-green-500/20 bg-gradient-to-br from-green-500/5 to-green-600/10 p-6">
          <div className="flex flex-1 flex-col items-start">
            <div className="mb-1 text-xs font-medium tracking-wide text-green-600 uppercase dark:text-green-400">
              The year was
            </div>
            <div className="text-2xl font-bold text-green-700 sm:text-3xl dark:text-green-300">
              {formatYear(targetYear)}
            </div>
          </div>

          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-sm font-medium">Great job!</span>
          </div>
        </div>
      )}

      {/* Conditional Layout: Show countdown for daily puzzles, compact share for archive */}
      {!isArchive ? (
        // Daily puzzle layout with countdown
        <div className="from-primary/5 to-primary/10 border-primary/20 mb-4 flex w-full items-center gap-4 rounded-xl border bg-gradient-to-br p-6">
          {/* Countdown Section */}
          <div className="flex flex-1 flex-col items-start">
            <div className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
              Next puzzle in
            </div>
            <div className="text-primary font-mono text-2xl font-bold sm:text-3xl">
              {timeString || "00:00:00"}
            </div>
          </div>

          {/* Share Button Section */}
          <div className="flex gap-3">
            {/* Share Button */}
            <RippleButton
              onClick={() => shareGame()}
              disabled={isSharing}
              className={getShareButtonStyles()}
              rippleColor="rgba(255, 255, 255, 0.3)"
              aria-label="Share your results"
            >
              {getShareButtonContent()}
            </RippleButton>
          </div>
        </div>
      ) : (
        // Archive puzzle layout - just share button in a more compact form
        <div className="mb-4 flex w-full justify-center">
          <RippleButton
            onClick={() => shareGame()}
            disabled={isSharing}
            className={getShareButtonStyles() + " px-8 py-3"}
            rippleColor="rgba(255, 255, 255, 0.3)"
            aria-label="Share your results"
          >
            {getShareButtonContent()}
          </RippleButton>
        </div>
      )}

      {/* Historical Context Card - Below the next puzzle section */}
      <HistoricalContextCard
        context={isGameComplete ? historicalContext : undefined}
        className=""
      />
    </div>
  );
};
