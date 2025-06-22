'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '@/components/theme-provider';
import { 
  initializePuzzle, 
  type GameState, 
  saveProgress, 
  loadProgress
} from '@/lib/gameState';
import { getHistoricalEvents, sortEventsByRecognizability } from '@/lib/api';
import { 
  markPlayerAsPlayed,
  hasPlayerPlayedBefore 
} from '@/lib/storage';
import { 
  formatYear, 
  getGuessDirectionInfo, 
  formatCountdown, 
  getTimeUntilMidnight 
} from '@/lib/utils';
import { generateShareText } from '@/lib/utils';

// Force dynamic rendering to prevent SSR issues with theme context
export const dynamic = 'force-dynamic';

export default function ChronldePage() {
  const { darkMode, colorBlindMode, toggleDarkMode, toggleColorBlindMode } = useTheme();
  
  // SSR state
  const [mounted, setMounted] = useState(false);
  
  // Game state
  const [gameState, setGameState] = useState<GameState>({
    puzzle: null,
    guesses: [],
    maxGuesses: 6,
    isGameOver: false
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [guessInput, setGuessInput] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState('');
  const [countdown, setCountdown] = useState('');
  
  // Debug state
  const [debugMode, setDebugMode] = useState(false);
  const [debugParams, setDebugParams] = useState('');
  
  // Refs
  const guessInputRef = useRef<HTMLInputElement>(null);

  const initializeGame = useCallback(async () => {
    try {
      const puzzle = await initializePuzzle(getHistoricalEvents, sortEventsByRecognizability);
      
      // Create initial game state
      const initialGameState: GameState = {
        puzzle,
        guesses: [],
        maxGuesses: 6,
        isGameOver: false
      };
      
      // Load saved progress if not in debug mode
      if (!debugMode) {
        // The loadProgress function modifies the gameState in place
        loadProgress(initialGameState, debugMode);
        
        if (initialGameState.isGameOver) {
          setTimeout(() => setShowGameOverModal(true), 500);
        }
      }
      
      setGameState(initialGameState);
      
      setIsLoading(false);
      
      // Show help modal for first-time players
      if (!hasPlayerPlayedBefore() && !debugMode) {
        setShowHelpModal(true);
      }
    } catch (error) {
      console.error('Failed to initialize game:', error);
      setIsLoading(false);
    }
  }, [debugMode]);

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

    initializeGame();
  }, [mounted, initializeGame]);

  // Countdown timer effect
  useEffect(() => {
    if (showGameOverModal) {
      const interval = setInterval(() => {
        const timeLeft = getTimeUntilMidnight();
        setCountdown(formatCountdown(timeLeft));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [showGameOverModal]);

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (gameState.isGameOver || !gameState.puzzle) return;

    const guess = parseInt(guessInput, 10);
    if (isNaN(guess) || guess < -3000 || guess > new Date().getFullYear() || guess === 0) {
      setCopyFeedback('Please enter a valid year.');
      setTimeout(() => setCopyFeedback(''), 2000);
      return;
    }

    const newGuesses = [...gameState.guesses, guess];
    const isCorrect = guess === gameState.puzzle.year;
    const isLastGuess = newGuesses.length >= gameState.maxGuesses;
    const isGameOver = isCorrect || isLastGuess;

    setGameState(prev => ({
      ...prev,
      guesses: newGuesses,
      isGameOver
    }));

    setGuessInput('');
    
    // Save progress
    if (!debugMode) {
      saveProgress(gameState, debugMode);
    }

    if (isGameOver) {
      setTimeout(() => setShowGameOverModal(true), 500);
    }

    // Focus input for next guess
    setTimeout(() => guessInputRef.current?.focus(), 100);
  };

  const handleShare = () => {
    if (!gameState.puzzle) return;
    
    const shareText = generateShareText(gameState.guesses, gameState.puzzle.year);
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareText).then(() => {
      setCopyFeedback('Copied to clipboard!');
    }).catch(() => {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = shareText;
      textarea.style.position = 'fixed';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setCopyFeedback('Copied to clipboard!');
      } catch {
        setCopyFeedback('Failed to copy!');
      }
      document.body.removeChild(textarea);
    });
    
    setTimeout(() => setCopyFeedback(''), 2000);
  };

  const closeHelpModal = () => {
    setShowHelpModal(false);
    markPlayerAsPlayed();
  };

  const remaining = gameState.maxGuesses - gameState.guesses.length;
  const isInputDisabled = gameState.isGameOver || isLoading;

  // Prevent SSR mismatch
  if (!mounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl mx-auto">
          <header className="text-center mb-4 sm:mb-6">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-wider">Chrondle</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Guess the year of the historical event.</p>
          </header>
          
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 mb-4 text-center min-h-[80px] flex items-center justify-center">
            <p className="text-lg sm:text-xl font-semibold">
              <span className="spinner"></span>Loading today&apos;s historical puzzle...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen flex flex-col items-center justify-center p-4">
      
      {/* Settings and Help Icons */}
      <div className="absolute top-4 right-4 flex gap-3">
        <button 
          onClick={() => setShowHelpModal(true)}
          className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        <button 
          onClick={() => setShowSettingsModal(true)}
          className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Main Game Container */}
      <div className="w-full max-w-2xl mx-auto">
        
        {/* Header */}
        <header className="text-center mb-4 sm:mb-6">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-wider">Chrondle</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Guess the year of the historical event.</p>
        </header>

        {/* Debug Banner */}
        {debugMode && (
          <div className="bg-yellow-400 dark:bg-yellow-600 text-black p-2 text-center font-bold mb-4">
            🔧 DEBUG MODE ACTIVE - No progress saved | {debugParams}
          </div>
        )}

        {/* Primary Event Display */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 mb-4 text-center min-h-[80px] flex items-center justify-center">
          <p className="text-lg sm:text-xl font-semibold">
            {gameState.puzzle?.events[0] || 'Loading puzzle...'}
          </p>
        </div>

        {/* Guess Input */}
        <form onSubmit={handleGuessSubmit} className="flex items-center gap-2 mb-4">
          <input
            ref={guessInputRef}
            type="number"
            value={guessInput}
            onChange={(e) => setGuessInput(e.target.value)}
            placeholder="Enter a year (e.g. 1969 AD or -776 for 776 BC)..."
            className="w-full p-3 text-lg bg-gray-200 dark:bg-gray-700 border-2 border-transparent focus:border-indigo-500 focus:ring-0 rounded-lg text-center"
            required
            disabled={isInputDisabled}
          />
          <button
            type="submit"
            className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 ${
              isInputDisabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isInputDisabled}
          >
            Guess ({remaining}/{gameState.maxGuesses})
          </button>
        </form>

        {/* Guess History */}
        <div className="space-y-3">
          {gameState.guesses.map((guess, index) => {
            const isCorrect = guess === gameState.puzzle?.year;
            const directionInfo = gameState.puzzle ? getGuessDirectionInfo(guess, gameState.puzzle.year) : null;
            const hintText = gameState.puzzle?.events[index + 1] || 'No more hints available.';

            if (isCorrect) {
              return (
                <div key={index} className="guess-row bg-green-500 text-white p-4 rounded-lg flex items-center justify-between shadow-md">
                  <span className="font-bold text-lg">{formatYear(guess)}</span>
                  <span className="font-bold text-lg">CORRECT!</span>
                </div>
              );
            }

            return (
              <div key={index} className="guess-row bg-white dark:bg-gray-800 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-md">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className={`flex-shrink-0 text-center font-bold text-sm p-2 rounded-md min-w-32 ${directionInfo?.bgColor} ${directionInfo?.textColor}`}>
                    {directionInfo?.direction}
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="font-bold text-xl">{formatYear(guess)}</div>
                  </div>
                </div>
                <div className="border-l-2 border-gray-200 dark:border-gray-600 pl-4 text-gray-600 dark:text-gray-300 flex-1">
                  <span className="font-semibold text-gray-500 dark:text-gray-400">Hint:</span> {hintText}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Copy Feedback */}
      {copyFeedback && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg">
          {copyFeedback}
        </div>
      )}

      {/* How to Play Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6 modal-content show">
            <h2 className="text-2xl font-bold mb-4 text-center">How to Play</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <p>Guess the year of the historical event in 6 tries. Years can be BC or AD.</p>
              <p>After each guess, you&apos;ll receive two hints:</p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>A directional hint: <span className="font-bold">▲ LATER</span> or <span className="font-bold">▼ EARLIER</span>.</li>
                <li>A new historical event that happened in the <span className="font-bold">same target year</span>.</li>
              </ul>
              <p>Use the clues to narrow down your next guess and find the correct year!</p>
              <p className="text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border-l-4 border-blue-400">
                <span className="font-semibold">Daily Puzzle:</span> Everyone gets the same puzzle each day, so you can compare your results with friends!
              </p>
            </div>
            <button 
              onClick={closeHelpModal}
              className="mt-6 w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6 modal-content show">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Settings</h2>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
              >
                &times;
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="font-semibold">Dark Mode</label>
                <button 
                  onClick={toggleDarkMode}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                    darkMode ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}></span>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <label className="font-semibold">Color-Blind Mode</label>
                <button 
                  onClick={toggleColorBlindMode}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                    colorBlindMode ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                    colorBlindMode ? 'translate-x-6' : 'translate-x-1'
                  }`}></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {showGameOverModal && gameState.puzzle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6 text-center modal-content show">
            <h2 className="text-3xl font-bold mb-2">
              {gameState.guesses.includes(gameState.puzzle.year) ? "You got it!" : "So close!"}
            </h2>
            <p className="text-lg mb-4">
              The correct year was <strong>{formatYear(gameState.puzzle.year)}</strong>.
            </p>

            <div className="text-left bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4 max-h-48 overflow-y-auto">
              <h3 className="font-bold mb-2">Events from this year:</h3>
              <ul className="list-disc list-inside space-y-1">
                {gameState.puzzle.events.map((event, index) => (
                  <li key={index}>{event}</li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-4">
              <p className="font-mono text-center whitespace-pre-wrap">
                {generateShareText(gameState.guesses, gameState.puzzle.year)}
              </p>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm">NEXT CHRONDLE</p>
                <p className="text-2xl font-bold">{countdown}</p>
              </div>
              <button 
                onClick={handleShare}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal backdrop click handler */}
      {(showHelpModal || showSettingsModal || showGameOverModal) && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowHelpModal(false);
            setShowSettingsModal(false);
            if (showGameOverModal) {
              // Don't allow closing game over modal by clicking backdrop
            }
          }}
        />
      )}
    </div>
  );
}