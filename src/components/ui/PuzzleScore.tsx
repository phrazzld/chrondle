"use client";

import React from "react";
import { formatScore } from "@/lib/confidenceScoring";

interface PuzzleScoreProps {
  /** Current potential score (before completion) or final score (after completion) */
  score: number;

  /** Whether the game is complete */
  isComplete?: boolean;

  /** Whether this was a perfect game (no wrong guesses) */
  isPerfect?: boolean;

  /** Additional CSS classes */
  className?: string;
}

/**
 * Puzzle score display component
 *
 * Shows current/potential score during gameplay, or final score after completion.
 * Replaces the persistent bank display with per-puzzle scoring.
 *
 * @example
 * // During gameplay
 * <PuzzleScore score={475} />
 *
 * @example
 * // After completion (perfect game)
 * <PuzzleScore score={600} isComplete isPerfect />
 */
export const PuzzleScore: React.FC<PuzzleScoreProps> = ({
  score,
  isComplete = false,
  isPerfect = false,
  className = "",
}) => {
  // During gameplay: show simple score
  if (!isComplete) {
    return (
      <div className={`flex items-center justify-end gap-2 ${className}`}>
        <span className="text-muted-foreground text-sm">Current Score:</span>
        <span className="text-primary text-lg font-bold">{formatScore(score)}</span>
      </div>
    );
  }

  // After completion: show celebratory display
  return (
    <div
      className={`border-primary/20 bg-primary/5 rounded-lg border-2 p-4 text-center ${className}`}
    >
      {/* Perfect game celebration */}
      {isPerfect && (
        <div className="mb-2">
          <span className="text-2xl" role="img" aria-label="Perfect game">
            🌟
          </span>
          <p className="text-primary text-sm font-semibold">Perfect Game!</p>
          <p className="text-muted-foreground text-xs">No wrong guesses</p>
        </div>
      )}

      {/* Final score */}
      <div className="space-y-1">
        {!isPerfect && (
          <p className="text-foreground text-sm font-medium">
            {score > 0 ? "🎯 Puzzle Complete!" : "Puzzle Complete"}
          </p>
        )}
        <p className="text-primary text-3xl font-bold">{formatScore(score)}</p>
      </div>
    </div>
  );
};

/**
 * Compact puzzle score display for header
 *
 * Minimal version for displaying in the app header or sidebar.
 */
export const CompactPuzzleScore: React.FC<{ score: number; className?: string }> = ({
  score,
  className = "",
}) => {
  return (
    <div
      className={`bg-primary/10 inline-flex items-center gap-1.5 rounded-md px-2 py-1 ${className}`}
    >
      <span className="text-muted-foreground text-xs font-medium">Score:</span>
      <span className="text-primary text-sm font-bold">{formatScore(score)}</span>
    </div>
  );
};
