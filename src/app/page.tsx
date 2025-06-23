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
        <main className="max-w-4xl mx-auto px-6 py-4">
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              CHRONDLE
            </h1>
            <p className="text-sm md:text-base" style={{ color: 'var(--muted-foreground)' }}>
              Guess the year of the historical event
            </p>
          </div>
          
          <div className="w-full max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div 
                  className="relative p-8 rounded-lg shadow-lg"
                  style={{ background: 'var(--primary)' }}
                >
                  <div className="absolute top-4 left-4">
                    <span className="text-2xl font-bold text-white opacity-90">01</span>
                  </div>
                  <div className="pt-6">
                    <EventDisplay 
                      event={null}
                      isLoading={true}
                      error={null}
                    />
                  </div>
                </div>
              </div>
              <div className="lg:col-span-1">
                <div 
                  className="relative p-6 rounded-lg shadow-lg h-full flex items-center justify-center"
                  style={{ background: 'var(--card)', border: '2px solid var(--border)' }}
                >
                  <div className="absolute top-4 left-4">
                    <span 
                      className="text-xl font-bold opacity-90"
                      style={{ color: 'var(--primary)' }}
                    >
                      02
                    </span>
                  </div>
                  <div className="text-center" style={{ color: 'var(--muted-foreground)' }}>
                    <p>Loading game interface...</p>
                  </div>
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
      <main className="max-w-4xl mx-auto px-6 py-4">
        {/* Compact Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
            CHRONDLE
          </h1>
          <p className="text-sm md:text-base" style={{ color: 'var(--muted-foreground)' }}>
            Guess the year of the historical event
          </p>
        </div>

        {/* Industrial Game Layout */}
        <div className="w-full max-w-6xl mx-auto">
          
          {/* Debug Banner */}
          <DebugBanner 
            isVisible={debugMode}
            debugParams={debugParams}
            className="mb-6"
          />

          {/* Main Game Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Section 01 - Event Display */}
            <div className="lg:col-span-2">
              <div 
                className="relative p-8 rounded-lg shadow-lg"
                style={{ background: 'var(--primary)' }}
              >
                {/* Section Number */}
                <div className="absolute top-4 left-4">
                  <span className="text-2xl font-bold text-white opacity-90">01</span>
                </div>
                
                {/* Event Content */}
                <div className="pt-6">
                  <EventDisplay 
                    event={gameLogic.currentEvent}
                    isLoading={gameLogic.isLoading}
                    error={gameLogic.error}
                  />
                </div>
              </div>
            </div>

            {/* Section 02 - Guess Input */}
            <div className="lg:col-span-1">
              <div 
                className="relative p-6 rounded-lg shadow-lg h-full"
                style={{ background: 'var(--card)', border: '2px solid var(--border)' }}
              >
                {/* Section Number */}
                <div className="absolute top-4 left-4">
                  <span 
                    className="text-xl font-bold opacity-90"
                    style={{ color: 'var(--primary)' }}
                  >
                    02
                  </span>
                </div>
                
                {/* Input Content */}
                <div className="pt-8">
                  <GuessInput
                    onGuess={gameLogic.makeGuess}
                    disabled={gameLogic.isGameComplete || gameLogic.isLoading}
                    remainingGuesses={gameLogic.remainingGuesses}
                    maxGuesses={6}
                    onValidationError={handleValidationError}
                  />
                </div>
              </div>
            </div>

            {/* Section 03 - Guess History */}
            <div className="lg:col-span-3 mt-6">
              <div 
                className="relative p-6 rounded-lg shadow-lg"
                style={{ background: 'var(--card)', border: '2px solid var(--border)' }}
              >
                {/* Section Number */}
                <div className="absolute top-4 left-4">
                  <span 
                    className="text-xl font-bold opacity-90"
                    style={{ color: 'var(--primary)' }}
                  >
                    03
                  </span>
                </div>
                
                {/* History Content */}
                <div className="pt-8">
                  <GuessHistory
                    guesses={gameLogic.gameState.guesses}
                    targetYear={gameLogic.gameState.puzzle?.year || 0}
                    events={gameLogic.gameState.puzzle?.events || []}
                  />
                </div>
              </div>
            </div>

          </div>
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