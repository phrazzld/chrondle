'use client';

import React, { useMemo } from 'react';
import { formatYear, getGuessDirectionInfo } from '@/lib/utils';

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
      <div 
        className="guess-row bg-green-500 text-white p-4 rounded-lg flex items-center justify-between shadow-md"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <span className="font-bold text-lg">{formatYear(guess)}</span>
        <span className="font-bold text-lg">CORRECT!</span>
      </div>
    );
  }

  return (
    <div 
      className="guess-row bg-white dark:bg-gray-800 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-md"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className={`flex-shrink-0 text-center font-bold text-sm p-2 rounded-md min-w-32 ${directionInfo.bgColor} ${directionInfo.textColor}`}>
          {directionInfo.direction}
        </div>
        <div className="flex flex-col items-center">
          <div className="font-bold text-xl">{formatYear(guess)}</div>
        </div>
      </div>
      <div className="border-l-2 border-gray-200 dark:border-gray-600 pl-4 text-gray-600 dark:text-gray-300 flex-1">
        <span className="font-semibold text-gray-500 dark:text-gray-400">Hint:</span> {hint || 'No more hints available.'}
      </div>
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

  return (
    <div className={`space-y-3 ${className}`}>
      {guessRows}
    </div>
  );
};