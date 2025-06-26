'use client';

import React from 'react';
import { formatYear } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

interface HintsDisplayProps {
  events: string[];
  guesses: number[];
  targetYear: number;
  currentHintIndex: number;
  isLoading: boolean;
  error: string | null;
  onHintClick?: (hintIndex: number) => void;
  className?: string;
}

interface CompactHintItemProps {
  hintNumber: number;
  hintText: string;
  guess: number;
  targetYear: number;
  onClick?: () => void;
}

interface ActiveHintItemProps {
  hintNumber: number;
  hintText: string | null;
  isLoading: boolean;
}

interface PlaceholderHintItemProps {
  hintNumber: number;
}

const CompactHintItem: React.FC<CompactHintItemProps> = ({
  hintNumber,
  hintText,
  guess,
  targetYear,
  onClick
}) => {
  if (!hintText || guess === undefined || !targetYear) {
    return (
      <Card className="bg-destructive/10 border-destructive/20">
        <CardContent className="p-3">
          <span className="text-destructive font-medium">#{hintNumber}: [DATA MISSING]</span>
        </CardContent>
      </Card>
    );
  }

  const isCorrect = guess === targetYear;
  const isEarlier = guess > targetYear;
  const badgeVariant = isEarlier ? 'earlier' : 'later';
  const badgeText = isEarlier ? 'EARLIER' : 'LATER';

  if (isCorrect) {
    return (
      <Card 
        className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800 cursor-pointer hover:shadow-md transition-shadow"
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-medium text-muted-foreground">#{hintNumber}</span>
            <Badge className="bg-green-500 hover:bg-green-600 text-white">
              ✓ CORRECT
            </Badge>
            <span className="font-bold text-lg text-green-700 dark:text-green-300">{formatYear(guess)}</span>
          </div>
          <p className="text-sm text-green-600 dark:text-green-400 pl-8">{hintText}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="bg-muted/30 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-sm font-medium text-muted-foreground">#{hintNumber}</span>
          <Badge variant={badgeVariant}>
            {badgeText}
          </Badge>
          <span className="font-semibold text-lg">{formatYear(guess)}</span>
        </div>
        <p className="text-sm text-muted-foreground pl-8">{hintText}</p>
      </CardContent>
    </Card>
  );
};

const ActiveHintItem: React.FC<ActiveHintItemProps> = ({
  hintNumber,
  hintText,
  isLoading
}) => {
  return (
    <Card className="border-2 border-primary/20 shadow-md bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
            {hintNumber}
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider block">
              🎯 Current Hint
            </span>
            <span className="text-xs text-muted-foreground">
              Hint {hintNumber} of 6
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex items-center text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-3"></div>
            <span className="text-lg font-medium">Loading hint...</span>
          </div>
        ) : (
          <p className="text-lg leading-relaxed font-medium">
            {hintText || 'No hint available'}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const PlaceholderHintItem: React.FC<PlaceholderHintItemProps> = ({
  hintNumber
}) => {
  return (
    <Card className="bg-muted/20 border-dashed border-muted-foreground/30">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-medium text-muted-foreground">
          {hintNumber}
        </div>
        <span className="text-sm text-muted-foreground">
          Hint {hintNumber} will be revealed after your next guess
        </span>
      </CardContent>
    </Card>
  );
};

export const HintsDisplay: React.FC<HintsDisplayProps> = ({
  events,
  guesses,
  targetYear,
  currentHintIndex,
  isLoading,
  error,
  onHintClick,
  className = ''
}) => {
  if (error) {
    return (
      <Card className={`${className} border-destructive/50 bg-destructive/5`}>
        <CardContent className="p-6 text-center">
          <div className="mb-3">
            <div className="w-12 h-12 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-destructive text-xl">⚠️</span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-destructive">
              Unable to Load Puzzle
            </h3>
            <p className="text-muted-foreground">
              Please refresh the page to try again.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!events || events.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading puzzle events...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isGameWon = guesses.includes(targetYear);

  // Generate all 6 hint slots
  const hintSlots = Array.from({ length: 6 }, (_, i) => {
    const hintNumber = i + 1;
    const hintText = events[i];
    const guess = guesses[i];
    
    // Past hints (already guessed)
    if (i < guesses.length) {
      return (
        <CompactHintItem
          key={`hint-${hintNumber}`}
          hintNumber={hintNumber}
          hintText={hintText}
          guess={guess}
          targetYear={targetYear}
          onClick={() => onHintClick?.(i)}
        />
      );
    }
    
    // Current hint (active)
    if (i === currentHintIndex && !isGameWon) {
      return (
        <ActiveHintItem
          key={`hint-${hintNumber}`}
          hintNumber={hintNumber}
          hintText={hintText}
          isLoading={isLoading || !hintText}
        />
      );
    }
    
    // Future hints (placeholders)
    return (
      <PlaceholderHintItem
        key={`hint-${hintNumber}`}
        hintNumber={hintNumber}
      />
    );
  });

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-foreground mb-2">
          Historical Events
        </h2>
        <p className="text-sm text-muted-foreground">
          All events below happened in the same year. Can you guess which year?
        </p>
      </div>
      
      <div className="space-y-3">
        {hintSlots}
      </div>

      {/* Game Won State */}
      {isGameWon && (
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:border-green-800 dark:from-green-950 dark:to-emerald-950 mt-6">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎉</span>
            </div>
            <h3 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">
              Congratulations!
            </h3>
            <p className="text-green-600 dark:text-green-400">
              You correctly identified the year as {formatYear(targetYear)}!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};