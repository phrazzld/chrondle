'use client';

import React from 'react';
import { formatYear } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Check } from 'lucide-react';

interface GameTimelineProps {
  events: string[];
  guesses: number[];
  targetYear: number;
  currentHintIndex: number;
  isLoading: boolean;
  error: string | null;
  className?: string;
}

interface CompactTimelineItemProps {
  hintNumber: number;
  hintText: string;
  guess: number;
  targetYear: number;
}

interface ActiveTimelineItemProps {
  hintNumber: number;
  hintText: string | null;
  isLoading: boolean;
}

interface PlaceholderTimelineItemProps {
  hintNumbers: number[];
}

const CompactTimelineItem: React.FC<CompactTimelineItemProps> = ({
  hintNumber,
  hintText,
  guess,
  targetYear
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
      <Card className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-medium text-muted-foreground">#{hintNumber}</span>
            <Badge className="bg-green-500 hover:bg-green-600 text-white">
              CORRECT
            </Badge>
            <span className="font-bold text-lg text-green-700 dark:text-green-300">{formatYear(guess)}</span>
          </div>
          <p className="text-sm text-green-600 dark:text-green-400 pl-8">{hintText}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-muted/30">
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

const ActiveTimelineItem: React.FC<ActiveTimelineItemProps> = ({
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

const PlaceholderTimelineItem: React.FC<PlaceholderTimelineItemProps> = ({
  hintNumbers
}) => {
  return (
    <div className="space-y-2">
      {hintNumbers.map((num) => (
        <Card key={num} className="bg-muted/20 border-dashed border-muted-foreground/30">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-medium text-muted-foreground">
              {num}
            </div>
            <span className="text-sm text-muted-foreground">
              Hint {num} will be revealed
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export const GameTimeline: React.FC<GameTimelineProps> = ({
  events,
  guesses,
  targetYear,
  currentHintIndex,
  isLoading,
  error,
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

  const isGameWon = guesses.length > 0 && guesses[guesses.length - 1] === targetYear;
  
  // Create timeline sections using currentHintIndex as source of truth
  const pastItems: Array<{ hintNumber: number; hintText: string; guess: number }> = [];
  const futureHintNumbers: number[] = [];

  // Build past items
  for (let i = 0; i < currentHintIndex; i++) {
    if (guesses[i] !== undefined && events[i] !== undefined) {
      pastItems.push({
        hintNumber: i + 1,
        hintText: events[i],
        guess: guesses[i]
      });
    }
  }

  // Current item
  const currentItem = {
    hintNumber: currentHintIndex + 1,
    hintText: events[currentHintIndex]
  };

  // Build future hint numbers
  if (!isGameWon && currentHintIndex < 5) {
    for (let i = currentHintIndex + 1; i < 6; i++) {
      futureHintNumbers.push(i + 1);
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Timeline Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Game Progress
              </h2>
              <p className="text-sm text-muted-foreground">
                {isGameWon 
                  ? 'Puzzle Complete!' 
                  : `${currentHintIndex + 1} of 6 hints revealed`
                }
              </p>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 6 }, (_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    i < currentHintIndex + 1
                      ? 'bg-primary'
                      : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Past Items - Compact */}
      {pastItems.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Previous Guesses
          </h3>
          {pastItems.map((item) => (
            <CompactTimelineItem
              key={`past-${item.hintNumber}`}
              hintNumber={item.hintNumber}
              hintText={item.hintText}
              guess={item.guess}
              targetYear={targetYear}
            />
          ))}
        </div>
      )}

      {/* Current Item - Full Treatment */}
      {!isGameWon && currentHintIndex < 6 && (
        <div>
          <ActiveTimelineItem
            hintNumber={currentItem.hintNumber}
            hintText={currentItem.hintText || "Loading hint..."}
            isLoading={isLoading || !currentItem.hintText}
          />
        </div>
      )}

      {/* Future Items - Minimal Placeholders */}
      {futureHintNumbers.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Upcoming Hints
          </h3>
          <PlaceholderTimelineItem hintNumbers={futureHintNumbers} />
        </div>
      )}

      {/* Game Won State */}
      {isGameWon && (
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:border-green-800 dark:from-green-950 dark:to-emerald-950">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">
              Congratulations!
            </h3>
            <p className="text-green-600 dark:text-green-400 text-lg">
              You solved today&apos;s puzzle in {guesses.length} guess{guesses.length === 1 ? '' : 'es'}!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};