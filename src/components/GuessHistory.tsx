'use client';

import React, { useMemo } from 'react';
import { formatYear, getGuessDirectionInfo } from '@/lib/utils';
import { Card } from '@/components/ui/Card';

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
  const directionInfo = getGuessDirectionInfo(guess, targetYear);

  if (isCorrect) {
    return (
      <Card
        variant="success"
        className="guess-row flex items-center justify-between"
        hover={false}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <span className="font-bold text-lg">{formatYear(guess)}</span>
        <span className="font-bold text-lg">CORRECT!</span>
      </Card>
    );
  }

  return (
    <Card
      variant="secondary"
      className="guess-row flex flex-col lg:flex-row items-start lg:items-center gap-4"
      hover={false}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center gap-4 w-full lg:w-auto">
        <div 
          className="flex-shrink-0 text-center font-bold text-sm py-2 px-4 rounded-lg min-w-32"
          style={{
            background: directionInfo.direction.includes('EARLIER') ? 'var(--info)' : 'var(--warning)',
            color: 'white'
          }}
        >
          {directionInfo.direction}
        </div>
        <div className="flex flex-col items-center">
          <div className="font-bold text-xl" style={{ color: 'var(--foreground)' }}>
            {formatYear(guess)}
          </div>
        </div>
      </div>
      <div 
        className="border-l-2 pl-4 flex-1"
        style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
      >
        <span className="font-semibold" style={{ color: 'var(--foreground)' }}>Hint:</span> {hint || 'No more hints available.'}
      </div>
    </Card>
  );
});

GuessRow.displayName = 'GuessRow';

export const GuessHistory: React.FC<GuessHistoryProps> = ({
  guesses,
  targetYear,
  events,
  className = ''
}) => {
  // Memoize the guess rows to prevent unnecessary re-renders
  const guessRows = useMemo(() => {
    return guesses.map((guess, index) => {
      const hint = events[index + 1] || 'No more hints available.';
      
      return (
        <GuessRow
          key={`${guess}-${index}`}
          guess={guess}
          targetYear={targetYear}
          hint={hint}
          index={index}
        />
      );
    });
  }, [guesses, targetYear, events]);

  if (guesses.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
          Your Guesses
        </h3>
        <div 
          className="h-px w-full mb-4"
          style={{ background: 'var(--border)' }}
        />
      </div>
      <div className="space-y-4">
        {guessRows}
      </div>
    </div>
  );
};