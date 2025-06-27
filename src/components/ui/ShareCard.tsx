'use client';

import React from 'react';
import { RippleButton } from '@/components/magicui/ripple-button';
import { ShareStatus } from '@/hooks/useShareGame';

interface ShareCardProps {
  emojiBarcode: string;
  hasWon: boolean;
  guesses: number[];
  onShare: () => void;
  shareStatus: ShareStatus;
}

export const ShareCard: React.FC<ShareCardProps> = ({
  emojiBarcode,
  hasWon,
  guesses,
  onShare,
  shareStatus
}) => {
  const getShareButtonContent = () => {
    switch (shareStatus) {
      case 'copying':
        return (
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            <span>Copying...</span>
          </div>
        );
      case 'success':
        return (
          <div className="flex items-center justify-center gap-3">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Link copied!</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center justify-center gap-3">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Try again</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center gap-3">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            <span>Share Results</span>
          </div>
        );
    }
  };

  const getShareButtonStyles = () => {
    const baseStyles = "w-full py-4 px-6 font-semibold text-lg transition-all duration-300 border-2";
    
    switch (shareStatus) {
      case 'success':
        return `${baseStyles} bg-green-500 border-green-600 text-white hover:bg-green-600`;
      case 'error':
        return `${baseStyles} bg-red-500 border-red-600 text-white hover:bg-red-600`;
      default:
        return `${baseStyles} bg-primary border-primary text-primary-foreground hover:bg-primary/90`;
    }
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
          </div>

        </div>

        {/* Share Button */}
        <RippleButton
          onClick={onShare}
          disabled={shareStatus === 'copying'}
          className={getShareButtonStyles()}
          rippleColor="rgba(255, 255, 255, 0.3)"
          aria-label="Copy results to clipboard and share"
        >
          {getShareButtonContent()}
        </RippleButton>

        {/* Encouragement text */}
        <p className="text-center text-xs text-muted-foreground">
          Challenge your friends to beat your score!
        </p>
      </div>
    </div>
  );
};