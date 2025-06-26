'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';

interface GameProgressProps {
  currentHintIndex: number;
  isGameWon: boolean;
  totalHints?: number;
  className?: string;
}

export const GameProgress: React.FC<GameProgressProps> = ({
  currentHintIndex,
  isGameWon,
  totalHints = 6,
  className = ''
}) => {
  return (
    <Card className={`bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 ${className}`}>
      <CardContent className="p-4">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Game Progress
          </h2>
          
          {/* Dots as primary content */}
          <div className="flex justify-center gap-2 mb-3">
            {Array.from({ length: totalHints }, (_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  i < currentHintIndex + 1
                    ? 'bg-primary shadow-lg ring-2 ring-primary/30'
                    : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
          
          {/* Secondary text content */}
          <p className="text-sm text-muted-foreground">
            {isGameWon 
              ? '🎉 Puzzle Complete!' 
              : `${currentHintIndex + 1} of ${totalHints} hints revealed`
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};