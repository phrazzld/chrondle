'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  markPlayerAsPlayed,
  hasPlayerPlayedBefore 
} from '@/lib/storage';
import { getGuessDirectionInfo, formatYear } from '@/lib/utils';
import { useGameState } from '@/hooks/useGameState';
import { HelpModal } from '@/components/modals/HelpModal';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { GameOverModal } from '@/components/modals/GameOverModal';
import { EventDisplay } from '@/components/EventDisplay';
import { GuessInput } from '@/components/GuessInput';
import { GuessHistory } from '@/components/GuessHistory';
import { DebugBanner } from '@/components/DebugBanner';
import { AppHeader } from '@/components/AppHeader';
import { LiveAnnouncer } from '@/components/ui/LiveAnnouncer';

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
  
  // UI state
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [validationError, setValidationError] = useState('');
  
  // Accessibility announcements
  const [announcement, setAnnouncement] = useState('');
  const [lastGuessCount, setLastGuessCount] = useState(0);

  // Handle game over modal trigger
  useEffect(() => {
    if (gameLogic.isGameComplete && gameLogic.gameState.puzzle) {
      setTimeout(() => setShowGameOverModal(true), 500);
    }
  }, [gameLogic.isGameComplete, gameLogic.gameState.puzzle]);
  
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
        const distance = Math.abs(latestGuess - targetYear);
        const distanceText = distance === 1 ? '1 year' : `${distance} years`;
        setAnnouncement(`${formatYear(latestGuess)} is ${directionInfo.direction.toLowerCase().replace('▲', '').replace('▼', '').trim()}. Off by ${distanceText}.`);
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

  }, [mounted]);


  // Handle validation errors from GuessInput component
  const handleValidationError = useCallback((message: string) => {
    setValidationError(message);
    setTimeout(() => setValidationError(''), 2000);
  }, []);


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
        />

        {/* Loading Content */}
        <main className="min-h-screen">
          <div className="max-w-xl mx-auto px-4 py-6 space-y-5">
            
            {/* Loading Hint Display */}
            <div className="relative">
              <div className="card border-2 border-primary/20 card-padding-override">
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
                        <div className="flex gap-1">
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

            {/* Loading Input Section */}
            <div className="card bg-surface">
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
      />

      {/* Main Content Area */}
      <main 
        id="main-content"
        className="min-h-screen"
        role="main"
        aria-label="Historical guessing game"
      >
        <div className="max-w-xl mx-auto px-4 py-6 space-y-5">
          
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
            <div className="card border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 card-padding-override">
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
                      <div 
                        className="flex gap-1"
                        role="progressbar"
                        aria-valuenow={gameLogic.currentHintIndex + 1}
                        aria-valuemin={1}
                        aria-valuemax={6}
                        aria-label={`Hint progress: ${gameLogic.currentHintIndex + 1} of 6 hints revealed`}
                      >
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                              i <= gameLogic.currentHintIndex ? 'bg-primary' : 'bg-border'
                            }`}
                            aria-hidden="true"
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
                    className="text-lg leading-relaxed" 
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

          {/* Guess Input Section */}
          <div className="card bg-surface">
            <GuessInput
              onGuess={gameLogic.makeGuess}
              disabled={gameLogic.isGameComplete || gameLogic.isLoading}
              remainingGuesses={gameLogic.remainingGuesses}
              maxGuesses={6}
              onValidationError={handleValidationError}
            />
          </div>

          {/* Guess History */}
          {gameLogic.gameState.guesses.length > 0 && (
            <div className="card">
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

    </div>
  );
}