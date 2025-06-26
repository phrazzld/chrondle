'use client';

import React, { useEffect, useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatYear } from '@/lib/utils';
import { useCountdown } from '@/hooks/useCountdown';
import { useShareGame } from '@/hooks/useShareGame';
import { Celebration } from '@/components/ui/Celebration';

interface GameOverModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasWon: boolean;
  targetYear: number;
  guesses: number[];
  events: string[];
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  onClose,
  hasWon,
  targetYear,
  guesses,
  events
}) => {
  const { timeString } = useCountdown();
  const { shareGame, shareStatus, compactShareText, emojiBarcode } = useShareGame(guesses, targetYear, hasWon);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Handle share button click
  const handleShare = async () => {
    await shareGame();
  };

  // Update feedback message based on share status
  useEffect(() => {
    if (shareStatus === 'success') {
      setFeedbackMessage('Copied to clipboard!');
    } else if (shareStatus === 'error') {
      setFeedbackMessage('Failed to copy!');
    }
  }, [shareStatus]);

  // Clear feedback message after delay
  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => setFeedbackMessage(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

  return (
    <>
      <Celebration />
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-center">
              {hasWon ? "You got it!" : "So close!"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-8">
            
            {/* Header Row */}
            <div className="text-center">
              <p className="text-lg text-foreground">
                The correct year was <strong>{formatYear(targetYear)}</strong>.
              </p>
            </div>

        {/* Content Row - Events & Share */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
            {/* Events Section */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">
                Events from this year:
              </h3>
              <div className="p-4 rounded-lg bg-secondary border">
                <ul className="space-y-2">
                  {events.map((event, index) => (
                    <li 
                      key={index} 
                      className="flex items-start gap-2 text-sm leading-relaxed text-foreground"
                    >
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 bg-primary" />
                      {event}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Share Section */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">
                Share Your Results
              </h3>
              
              {/* Emoji Barcode Preview */}
              <div className="p-4 rounded-lg text-center bg-secondary border">
                <div className="emoji-timeline-large mb-3" title="Your guess progression">
                  {emojiBarcode}
                </div>
                <p className="text-sm text-muted-foreground">
                  {hasWon ? `Solved in ${guesses.length} guesses!` : 'Better luck tomorrow!'}
                </p>
              </div>
              
              {/* Share Preview */}
              <div className="p-4 rounded-lg bg-secondary border">
                <pre className="font-mono whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {compactShareText}
                </pre>
              </div>
            </div>
        </div>

          {/* Action Row - Full Width */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Next Game Countdown */}
            <div className="p-4 rounded-lg text-center bg-muted border">
              <p className="text-sm font-medium mb-1 text-muted-foreground">
                NEXT CHRONDLE
              </p>
              <p className="text-xl font-bold font-mono text-primary">
                {timeString}
              </p>
            </div>

            {/* Share Button */}
            <div className="p-4 rounded-lg text-center bg-muted border">
              <Button
                onClick={handleShare}
                disabled={shareStatus === 'copying'}
                className={`w-full px-6 py-3 font-medium transition-all duration-200 ${
                  shareStatus === 'success' ? 'bg-green-600 hover:bg-green-700' :
                  shareStatus === 'error' ? 'bg-red-600 hover:bg-red-700' : ''
                }`}
                aria-label="Copy results to clipboard"
              >
                {shareStatus === 'copying' ? 'Copying...' :
                 shareStatus === 'success' ? '✓ Copied!' :
                 shareStatus === 'error' ? '✗ Failed' :
                 '📋 Share Results'}
              </Button>
              {feedbackMessage && (
                <p className="text-sm mt-2 text-muted-foreground">
                  {feedbackMessage}
                </p>
              )}
            </div>
          </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};