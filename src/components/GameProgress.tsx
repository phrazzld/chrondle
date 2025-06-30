'use client';

import React from 'react';

interface GameProgressProps {
  currentHintIndex: number;
  isGameWon?: boolean;
  isGameComplete?: boolean;
  guessCount?: number;
  totalHints?: number;
  className?: string;
}

export const GameProgress: React.FC<GameProgressProps> = ({
  currentHintIndex,
  isGameComplete = false,
  guessCount = 0,
  totalHints = 6,
  className = ''
}) => {
  // When game is complete, show bubbles for actual hints revealed (guesses made)
  // Otherwise show normal progression
  const hintsToShow = isGameComplete ? guessCount : totalHints;
  const filledBubbles = isGameComplete ? guessCount : currentHintIndex + 1;
  
  return (
    <div className={`flex justify-start items-center gap-2 py-2 ${className}`}>
      <div className="flex gap-2 items-center">
        {Array.from({ length: hintsToShow }, (_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i < filledBubbles
                ? 'bg-primary shadow-lg ring-1 ring-primary/30'
                : 'bg-muted-foreground/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};