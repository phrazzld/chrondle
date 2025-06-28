'use client';

import React from 'react';
import { formatYear } from '@/lib/utils';
import { Separator } from '@/components/ui/Separator';
import { TextAnimate } from '@/components/magicui/text-animate';
import { Check } from 'lucide-react';

interface HintsDisplayProps {
  events: string[];
  guesses: number[];
  targetYear: number;
  currentHintIndex: number;
  isGameComplete?: boolean;
  isLoading: boolean;
  error: string | null;
  className?: string;
}

interface CompactHintItemProps {
  hintNumber: number;
  hintText: string;
  guess: number;
  targetYear: number;
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
  targetYear
}) => {
  if (!hintText || guess === undefined || !targetYear) {
    return (
      <div className="py-3">
        <p className="text-xs text-muted-foreground mb-1 text-left uppercase">Hint #{hintNumber}</p>
        <p className="text-lg text-destructive text-left">[DATA MISSING]</p>
      </div>
    );
  }

  // Determine guess feedback
  const isCorrect = guess === targetYear;
  const isEarlier = guess < targetYear;
  const feedbackColor = isCorrect ? 'text-green-600 dark:text-green-400' : 
                        (isEarlier ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400');

  return (
    <div 
      className="py-3"
    >
      <p className="text-xs text-muted-foreground mb-1 text-left uppercase font-accent tracking-wide">Hint #{hintNumber}</p>
      <div className="flex items-center justify-between gap-3">
        <p className="text-lg text-left flex-1 font-body leading-relaxed">{hintText}</p>
        <div className="flex items-center gap-3">
          <div className={`w-8 flex justify-center items-center ${feedbackColor}`}>
            {isCorrect ? (
              <Check className="w-5 h-5" />
            ) : (
              <span className="font-semibold text-lg">
                {isEarlier ? '▲' : '▼'}
              </span>
            )}
          </div>
          <div className="w-18 bg-muted/70 rounded-md px-2 py-1 text-center whitespace-nowrap border border-muted/40">
            <span className="font-accent font-semibold text-foreground text-sm">{formatYear(guess)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActiveHintItem: React.FC<ActiveHintItemProps> = ({
  hintNumber,
  hintText,
  isLoading
}) => {
  return (
    <div className="py-3">
      <p className="text-xs text-muted-foreground mb-1 text-left uppercase font-accent tracking-wide">Hint #{hintNumber}</p>
      {isLoading ? (
        <div className="flex items-center text-muted-foreground">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-2"></div>
          <span className="text-lg font-body">Loading hint...</span>
        </div>
      ) : (
        <TextAnimate 
          key={hintText} 
          className="text-lg text-left font-body leading-relaxed" 
          animation="blurIn" 
          by="character"
          duration={0.6}
          startOnView={false}
          delay={0}
        >
          {hintText || 'No hint available'}
        </TextAnimate>
      )}
    </div>
  );
};

const PlaceholderHintItem: React.FC<PlaceholderHintItemProps> = ({
  hintNumber
}) => {
  return (
    <div className="py-3 opacity-50">
      <p className="text-xs text-muted-foreground mb-1 text-left uppercase font-accent tracking-wide">Hint #{hintNumber}</p>
      <p className="text-lg text-muted-foreground text-left font-body leading-relaxed">
        Will be revealed after your next guess
      </p>
    </div>
  );
};

interface CompletionHintItemProps {
  hintNumber: number;
  hintText: string;
}

const CompletionHintItem: React.FC<CompletionHintItemProps> = ({
  hintNumber,
  hintText
}) => {
  return (
    <div className="py-3 opacity-75">
      <p className="text-xs text-muted-foreground mb-1 text-left uppercase font-accent tracking-wide">Hint #{hintNumber}</p>
      <p className="text-lg text-muted-foreground text-left font-body leading-relaxed">
        {hintText || 'No hint available'}
      </p>
    </div>
  );
};

export const HintsDisplay: React.FC<HintsDisplayProps> = ({
  events,
  guesses,
  targetYear,
  currentHintIndex,
  isGameComplete = false,
  isLoading,
  error,
  className = ''
}) => {
  if (error) {
    return (
      <div className={`${className} p-6 text-center bg-destructive/5 border border-destructive/50 rounded-lg`}>
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
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className={`${className} p-6 text-center`}>
        <div className="flex items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading puzzle events...</p>
        </div>
      </div>
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
    
    // Future hints (placeholders or completion hints)
    if (isGameComplete && hintText) {
      // Show revealed hint when game is complete
      return (
        <CompletionHintItem
          key={`hint-${hintNumber}`}
          hintNumber={hintNumber}
          hintText={hintText}
        />
      );
    }
    
    // Show placeholder for future hints
    return (
      <PlaceholderHintItem
        key={`hint-${hintNumber}`}
        hintNumber={hintNumber}
      />
    );
  });

  return (
    <div className={className}>
      {hintSlots.map((hint, index) => (
        <React.Fragment key={index}>
          {hint}
          {index < hintSlots.length - 1 && <Separator className="my-2" />}
        </React.Fragment>
      ))}

    </div>
  );
};