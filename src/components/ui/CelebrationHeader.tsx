'use client';

import React from 'react';
import { TextAnimate } from '@/components/magicui/text-animate';

interface CelebrationHeaderProps {
  hasWon: boolean;
  guesses: number[];
  timeString: string;
}

export const CelebrationHeader: React.FC<CelebrationHeaderProps> = ({
  hasWon,
  guesses,
  timeString
}) => {
  const getCelebrationTitle = () => {
    if (!hasWon) {
      return 'So close!';
    }

    const guessCount = guesses.length;
    
    if (guessCount === 1) {
      return 'INCREDIBLE!';
    } else if (guessCount <= 2) {
      return 'AMAZING!';
    } else if (guessCount <= 4) {
      return 'NICE WORK!';
    } else {
      return 'GOT IT!';
    }
  };

  const celebrationTitle = getCelebrationTitle();

  return (
    <div className="text-center space-y-4 py-4">
      {/* Celebration Title */}
      <TextAnimate
        animation="fadeIn"
        by="word"
        delay={0.1}
        className="text-3xl font-bold text-foreground"
      >
        {celebrationTitle}
      </TextAnimate>
      
      {/* Countdown Badge */}
      <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="text-xs text-muted-foreground uppercase tracking-wide">
          Next puzzle
        </div>
        <div className="text-sm font-mono font-bold text-primary">
          {timeString}
        </div>
      </div>
    </div>
  );
};