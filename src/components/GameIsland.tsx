"use client";

// This is the main client-side island that contains all game interactivity
// It receives preloaded puzzle data from the server and handles all client-side state

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  useDeferredValue,
  lazy,
  Suspense,
} from "react";
import { usePreloadedQuery, Preloaded } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useChrondle } from "@/hooks/useChrondle";
import { isReady } from "@/types/gameState";
import { useStreak } from "@/hooks/useStreak";
import { useCountdown } from "@/hooks/useCountdown";
import { useVictoryConfetti } from "@/hooks/useVictoryConfetti";
import { useScreenReaderAnnouncements } from "@/hooks/useScreenReaderAnnouncements";
import { logger } from "@/lib/logger";
import {
  SettingsModal,
  HintReviewModal,
  AchievementModal,
  LazyModalWrapper,
} from "@/components/LazyModals";
import {
  GameLayout,
  AppHeader,
  Footer,
  LiveAnnouncer,
  BackgroundAnimation,
} from "@/components/LazyComponents";
import { ConfettiRef } from "@/components/magicui/confetti";
import { GameErrorBoundary } from "@/components/GameErrorBoundary";

// Lazy load AnalyticsDashboard for development/debug mode only
const AnalyticsDashboard = lazy(() =>
  import("@/components/AnalyticsDashboard").then((m) => ({
    default: m.AnalyticsDashboard,
  })),
);

interface GameIslandProps {
  preloadedPuzzle: Preloaded<typeof api.puzzles.getDailyPuzzle>;
}

export function GameIsland({ preloadedPuzzle }: GameIslandProps) {
  // Use the preloaded puzzle data - this seamlessly hydrates and subscribes to updates
  const puzzle = usePreloadedQuery(preloadedPuzzle);

  // Hydration state for progressive enhancement (not for hiding UI)
  const [hydrated, setHydrated] = useState(false);

  // Debug state
  const [debugMode, setDebugMode] = useState(false);

  // Confetti ref for victory celebration
  const confettiRef = useRef<ConfettiRef>(null);

  // Use the Chrondle hook with preloaded puzzle data
  // This eliminates the loading state for puzzle data
  const chrondle = useChrondle(undefined, puzzle);

  // Defer non-critical state values for better performance
  const deferredGameState = useDeferredValue(chrondle.gameState);

  // Adapt to old interface for compatibility
  const gameLogic = useMemo(() => {
    // We have puzzle data from server preload, so treat it as available
    // even during auth/progress loading
    const puzzleData = puzzle
      ? {
          ...puzzle,
          year: puzzle.targetYear, // old interface used 'year'
        }
      : isReady(chrondle.gameState)
        ? {
            ...chrondle.gameState.puzzle,
            year: chrondle.gameState.puzzle.targetYear,
          }
        : null;

    // Extract guesses and completion status when ready
    const guesses = isReady(chrondle.gameState)
      ? chrondle.gameState.guesses
      : [];
    const isGameOver = isReady(chrondle.gameState)
      ? chrondle.gameState.isComplete
      : false;

    // More granular loading states
    const isPuzzleLoading = chrondle.gameState.status === "loading-puzzle";
    const isAuthLoading = chrondle.gameState.status === "loading-auth";
    const isProgressLoading = chrondle.gameState.status === "loading-progress";

    // Only consider it "loading" for UI purposes if puzzle is actually loading
    // Auth and progress can load in the background without disabling the game
    const isLoading = isPuzzleLoading;

    return {
      gameState: {
        puzzle: puzzleData,
        guesses,
        isGameOver,
      },
      isLoading,
      isPuzzleLoading,
      isAuthLoading,
      isProgressLoading,
      error:
        chrondle.gameState.status === "error" ? chrondle.gameState.error : null,
      // Use deferred values for non-critical display properties
      isGameComplete: isReady(deferredGameState)
        ? deferredGameState.isComplete
        : false,
      hasWon: isReady(deferredGameState) ? deferredGameState.hasWon : false,
      remainingGuesses: isReady(deferredGameState)
        ? deferredGameState.remainingGuesses
        : 6,
      makeGuess: chrondle.submitGuess,
      resetGame: chrondle.resetGame,
    };
  }, [
    puzzle,
    chrondle.gameState,
    deferredGameState,
    chrondle.submitGuess,
    chrondle.resetGame,
  ]);

  // Store puzzle number once loaded to prevent flashing during state transitions
  const [stablePuzzleNumber, setStablePuzzleNumber] = useState<
    number | undefined
  >(undefined);

  // Update stable puzzle number when we get a valid puzzle
  useEffect(() => {
    if (gameLogic.gameState.puzzle?.puzzleNumber) {
      setStablePuzzleNumber(gameLogic.gameState.puzzle.puzzleNumber);
    }
  }, [gameLogic.gameState.puzzle?.puzzleNumber]);

  // Only show puzzle number if we're past the initial puzzle loading
  const puzzleNumber =
    chrondle.gameState.status !== "loading-puzzle"
      ? stablePuzzleNumber
      : undefined;

  // Streak system
  const {
    streakData,
    updateStreak,
    hasNewAchievement,
    newAchievement,
    clearNewAchievement,
  } = useStreak();

  // Countdown for next puzzle
  const countdown = useCountdown();

  // UI state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [, setValidationError] = useState("");
  const [, setLastGuessCount] = useState(0);

  // Hint review modal state
  const [showHintReview, setShowHintReview] = useState(false);

  // Handle game over with streak updates
  const handleGameOver = useCallback(
    (won: boolean, guessCount: number) => {
      // logger.gameComplete is not available, use logger.info instead
      logger.info(
        `Game complete: ${won ? "Won" : "Lost"} in ${guessCount} guesses`,
      );
      setLastGuessCount(guessCount);
      updateStreak(won);
    },
    [updateStreak],
  );

  // Watch for game completion
  useEffect(() => {
    if (gameLogic.isGameComplete && !gameLogic.isLoading) {
      const guessCount = gameLogic.gameState.guesses.length;
      handleGameOver(gameLogic.hasWon, guessCount);
    }
  }, [
    gameLogic.isGameComplete,
    gameLogic.hasWon,
    gameLogic.isLoading,
    gameLogic.gameState.guesses.length,
    handleGameOver,
  ]);

  // Victory confetti effect
  useVictoryConfetti(confettiRef, {
    hasWon: gameLogic.hasWon,
    isGameComplete: gameLogic.isGameComplete,
    isMounted: hydrated,
    guessCount: gameLogic.gameState.guesses.length,
  });

  // Track last guess count for screen reader announcements
  const [screenReaderLastGuessCount, setScreenReaderLastGuessCount] =
    useState(0);

  // Screen reader announcements
  const announcement = useScreenReaderAnnouncements({
    guesses: gameLogic.gameState.guesses,
    puzzle: gameLogic.gameState.puzzle,
    lastGuessCount: screenReaderLastGuessCount,
    setLastGuessCount: setScreenReaderLastGuessCount,
  });

  // Swipe navigation would need proper props - disabling for now
  // TODO: Implement proper swipe navigation if needed

  // Handle client-side hydration and debug mode setup
  useEffect(() => {
    setHydrated(true);

    // Check for debug mode
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const debug = urlParams.get("debug") === "true";
      setDebugMode(debug);

      if (debug) {
        logger.debug("Debug mode enabled via URL parameter");
      }
    }
  }, []);

  // NOTE: No longer returning null here - let SSR content remain visible!
  // We'll use the hydrated state for progressive enhancement only

  return (
    <GameErrorBoundary>
      <div
        className={`min-h-screen flex flex-col bg-background text-foreground ${hydrated ? "hydrated" : "ssr"}`}
      >
        <Suspense fallback={null}>
          <BackgroundAnimation
            guesses={gameLogic.gameState.guesses}
            targetYear={
              gameLogic.gameState.puzzle?.year || new Date().getFullYear()
            }
            isGameOver={gameLogic.isGameComplete}
          />
        </Suspense>

        <AppHeader
          onShowSettings={() => setShowSettingsModal(true)}
          currentStreak={streakData.currentStreak}
          isDebugMode={debugMode}
          puzzleNumber={puzzleNumber}
        />

        <main className="flex-1 flex flex-col">
          {!gameLogic.isLoading && gameLogic.error && (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="bg-destructive/10 text-destructive p-6 rounded-lg max-w-md text-center">
                <h2 className="text-xl font-bold mb-2">
                  Unable to Load Puzzle
                </h2>
                <p className="mb-4">{gameLogic.error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 transition-colors"
                >
                  Reload Page
                </button>
              </div>
            </div>
          )}

          {!gameLogic.error && (
            <GameLayout
              gameState={gameLogic.gameState}
              isGameComplete={gameLogic.isGameComplete}
              hasWon={gameLogic.hasWon}
              isLoading={gameLogic.isLoading}
              error={gameLogic.error}
              onGuess={gameLogic.makeGuess}
              countdown={countdown}
              confettiRef={confettiRef}
              onValidationError={setValidationError}
              footerContent={
                <button
                  onClick={() => setShowHintReview(true)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Review Hints
                </button>
              }
            />
          )}
        </main>

        <Footer />

        {/* Modals with Suspense boundaries */}
        <LazyModalWrapper>
          <SettingsModal
            isOpen={showSettingsModal}
            onClose={() => setShowSettingsModal(false)}
          />
        </LazyModalWrapper>

        {gameLogic.gameState.puzzle &&
          gameLogic.gameState.guesses.length > 0 && (
            <LazyModalWrapper>
              <HintReviewModal
                isOpen={showHintReview}
                onClose={() => setShowHintReview(false)}
                guessNumber={gameLogic.gameState.guesses.length}
                guess={
                  gameLogic.gameState.guesses[
                    gameLogic.gameState.guesses.length - 1
                  ]
                }
                targetYear={gameLogic.gameState.puzzle.year}
                hint={
                  gameLogic.gameState.puzzle.events[
                    gameLogic.gameState.guesses.length - 1
                  ] || ""
                }
                totalGuesses={gameLogic.gameState.guesses.length}
              />
            </LazyModalWrapper>
          )}

        <LazyModalWrapper>
          <AchievementModal
            isOpen={hasNewAchievement}
            onClose={clearNewAchievement}
            achievement={newAchievement || ""}
          />
        </LazyModalWrapper>

        {/* Screen reader announcements */}
        <LiveAnnouncer message={announcement} />

        {/* Debug Dashboard - Lazy loaded for better performance */}
        {debugMode && (
          <Suspense fallback={null}>
            <AnalyticsDashboard />
          </Suspense>
        )}
      </div>
    </GameErrorBoundary>
  );
}
