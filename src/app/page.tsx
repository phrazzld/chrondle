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
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { HelpModal } from '@/components/modals/HelpModal';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { StatsModal } from '@/components/modals/StatsModal';
import { GameOverModal } from '@/components/modals/GameOverModal';
import { HintReviewModal } from '@/components/modals/HintReviewModal';
import { GameProgress } from '@/components/GameProgress';
import { HintsDisplay } from '@/components/HintsDisplay';
import { GuessInput } from '@/components/GuessInput';
import { GameInstructions } from '@/components/GameInstructions';
import { DebugBanner } from '@/components/DebugBanner';
import { AppHeader } from '@/components/AppHeader';
import { LiveAnnouncer } from '@/components/ui/LiveAnnouncer';
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

  const closeHintReviewModal = useCallback(() => {
    setHintReviewModal(null);
  }, []);

  // Handle hint click to open review modal
  const handleHintClick = useCallback((hintIndex: number) => {
    if (!gameLogic.gameState.puzzle || gameLogic.gameState.guesses.length === 0) return;
    
    const guess = gameLogic.gameState.guesses[hintIndex];
    const hint = gameLogic.gameState.puzzle.events[hintIndex + 1] || 'No more hints available.';
    
    setHintReviewModal({
      isOpen: true,
      guessNumber: hintIndex + 1,
      guess,
      hint
    });
  }, [gameLogic.gameState.guesses, gameLogic.gameState.puzzle]);

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
        />

        {/* Loading Content */}
        <main className="min-h-screen">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
            
              {/* Loading Instructions */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Guess the Year - Historical Events
                </h2>
                <div className="h-4 bg-muted animate-pulse rounded w-2/3 mx-auto"></div>
              </div>
              
              {/* Loading Input */}
              <div className="space-y-3">
                <div className="w-full p-3 text-2xl text-left font-bold h-16 rounded-lg border-2 bg-input border-border opacity-50 flex items-center">
                  e.g. 1969, -450
                </div>
                <Button className="w-full h-12 text-lg font-semibold opacity-50" disabled size="lg">
                  Submit
                </Button>
              </div>
              
              {/* Loading Progress */}
              <div className="flex justify-center gap-2 py-2">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                ))}
              </div>

              {/* Loading Hints */}
              <div className="space-y-4">
                {/* Loading Current Hint */}
                <Card className="border-2 border-primary/20 shadow-md bg-gradient-to-br from-primary/5 to-primary/10">
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                        1
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider block">
                          🎯 Current Hint
                        </span>
                        <span className="text-xs text-muted-foreground">Hint 1 of 6</span>
                      </div>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-3"></div>
                      <span className="text-lg font-medium">Loading puzzle...</span>
                    </div>
                  </div>
                </Card>
                
                {/* Loading Placeholder Hints */}
                {Array.from({ length: 5 }, (_, i) => (
                  <Card key={i} className="bg-muted/20 border-dashed border-muted-foreground/30">
                    <div className="p-4 flex items-center gap-3">
                      <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-medium text-muted-foreground">
                        {i + 2}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Hint {i + 2} will be revealed after your next guess
                      </span>
                    </div>
                  </Card>
                ))}
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
        streakData={streakData}
      />

      {/* Main Content Area */}
      <main 
        id="main-content"
        className={`min-h-screen ${gameLogic.gameState.guesses.length > 0 ? 'gesture-enabled' : ''}`}
        role="main"
        aria-label="Historical guessing game"
      >
        <div className="max-w-6xl mx-auto px-6 py-6">
          
          {/* Debug Banner */}
          <DebugBanner 
            isVisible={debugMode}
            debugParams={debugParams}
            className="mb-6"
          />

          {/* Single Column Game Layout */}
          <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
            
            {/* Game Instructions */}
            <GameInstructions />
            
            {/* Input Section */}
            <GuessInput
              onGuess={gameLogic.makeGuess}
              disabled={gameLogic.isGameComplete || gameLogic.isLoading}
              remainingGuesses={gameLogic.remainingGuesses}
              onValidationError={handleValidationError}
            />
            
            {/* Progress Section */}
            <GameProgress
              currentHintIndex={gameLogic.currentHintIndex}
              isGameWon={gameLogic.hasWon}
            />
            
            {/* Hints Section */}
            <HintsDisplay
              events={gameLogic.gameState.puzzle?.events || []}
              guesses={gameLogic.gameState.guesses}
              targetYear={gameLogic.gameState.puzzle?.year || 0}
              currentHintIndex={gameLogic.currentHintIndex}
              isLoading={gameLogic.isLoading}
              error={gameLogic.error}
              onHintClick={handleHintClick}
            />

          </div>

          {/* Bottom padding for mobile */}
          <div className="h-20"></div>

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