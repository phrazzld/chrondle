'use client';

import React, { useEffect, useState } from 'react';
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useCountdown } from '@/hooks/useCountdown';
import { useShareGame } from '@/hooks/useShareGame';
import { Celebration } from '@/components/ui/Celebration';
import { CelebrationHeader } from '@/components/ui/CelebrationHeader';
import { ShareCard } from '@/components/ui/ShareCard';
import { EventsCard } from '@/components/ui/EventsCard';

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
  const { shareGame, shareStatus, emojiBarcode } = useShareGame(guesses, targetYear, hasWon);
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
        <DialogContent className="w-11/12 sm:min-w-[60%] max-w-6xl max-h-[85vh] overflow-y-auto px-8">
          <DialogHeader>
            <DialogTitle className="sr-only">Game Over Results</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Celebration Header */}
            <div className="animate-in slide-in-from-top duration-500">
              <CelebrationHeader 
                hasWon={hasWon}
                guesses={guesses}
                timeString={timeString}
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Share Section - Left */}
              <div className="animate-in slide-in-from-left duration-500 delay-150">
                <ShareCard
                  emojiBarcode={emojiBarcode}
                  hasWon={hasWon}
                  guesses={guesses}
                  onShare={handleShare}
                  shareStatus={shareStatus}
                />
              </div>

              {/* Events Section */}
              <div className="animate-in slide-in-from-bottom duration-500 delay-300">
                <EventsCard 
                  events={events}
                  targetYear={targetYear}
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};