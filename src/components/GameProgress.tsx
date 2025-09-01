"use client";

import React from "react";

interface GameProgressProps {
  guessCount?: number;
  totalHints?: number;
  className?: string;
}

export const GameProgress: React.FC<GameProgressProps> = ({
  guessCount = 0,
  totalHints = 6,
  className = "",
}) => {
  const remainingGuesses = totalHints - guessCount;

  return (
    <div className={`flex justify-start items-center gap-2 py-2 ${className}`}>
      <span className="text-sm font-medium text-muted-foreground mr-2">
        Guesses Remaining:
      </span>
      <div
        className="flex gap-2 items-center"
        aria-label={`Guesses remaining: ${remainingGuesses}`}
      >
        {Array.from({ length: remainingGuesses }, (_, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full transition-all duration-300 bg-primary shadow-lg ring-1 ring-primary/30"
          />
        ))}
        {remainingGuesses === 0 && (
          <span className="text-sm text-muted-foreground">None</span>
        )}
      </div>
    </div>
  );
};
