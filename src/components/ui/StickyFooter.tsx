'use client';

import React from 'react';
import { getYesterdayYear } from '@/lib/utils';
import { useShareGame } from '@/hooks/useShareGame';
import { SUPPORTED_YEARS } from '@/lib/puzzleData';

interface StickyFooterProps {
  /** User's guesses for the current game */
  guesses: number[];
  /** Target year for the current puzzle */
  targetYear: number;
  /** Whether to show the footer */
  isVisible: boolean;
  /** Whether any modal is currently open (to hide footer) */
  hasOpenModal?: boolean;
}

export const StickyFooter: React.FC<StickyFooterProps> = ({
  guesses,
  targetYear,
  isVisible,
  hasOpenModal = false
}) => {
  const hasWon = guesses.includes(targetYear);
  const { shareGame, shareStatus, emojiBarcode } = useShareGame(guesses, targetYear, hasWon);

  // Handle share button click
  const handleShare = async () => {
    if (guesses.length === 0) return;
    await shareGame();
  };

  // Handle "Play Yesterday" click
  const handlePlayYesterday = () => {
    // Get yesterday's puzzle year using the same deterministic logic
    const yesterdayYear = getYesterdayYear(SUPPORTED_YEARS);
    
    // Navigate to yesterday's puzzle using debug mode with specific year
    const url = new URL(window.location.href);
    url.searchParams.set('debug', 'true');
    url.searchParams.set('year', yesterdayYear.toString());
    window.location.href = url.toString();
  };


  if (!isVisible || guesses.length === 0 || hasOpenModal) {
    return null;
  }

  return (
    <>
      {/* Spacer to prevent content from being hidden behind footer */}
      <div className="sticky-footer-spacer" />
      
      {/* Sticky Footer */}
      <footer 
        className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border shadow-lg sticky-footer"
        role="contentinfo"
        aria-label="Game actions and navigation"
      >
        <div className="max-w-xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            
            {/* Share Results */}
            <button
              onClick={handleShare}
              disabled={shareStatus === 'copying'}
              className={`flex-1 footer-btn py-2 px-4 text-sm font-semibold ${
                shareStatus === 'success' ? 'share-button-success' :
                shareStatus === 'error' ? 'share-button-error' :
                'btn-primary'
              }`}
              aria-label="Share your results"
              title={`${emojiBarcode} ${hasWon ? `Solved in ${guesses.length}!` : 'Try again tomorrow!'}`}
            >
              <span className="text-base">
                {shareStatus === 'copying' ? '⏳' :
                 shareStatus === 'success' ? '✓' :
                 shareStatus === 'error' ? '✗' :
                 '📤'}
              </span>
              <span className="hidden sm:inline">
                {shareStatus === 'copying' ? 'Copying...' :
                 shareStatus === 'success' ? 'Copied!' :
                 shareStatus === 'error' ? 'Failed' :
                 'Share Results'}
              </span>
              <span className="sm:hidden">
                {shareStatus === 'copying' ? '...' :
                 shareStatus === 'success' ? '✓' :
                 shareStatus === 'error' ? '✗' :
                 'Share'}
              </span>
            </button>

            {/* Yesterday's Puzzle */}
            <button
              onClick={handlePlayYesterday}
              className="flex-1 footer-btn footer-btn-secondary py-2 px-4 text-sm font-semibold rounded-lg"
              aria-label="Play yesterday's puzzle"
            >
              <span className="text-base">📅</span>
              <span className="hidden sm:inline">Yesterday</span>
              <span className="sm:hidden">Prev</span>
            </button>

            {/* Archive/Browse */}
            <button
              onClick={() => {
                // Future: Open archive modal or navigate to archive page
                // For now, just show yesterday
                handlePlayYesterday();
              }}
              className="flex-1 footer-btn footer-btn-secondary py-2 px-4 text-sm font-semibold rounded-lg"
              aria-label="Browse puzzle archive"
            >
              <span className="text-base">📚</span>
              <span className="hidden sm:inline">Archive</span>
              <span className="sm:hidden">More</span>
            </button>
          </div>

        </div>
      </footer>
    </>
  );
};