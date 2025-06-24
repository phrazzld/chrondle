'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface EmojiTimelineProps {
  timeline: string;
  guesses: number[];
  targetYear: number;
  className?: string;
  showTooltips?: boolean;
}

export const EmojiTimeline: React.FC<EmojiTimelineProps> = ({
  timeline,
  guesses,
  targetYear,
  className,
  showTooltips = false
}) => {
  const emojis = timeline.split('');
  
  return (
    <div className={cn("flex gap-1 items-center justify-center", className)}>
      {emojis.map((emoji, index) => {
        const guess = guesses[index];
        const distance = Math.abs(guess - targetYear);
        const isCorrect = guess === targetYear;
        
        return (
          <div
            key={index}
            className={cn(
              "relative group transition-transform duration-200",
              isCorrect && "animate-bounce-once"
            )}
          >
            <span 
              className={cn(
                "text-2xl inline-block transition-transform duration-200",
                "group-hover:scale-125",
                isCorrect && "animate-pulse"
              )}
              role="img"
              aria-label={`Guess ${index + 1}: ${isCorrect ? 'Correct' : `${distance} years off`}`}
            >
              {emoji}
            </span>
            
            {/* Tooltip on hover */}
            {showTooltips && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                  {isCorrect ? 'Correct!' : `${distance} years off`}
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                  <div className="border-4 border-transparent border-t-gray-900" />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};