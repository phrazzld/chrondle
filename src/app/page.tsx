'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  markPlayerAsPlayed,
  hasPlayerPlayedBefore 
} from '@/lib/storage';
import { useGameState } from '@/hooks/useGameState';
import { HelpModal } from '@/components/modals/HelpModal';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { GameOverModal } from '@/components/modals/GameOverModal';
import { EventDisplay } from '@/components/EventDisplay';
import { GuessInput } from '@/components/GuessInput';
import { GuessHistory } from '@/components/GuessHistory';
import { DebugBanner } from '@/components/DebugBanner';
import { AppHeader } from '@/components/AppHeader';

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
              <div className="card border-2 border-primary/20 !p-6">
                <div className="flex items-start gap-4">
                  <div className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                    1
                  </div>
                  <div className="flex-1">
                    <div className="mb-3">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Hint 1 of 6
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
      
      <AppHeader 
        onShowHelp={() => setShowHelpModal(true)}
        onShowSettings={() => setShowSettingsModal(true)}
      />

      {/* Main Content Area */}
      <main className="min-h-screen">
        <div className="max-w-xl mx-auto px-4 py-6 space-y-5">
          
          {/* Debug Banner */}
          <DebugBanner 
            isVisible={debugMode}
            debugParams={debugParams}
            className="mb-6"
          />

          {/* Current Hint Display */}
          <div className="relative">
            <div className="card border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 !p-6">
              <div className="flex items-start gap-4">
                <div className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                  {gameLogic.currentHintIndex + 1}
                </div>
                <div className="flex-1">
                  <div className="mb-3">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Hint {gameLogic.currentHintIndex + 1} of 6
                    </span>
                  </div>
                  <div className="text-lg leading-relaxed" style={{ color: 'var(--foreground)' }}>
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

          {/* Upcoming Hints Preview */}
          {!gameLogic.isGameComplete && gameLogic.gameState.puzzle && (
            <div className="card bg-surface border-dashed !p-4">
              <div className="mb-3">
                <h3 className="text-base font-medium text-muted-foreground">Upcoming Hints</h3>
              </div>
              <div className="space-y-2">
                {gameLogic.gameState.puzzle.events.slice(gameLogic.currentHintIndex + 1).map((_, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                    <div className="w-5 h-5 bg-muted text-white rounded-full flex items-center justify-center text-xs font-bold">
                      🔒
                    </div>
                    <span className="text-muted-foreground text-xs">
                      Hint {gameLogic.currentHintIndex + index + 2} of 6
                    </span>
                  </div>
                ))}
              </div>
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