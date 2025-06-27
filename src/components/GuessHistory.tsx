'use client';

import React from 'react';
import { formatYear } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface GuessHistoryProps {
  guesses: number[];
  targetYear: number;
  events: string[];
  className?: string;
}

interface GuessRowProps {
  guess: number;
  targetYear: number;
  hint: string;
  index: number;
}

const GuessRow: React.FC<GuessRowProps> = React.memo(({ 
  guess, 
  targetYear, 
  hint, 
  index
}) => {
  const isCorrect = guess === targetYear;
  
  if (isCorrect) {
    return (
      <div className="flex items-center justify-between p-4 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            CORRECT
          </Badge>
          <span className="font-bold text-lg">{formatYear(guess)}</span>
        </div>
        <span className="text-green-700 dark:text-green-300 font-semibold">
          You won!
        </span>
      </div>
    );
  }

  const isEarlier = guess > targetYear;
  const badgeVariant = isEarlier ? 'earlier' : 'later';
  const badgeText = isEarlier ? 'EARLIER' : 'LATER';

  return (
    <div className="space-y-3 p-4 rounded-lg border bg-card">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
        <Badge variant={badgeVariant} className="text-sm px-3 py-1">
          {badgeText}
        </Badge>
        <span className="font-semibold text-lg">{formatYear(guess)}</span>
      </div>
      
      {hint && (
        <div className="pl-8">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Next hint:</span> {hint}
          </p>
        </div>
      )}
    </div>
  );
});

GuessRow.displayName = 'GuessRow';

export const GuessHistory: React.FC<GuessHistoryProps> = ({
  guesses,
  targetYear,
  events,
  className = ''
}) => {
  if (guesses.length === 0) {
    return null;
  }

  return (
    <div 
      className={className}
      role="region"
      aria-label={`Your ${guesses.length} previous guess${guesses.length === 1 ? '' : 'es'}`}
    >
      <div className="mb-4">
        <h3 
          className="text-xl font-bold mb-2" 
          style={{ color: 'var(--foreground)' }}
          id="guess-history-heading"
        >
          Your Guesses
        </h3>
        <div 
          className="h-px w-full"
          style={{ background: 'var(--border)' }}
        />
      </div>
      
      <div 
        className="space-y-3"
        role="list"
        aria-labelledby="guess-history-heading"
      >
        {guesses.map((guess, index) => {
          const hint = events[index + 1] || '';
          
          return (
            <GuessRow
              key={`${guess}-${index}`}
              guess={guess}
              targetYear={targetYear}
              hint={hint}
              index={index}
            />
          );
        })}
      </div>
    </div>
  );
};