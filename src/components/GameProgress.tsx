'use client';

import React from 'react';

interface GameProgressProps {
  currentHintIndex: number;
  isGameWon?: boolean;
  totalHints?: number;
  className?: string;
}

export const GameProgress: React.FC<GameProgressProps> = ({
  currentHintIndex,
  totalHints = 6,
  className = ''
}) => {
  return (
    <div className={`flex justify-start gap-2 py-2 ${className}`}>
      {Array.from({ length: totalHints }, (_, i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
            i < currentHintIndex + 1
              ? 'bg-primary shadow-lg ring-1 ring-primary/30'
              : 'bg-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  );
};