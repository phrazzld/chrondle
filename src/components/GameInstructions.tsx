'use client';

import React from 'react';
import { RippleButton } from '@/components/magicui/ripple-button';
import { useShareGame } from '@/hooks/useShareGame';

interface GameInstructionsProps {
  className?: string;
  isGameComplete?: boolean;
  hasWon?: boolean;
  targetYear?: number;
  guesses?: number[];
  timeString?: string;
  currentStreak?: number;
}

export const GameInstructions: React.FC<GameInstructionsProps> = ({
  className = '',
  isGameComplete = false,
  hasWon = false,
  targetYear,
  guesses = [],
  timeString
}) => {
  // Share functionality - always initialize hook (React hooks rule)
  const { shareGame, shareStatus } = useShareGame(
    guesses,
    targetYear || 0,
    hasWon
  );

  // Active game state - show normal instructions
  if (!isGameComplete) {
    return (
      <div className={`text-left mb-6 ${className}`}>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          Guess the Year
        </h2>
        <p className="text-lg text-muted-foreground leading-7">
          All of these events happened in the same year. Can you guess the year?
        </p>
      </div>
    );
  }

  // Minimal completion state - no verbose messaging

  const getShareButtonContent = () => {
    switch (shareStatus) {
      case 'copying':
        return (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            <span>Copying...</span>
          </div>
        );
      case 'success':
        return (
          <div className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Copied!</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Try again</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            <span>Share Results</span>
          </div>
        );
    }
  };

  const getShareButtonStyles = () => {
    const baseStyles = "w-1/3 py-3 px-4 font-semibold text-sm transition-all duration-300 rounded-lg";
    
    switch (shareStatus) {
      case 'success':
        return `${baseStyles} bg-green-500 text-white hover:bg-green-600`;
      case 'error':
        return `${baseStyles} bg-red-500 text-white hover:bg-red-600`;
      default:
        return `${baseStyles} bg-primary text-primary-foreground hover:bg-primary/90`;
    }
  };

  return (
    <div className={`text-center mb-8 ${className}`}>
      {/* Consolidated Single Row Layout */}
      <div className="w-full flex items-center gap-4 p-6 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl">
        
        {/* Countdown Section */}
        <div className="flex flex-col items-start flex-1">
          <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
            Next puzzle in
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-primary">
            {timeString || '00:00:00'}
          </div>
        </div>
        
        {/* Share Button */}
        <RippleButton
          onClick={() => shareGame()}
          disabled={shareStatus === 'copying'}
          className={getShareButtonStyles()}
          rippleColor="rgba(255, 255, 255, 0.3)"
          aria-label="Share your results"
        >
          {getShareButtonContent()}
        </RippleButton>
        
      </div>
    </div>
  );
};
