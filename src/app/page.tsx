'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  markPlayerAsPlayed,
  hasPlayerPlayedBefore 
} from '@/lib/storage';
import { getGuessDirectionInfo, formatYear } from '@/lib/utils';
import { getEnhancedProximityFeedback } from '@/lib/enhancedFeedback';
import { useGameState } from '@/hooks/useGameState';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { useStreak } from '@/hooks/useStreak';
import { HelpModal } from '@/components/modals/HelpModal';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { StatsModal } from '@/components/modals/StatsModal';
import { SyncModal } from '@/components/modals/SyncModal';
import { GameOverModal } from '@/components/modals/GameOverModal';
import { HintReviewModal } from '@/components/modals/HintReviewModal';
import { EventDisplay } from '@/components/EventDisplay';
import { EnhancedGuessInput } from '@/components/EnhancedGuessInput';
import { GuessHistory } from '@/components/GuessHistory';
import { DebugBanner } from '@/components/DebugBanner';
import { AppHeader } from '@/components/AppHeader';
import { LiveAnnouncer } from '@/components/ui/LiveAnnouncer';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StickyFooter } from '@/components/ui/StickyFooter';
import { ViewportDebug } from '@/components/dev/ViewportDebug';
import { AchievementModal } from '@/components/modals/AchievementModal';
import { BackgroundAnimation } from '@/components/BackgroundAnimation';

// Force dynamic rendering to prevent SSR issues with theme context
export const dynamic = 'force-dynamic';

export default function ChronldePage() {
  
  // SSR state
  const [mounted, setMounted] = useState(false);
  
  // Debug state
  const [debugMode, setDebugMode] = useState(false);
  const [debugParams, setDebugParams] = useState('');
  
  // Game state management using custom hook
  const gameLogic = useGameState(debugMode);
  
  // Streak system
  const { 
    streakData, 
    updateStreak, 
    hasNewAchievement, 
    newAchievement, 
    clearNewAchievement 
  } = useStreak();
  
  // UI state
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [validationError, setValidationError] = useState('');
  
  // Accessibility announcements
  const [announcement, setAnnouncement] = useState('');
  const [lastGuessCount, setLastGuessCount] = useState(0);
  
  // Hint review modal state
  const [hintReviewModal, setHintReviewModal] = useState<{
    isOpen: boolean;
    guessNumber: number;
    guess: number;
    hint: string;
  } | null>(null);

  // Handle game over modal trigger and streak update
  useEffect(() => {
    if (gameLogic.isGameComplete && gameLogic.gameState.puzzle) {
      // Update streak based on game result
      if (!debugMode) {
        const hasWon = gameLogic.hasWon;
        updateStreak(hasWon);
      }
      
      setTimeout(() => setShowGameOverModal(true), 500);
    }
  }, [gameLogic.isGameComplete, gameLogic.gameState.puzzle, gameLogic.hasWon, updateStreak, debugMode]);
  
  // Show help modal for first-time players
  useEffect(() => {
    if (!gameLogic.isLoading && !hasPlayerPlayedBefore() && !debugMode) {
      setShowHelpModal(true);
    }
  }, [gameLogic.isLoading, debugMode]);

  // Announce guess feedback for screen readers
  useEffect(() => {
    const currentGuessCount = gameLogic.gameState.guesses.length;
    
    // Only announce when a new guess has been made
    if (currentGuessCount > lastGuessCount && currentGuessCount > 0 && gameLogic.gameState.puzzle) {
      const latestGuess = gameLogic.gameState.guesses[currentGuessCount - 1];
      const targetYear = gameLogic.gameState.puzzle.year;
      
      if (latestGuess === targetYear) {
        setAnnouncement(`Correct! The year was ${formatYear(targetYear)}. Congratulations!`);
      } else {
        const directionInfo = getGuessDirectionInfo(latestGuess, targetYear);
        const enhancedFeedback = getEnhancedProximityFeedback(latestGuess, targetYear, {
          previousGuesses: gameLogic.gameState.guesses.slice(0, -1),
          includeHistoricalContext: true,
          includeProgressiveTracking: true
        });
        const cleanDirection = directionInfo.direction.toLowerCase().replace('▲', '').replace('▼', '').trim();
        setAnnouncement(`${formatYear(latestGuess)} is ${cleanDirection}. ${enhancedFeedback.encouragement}${enhancedFeedback.historicalHint ? ` ${enhancedFeedback.historicalHint}` : ''}${enhancedFeedback.progressMessage ? ` ${enhancedFeedback.progressMessage}` : ''}`);
      }
      
      setLastGuessCount(currentGuessCount);
    }
  }, [gameLogic.gameState.guesses, gameLogic.gameState.puzzle, lastGuessCount]);

  // Mount effect
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize game on mount
  useEffect(() => {
    if (!mounted) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const isDebug = urlParams.get('debug') === 'true';
    setDebugMode(isDebug);
    
    if (isDebug) {
      const activeParams = [];
      if (urlParams.get('year')) activeParams.push(`year=${urlParams.get('year')}`);
      if (urlParams.get('scenario')) activeParams.push(`scenario=${urlParams.get('scenario')}`);
      setDebugParams(activeParams.length ? activeParams.join(' | ') : 'Basic debug mode');
    }

    // Register service worker for notifications
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('📱 Service Worker registered successfully:', registration);
        })
        .catch((error) => {
          console.log('📱 Service Worker registration failed:', error);
        });
    }

  }, [mounted]);


  // Handle validation errors from GuessInput component
  const handleValidationError = useCallback((message: string) => {
    setValidationError(message);
    setTimeout(() => setValidationError(''), 2000);
  }, []);

  // Handle progress bar segment clicks
  const handleSegmentClick = useCallback((index: number, guess: number, hint: string) => {
    setHintReviewModal({
      isOpen: true,
      guessNumber: index + 1,
      guess,
      hint
    });
  }, []);

  const closeHintReviewModal = useCallback(() => {
    setHintReviewModal(null);
  }, []);

  // Gesture navigation for reviewing hints
  const navigateToHint = useCallback((direction: 'prev' | 'next') => {
    if (!gameLogic.gameState.puzzle || gameLogic.gameState.guesses.length === 0) return;

    const currentIndex = hintReviewModal?.guessNumber ? hintReviewModal.guessNumber - 1 : 0;
    const maxIndex = gameLogic.gameState.guesses.length - 1;
    
    let newIndex: number;
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : maxIndex;
    } else {
      newIndex = currentIndex < maxIndex ? currentIndex + 1 : 0;
    }

    const guess = gameLogic.gameState.guesses[newIndex];
    const hint = gameLogic.gameState.puzzle.events[newIndex + 1] || 'No more hints available.';
    
    setHintReviewModal({
      isOpen: true,
      guessNumber: newIndex + 1,
      guess,
      hint
    });
  }, [hintReviewModal?.guessNumber, gameLogic.gameState.guesses, gameLogic.gameState.puzzle]);

  // Swipe navigation for hint review when modal is open
  const handleSwipeNavigate = useCallback((index: number) => {
    if (!gameLogic.gameState.puzzle || gameLogic.gameState.guesses.length === 0) return;

    const guess = gameLogic.gameState.guesses[index];
    const hint = gameLogic.gameState.puzzle.events[index + 1] || 'No more hints available.';
    
    setHintReviewModal({
      isOpen: true,
      guessNumber: index + 1,
      guess,
      hint
    });
  }, [gameLogic.gameState.guesses, gameLogic.gameState.puzzle]);

  // Use the sophisticated swipe navigation hook when modal is open
  const { touchHandlers } = useSwipeNavigation({
    totalHints: gameLogic.gameState.guesses.length,
    currentIndex: hintReviewModal ? hintReviewModal.guessNumber - 1 : 0,
    onNavigate: handleSwipeNavigate,
    enabled: Boolean(hintReviewModal?.isOpen) && gameLogic.gameState.guesses.length > 1
  });

  const closeHelpModal = () => {
    setShowHelpModal(false);
    markPlayerAsPlayed();
  };

  // Prevent SSR mismatch
  if (!mounted) {
    return null;
  }

  if (gameLogic.isLoading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--background)' }}>
        <AppHeader 
          onShowHelp={() => setShowHelpModal(true)}
          onShowSettings={() => setShowSettingsModal(true)}
          onShowStats={() => setShowStatsModal(true)}
          onShowSync={() => setShowSyncModal(true)}
        />

        {/* Loading Content */}
        <main className="min-h-screen">
          <div className="max-w-xl mx-auto px-4 py-6 space-y-5 main-content-mobile section-spacing-mobile">
            
            {/* Loading Hint Display */}
            <div className="relative">
              <div className="card border-2 border-primary/20 card-padding-override card-mobile-compact hint-display-mobile">
                <div className="flex items-start gap-4">
                  <div className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="flex-1">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Hint 1
                        </span>
                        <div className="flex gap-1" aria-hidden="true">
                          {[...Array(6)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                                i < 1 ? 'bg-primary' : 'bg-border'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        5 more hints available
                      </span>
                    </div>
                    <div className="text-lg leading-relaxed" style={{ color: 'var(--foreground)' }}>
                      <EventDisplay 
                        event={null}
                        isLoading={true}
                        error={null}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading Progress Bar */}
            <div className="progress-bar-container relative w-full opacity-50">
              <div className="progress-track relative h-12 md:h-14 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="segment relative flex-1 h-full border-r border-white/20 dark:border-black/20 last:border-r-0"
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-400 dark:text-gray-600">
                          {i + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Loading Input Section */}
            <div className="card bg-surface card-mobile-compact input-section-mobile">
              <div className="flex gap-3 items-center">
                <div className="flex-1">
                  <div className="w-full p-3 text-lg text-center rounded-lg border-2 bg-input border-border opacity-50">
                    Enter year (e.g., 1969)
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="btn-primary px-6 opacity-50">Submit</div>
                  <span className="text-xs text-muted-foreground">1/6</span>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      
      {/* Background Animation */}
      <BackgroundAnimation
        guesses={gameLogic.gameState.guesses}
        targetYear={gameLogic.gameState.puzzle?.year || null}
        isGameOver={gameLogic.isGameComplete}
      />
      
      {/* Skip Navigation Link */}
      <a 
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-white p-2 rounded-lg border-2 border-primary text-primary font-semibold"
        tabIndex={1}
      >
        Skip to main content
      </a>
      
      <AppHeader 
        onShowHelp={() => setShowHelpModal(true)}
        onShowSettings={() => setShowSettingsModal(true)}
        onShowStats={() => setShowStatsModal(true)}
        onShowSync={() => setShowSyncModal(true)}
        streakData={streakData}
      />

      {/* Main Content Area */}
      <main 
        id="main-content"
        className={`min-h-screen ${gameLogic.gameState.guesses.length > 0 ? 'gesture-enabled' : ''}`}
        role="main"
        aria-label="Historical guessing game"
      >
        <div className="max-w-xl mx-auto px-4 py-6 space-y-5 main-content-mobile section-spacing-mobile vh-optimized">
          
          {/* Debug Banner */}
          <DebugBanner 
            isVisible={debugMode}
            debugParams={debugParams}
            className="mb-6"
          />

          {/* Current Hint Display */}
          <div 
            className="relative"
            role="region"
            aria-label={`Historical hint ${gameLogic.currentHintIndex + 1} of 6`}
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="card border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 card-padding-override card-mobile-compact hint-display-mobile">
              <div className="flex items-start gap-4">
                <div 
                  className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                >
                  {gameLogic.currentHintIndex + 1}
                </div>
                <div className="flex-1">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Hint {gameLogic.currentHintIndex + 1}
                      </span>
                      {/* Compact hint progress indicator */}
                      <div className="flex gap-1" aria-hidden="true">
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                              i <= gameLogic.currentHintIndex ? 'bg-primary' : 'bg-border'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span 
                      className="text-xs text-muted-foreground"
                      aria-label={`${6 - (gameLogic.currentHintIndex + 1)} additional hints remaining`}
                    >
                      {6 - (gameLogic.currentHintIndex + 1)} more hints available
                    </span>
                  </div>
                  <div 
                    className="text-lg leading-relaxed text-density-mobile" 
                    style={{ color: 'var(--foreground)' }}
                    aria-label={gameLogic.currentEvent ? `Hint ${gameLogic.currentHintIndex + 1}: ${gameLogic.currentEvent}` : undefined}
                  >
                    <EventDisplay 
                      event={gameLogic.currentEvent}
                      isLoading={gameLogic.isLoading}
                      error={gameLogic.error}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Progress Bar */}
          <ProgressBar
            guesses={gameLogic.gameState.guesses}
            targetYear={gameLogic.gameState.puzzle?.year || 0}
            events={gameLogic.gameState.puzzle?.events || []}
            maxGuesses={6}
            onSegmentClick={handleSegmentClick}
            className="mb-5 progress-bar-mobile"
          />
          
          {/* Gesture Navigation Hint */}
          {gameLogic.gameState.guesses.length > 0 && (
            <div className="gesture-hint">
              Swipe left/right to navigate between guesses
            </div>
          )}

          {/* Guess Input Section */}
          <div className="card bg-surface card-mobile-compact input-section-mobile">
            <EnhancedGuessInput
              onGuess={gameLogic.makeGuess}
              disabled={gameLogic.isGameComplete || gameLogic.isLoading}
              remainingGuesses={gameLogic.remainingGuesses}
              maxGuesses={6}
              onValidationError={handleValidationError}
            />
          </div>

          {/* Guess History */}
          {gameLogic.gameState.guesses.length > 0 && (
            <div className="card card-mobile-compact">
              <GuessHistory
                guesses={gameLogic.gameState.guesses}
                targetYear={gameLogic.gameState.puzzle?.year || 0}
                events={gameLogic.gameState.puzzle?.events || []}
              />
            </div>
          )}


        </div>
      </main>

      {/* Validation Error Feedback */}
      {validationError && (
        <div 
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg text-white font-medium shadow-lg z-50"
          style={{ background: 'var(--error)' }}
        >
          {validationError}
        </div>
      )}

      {/* Live Announcements for Screen Readers */}
      <LiveAnnouncer message={announcement} priority="polite" />

      {/* How to Play Modal */}
      <HelpModal 
        isOpen={showHelpModal}
        onClose={closeHelpModal}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />

      {/* Stats Modal */}
      <StatsModal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        streakData={streakData}
      />

      {/* Sync Modal */}
      <SyncModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
      />

      {/* Game Over Modal */}
      {gameLogic.gameState.puzzle && (
        <GameOverModal
          isOpen={showGameOverModal}
          onClose={() => setShowGameOverModal(false)}
          hasWon={gameLogic.hasWon}
          targetYear={gameLogic.gameState.puzzle.year}
          guesses={gameLogic.gameState.guesses}
          events={gameLogic.gameState.puzzle.events}
        />
      )}
      
      {/* Hint Review Modal */}
      {hintReviewModal && (
        <HintReviewModal
          isOpen={hintReviewModal.isOpen}
          onClose={closeHintReviewModal}
          guessNumber={hintReviewModal.guessNumber}
          guess={hintReviewModal.guess}
          targetYear={gameLogic.gameState.puzzle?.year || 0}
          hint={hintReviewModal.hint}
          totalGuesses={gameLogic.gameState.guesses.length}
          onNavigate={navigateToHint}
          touchHandlers={touchHandlers}
        />
      )}

      {/* Sticky Footer */}
      <StickyFooter
        guesses={gameLogic.gameState.guesses}
        targetYear={gameLogic.gameState.puzzle?.year || 0}
        isVisible={gameLogic.gameState.guesses.length > 0 && !gameLogic.isLoading}
        hasOpenModal={showHelpModal || showSettingsModal || showStatsModal || showSyncModal || showGameOverModal || Boolean(hintReviewModal?.isOpen) || hasNewAchievement}
      />

      {/* Development Viewport Debug Indicator */}
      <ViewportDebug isVisible={debugMode} />

      {/* Achievement Modal */}
      <AchievementModal
        isOpen={hasNewAchievement}
        onClose={clearNewAchievement}
        achievement={newAchievement || ''}
      />

    </div>
  );
}