'use client';

import React from 'react';
import { RippleButton } from '@/components/magicui/ripple-button';
import { ShareStatus } from '@/hooks/useShareGame';
import { formatYear } from '@/lib/utils';
import type { ClosestGuessData } from '@/hooks/useGameState';

interface ShareCardProps {
  emojiBarcode: string;
  hasWon: boolean;
  guesses: number[];
  onShare: () => void;
  shareStatus: ShareStatus;
  closestGuess?: ClosestGuessData | null;
  targetYear?: number;
}

export const ShareCard: React.FC<ShareCardProps> = ({
  emojiBarcode,
  hasWon,
  guesses,
  onShare,
  shareStatus,
  closestGuess,
  targetYear
}) => {
  const getShareButtonContent = () => {
    const isSuccess = shareStatus === 'success';
    const isError = shareStatus === 'error';
    
    return (
      <div className="flex items-center justify-center gap-3 relative">
        {/* Icon Container with Magic UI-style transition */}
        <div className="relative h-5 w-5">
          {/* Share Icon */}
          <svg 
            className={`h-5 w-5 transition-all duration-300 ${isSuccess || isError ? "scale-0" : "scale-100"}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
          
          {/* Success Checkmark */}
          <svg 
            className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${isSuccess ? "scale-100" : "scale-0"}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          
          {/* Error X */}
          <svg 
            className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${isError ? "scale-100" : "scale-0"}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        
        {/* Text Container with slide animation */}
        <div className="relative">
          {/* Default Text */}
          <span className={`transition-all duration-300 ${isSuccess || isError ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"}`}>
            Share Results
          </span>
          
          {/* Success Text */}
          <span className={`absolute inset-0 transition-all duration-300 ${isSuccess ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"}`}>
            Copied!
          </span>
          
          {/* Error Text */}
          <span className={`absolute inset-0 transition-all duration-300 ${isError ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"}`}>
            Try again
          </span>
        </div>
      </div>
    );
  };

  const getShareButtonStyles = () => {
    return "w-full py-4 px-6 font-semibold text-lg border-2 bg-primary border-primary text-primary-foreground hover:bg-primary/90 relative overflow-hidden";
  };

  return (
    <div className="bg-gradient-to-br from-card via-card to-muted/50 rounded-2xl p-4 border border-border/50 shadow-lg">
      <div className="space-y-4">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-foreground mb-2">
            Share Your Victory!
          </h3>
          <p className="text-sm text-muted-foreground">
            Let everyone know about your historical prowess
          </p>
        </div>

        {/* Results Preview */}
        <div className="bg-background/80 rounded-xl p-4 border border-border/30">
          {/* Wordle-style Timeline */}
          <div className="text-center mb-4">
            <div className="font-mono leading-tight text-lg mb-2" title="Your guess progression">
              {emojiBarcode.split('\n').map((line, index) => (
                <div key={index} className="tracking-wider">
                  {line}
                </div>
              ))}
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {hasWon ? `Solved in ${guesses.length} guess${guesses.length === 1 ? '' : 'es'}!` : 'So close!'}
            </p>
            
            {/* Closest guess information for lost games */}
            {!hasWon && closestGuess && targetYear && (
              <div className="mt-3 p-3 bg-muted/30 rounded-lg border border-border/20">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <span className="text-muted-foreground">Closest guess:</span>
                  <span className="font-medium text-foreground">
                    {formatYear(closestGuess.guess)}
                  </span>
                  <span className="text-muted-foreground">
                    ({closestGuess.distance} year{closestGuess.distance === 1 ? '' : 's'} off)
                  </span>
                  {closestGuess.distance <= 5 && (
                    <span className="text-lg" role="img" aria-label="excellent accuracy">
                      🏆
                    </span>
                  )}
                  {closestGuess.distance <= 25 && closestGuess.distance > 5 && (
                    <span className="text-lg" role="img" aria-label="good accuracy">
                      🎖️
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Share Button */}
        <RippleButton
          onClick={onShare}
          disabled={false}
          className={getShareButtonStyles()}
          rippleColor="rgba(255, 255, 255, 0.3)"
          aria-label="Copy results to clipboard and share"
        >
          {/* Background Overlays for smooth color transitions */}
          <div className={`absolute inset-0 bg-green-500 transition-all duration-300 ${shareStatus === 'success' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
          <div className={`absolute inset-0 bg-red-500 transition-all duration-300 ${shareStatus === 'error' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
          
          {/* Content */}
          <div className="relative z-10">
            {getShareButtonContent()}
          </div>
        </RippleButton>

        {/* Encouragement text */}
        <p className="text-center text-xs text-muted-foreground">
          Challenge your friends to beat your score!
        </p>
      </div>
    </div>
  );
};