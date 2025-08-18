"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getGuessDirectionInfo, formatYear } from "@/lib/utils";
import { getEnhancedProximityFeedback } from "@/lib/enhancedFeedback";
import { useChrondle } from "@/hooks/useChrondle";
import { isReady } from "@/types/gameState";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import { useStreak } from "@/hooks/useStreak";
import { useCountdown } from "@/hooks/useCountdown";
import { useVictoryConfetti } from "@/hooks/useVictoryConfetti";
import { logger } from "@/lib/logger";
import { SettingsModal } from "@/components/modals/SettingsModal";
import { HintReviewModal } from "@/components/modals/HintReviewModal";
import { GameLayout } from "@/components/GameLayout";
import { AppHeader } from "@/components/AppHeader";
import { LiveAnnouncer } from "@/components/ui/LiveAnnouncer";
import { AchievementModal } from "@/components/modals/AchievementModal";
import { BackgroundAnimation } from "@/components/BackgroundAnimation";
import { Footer } from "@/components/Footer";
import { ConfettiRef } from "@/components/magicui/confetti";

// Force dynamic rendering to prevent SSR issues with theme context
export const dynamic = "force-dynamic";

export default function ChronldePage() {
  // SSR state
  const [mounted, setMounted] = useState(false);

  // Debug state
  const [debugMode, setDebugMode] = useState(false);

  // Confetti ref for victory celebration
  const confettiRef = useRef<ConfettiRef>(null);

  // Use the new Chrondle hook - old one had race conditions
  const chrondle = useChrondle();

  // Adapt to old interface for compatibility
  const gameLogic = {
    gameState: isReady(chrondle.gameState)
      ? {
          puzzle: {
            ...chrondle.gameState.puzzle,
            year: chrondle.gameState.puzzle.targetYear, // old interface used 'year'
          },
          guesses: chrondle.gameState.guesses,
          isGameOver: chrondle.gameState.isComplete,
        }
      : {
          puzzle: null,
          guesses: [],
          isGameOver: false,
        },
    isLoading:
      chrondle.gameState.status === "loading-puzzle" ||
      chrondle.gameState.status === "loading-auth" ||
      chrondle.gameState.status === "loading-progress",
    error:
      chrondle.gameState.status === "error" ? chrondle.gameState.error : null,
    isGameComplete: isReady(chrondle.gameState)
      ? chrondle.gameState.isComplete
      : false,
    hasWon: isReady(chrondle.gameState) ? chrondle.gameState.hasWon : false,
    remainingGuesses: isReady(chrondle.gameState)
      ? chrondle.gameState.remainingGuesses
      : 6,
    makeGuess: chrondle.submitGuess,
    resetGame: chrondle.resetGame,
  };

  // Get puzzle number from the loaded puzzle data
  const puzzleNumber = gameLogic.gameState.puzzle?.puzzleNumber || 1;

  // Streak system
  const {
    streakData,
    updateStreak,
    hasNewAchievement,
    newAchievement,
    clearNewAchievement,
  } = useStreak();

  // Countdown for next puzzle
  const countdown = useCountdown(); // Get countdown data

  // UI state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Accessibility announcements
  const [announcement, setAnnouncement] = useState("");
  const [lastGuessCount, setLastGuessCount] = useState(0);

  // Hint review modal state
  const [hintReviewModal, setHintReviewModal] = useState<{
    isOpen: boolean;
    guessNumber: number;
    guess: number;
    hint: string;
  } | null>(null);

  // Handle streak update when game completes
  useEffect(() => {
    if (gameLogic.isGameComplete && gameLogic.gameState.puzzle) {
      // Update streak based on game result
      if (!debugMode) {
        const hasWon = gameLogic.hasWon;
        updateStreak(hasWon);
      }
    }
  }, [
    gameLogic.isGameComplete,
    gameLogic.gameState.puzzle,
    gameLogic.hasWon,
    updateStreak,
    debugMode,
  ]);

  // Use victory confetti hook for celebration
  useVictoryConfetti(confettiRef, {
    hasWon: gameLogic.hasWon,
    isGameComplete: gameLogic.isGameComplete,
    isMounted: mounted,
    guessCount: gameLogic.gameState.guesses.length,
    disabled: debugMode, // Don't fire confetti in debug mode
  });

  // Announce guess feedback for screen readers
  useEffect(() => {
    const currentGuessCount = gameLogic.gameState.guesses.length;

    // Only announce when a new guess has been made
    if (
      currentGuessCount > lastGuessCount &&
      currentGuessCount > 0 &&
      gameLogic.gameState.puzzle
    ) {
      const latestGuess = gameLogic.gameState.guesses[currentGuessCount - 1];
      const targetYear = gameLogic.gameState.puzzle.year;

      if (latestGuess === targetYear) {
        setAnnouncement(
          `Correct! The year was ${formatYear(targetYear)}. Congratulations!`,
        );
      } else {
        const directionInfo = getGuessDirectionInfo(latestGuess, targetYear);
        const enhancedFeedback = getEnhancedProximityFeedback(
          latestGuess,
          targetYear,
          {
            previousGuesses: gameLogic.gameState.guesses.slice(0, -1),
            includeHistoricalContext: true,
            includeProgressiveTracking: true,
          },
        );
        const cleanDirection = directionInfo.direction
          .toLowerCase()
          .replace("▲", "")
          .replace("▼", "")
          .trim();
        setAnnouncement(
          `${formatYear(latestGuess)} is ${cleanDirection}. ${enhancedFeedback.encouragement}${enhancedFeedback.historicalHint ? ` ${enhancedFeedback.historicalHint}` : ""}${enhancedFeedback.progressMessage ? ` ${enhancedFeedback.progressMessage}` : ""}`,
        );
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
    const isDebug = urlParams.get("debug") === "true";
    setDebugMode(isDebug);

    // Debug parameters are handled by the useGameState hook

    // Register service worker for notifications
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          logger.info(
            "📱 Service Worker registered successfully:",
            registration,
          );
        })
        .catch((error) => {
          logger.error("📱 Service Worker registration failed:", error);
        });
    }
  }, [mounted]);

  // Handle validation errors from GuessInput component
  const handleValidationError = useCallback((message: string) => {
    setValidationError(message);
    setTimeout(() => setValidationError(""), 2000);
  }, []);

  const closeHintReviewModal = useCallback(() => {
    setHintReviewModal(null);
  }, []);

  // Gesture navigation for reviewing hints
  const navigateToHint = useCallback(
    (direction: "prev" | "next") => {
      if (
        !gameLogic.gameState.puzzle ||
        gameLogic.gameState.guesses.length === 0
      )
        return;

      const currentIndex = hintReviewModal?.guessNumber
        ? hintReviewModal.guessNumber - 1
        : 0;
      const maxIndex = gameLogic.gameState.guesses.length - 1;

      let newIndex: number;
      if (direction === "prev") {
        newIndex = currentIndex > 0 ? currentIndex - 1 : maxIndex;
      } else {
        newIndex = currentIndex < maxIndex ? currentIndex + 1 : 0;
      }

      const guess = gameLogic.gameState.guesses[newIndex];
      const hint =
        gameLogic.gameState.puzzle.events[newIndex + 1] ||
        "No more hints available.";

      setHintReviewModal({
        isOpen: true,
        guessNumber: newIndex + 1,
        guess,
        hint,
      });
    },
    [
      hintReviewModal?.guessNumber,
      gameLogic.gameState.guesses,
      gameLogic.gameState.puzzle,
    ],
  );

  // Swipe navigation for hint review when modal is open
  const handleSwipeNavigate = useCallback(
    (index: number) => {
      if (
        !gameLogic.gameState.puzzle ||
        gameLogic.gameState.guesses.length === 0
      )
        return;

      const guess = gameLogic.gameState.guesses[index];
      const hint =
        gameLogic.gameState.puzzle.events[index + 1] ||
        "No more hints available.";

      setHintReviewModal({
        isOpen: true,
        guessNumber: index + 1,
        guess,
        hint,
      });
    },
    [gameLogic.gameState.guesses, gameLogic.gameState.puzzle],
  );

  // Use the sophisticated swipe navigation hook when modal is open
  const { touchHandlers } = useSwipeNavigation({
    totalHints: gameLogic.gameState.guesses.length,
    currentIndex: hintReviewModal ? hintReviewModal.guessNumber - 1 : 0,
    onNavigate: handleSwipeNavigate,
    enabled:
      Boolean(hintReviewModal?.isOpen) &&
      gameLogic.gameState.guesses.length > 1,
  });

  // Show loading state during SSR and initial mount to prevent flash
  // This ensures consistent UI between server and initial client render
  if (!mounted || gameLogic.isLoading) {
    return (
      <div className="min-h-screen" style={{ background: "var(--background)" }}>
        {/* Use GameLayout for loading state */}
        <GameLayout
          gameState={{
            puzzle: null,
            guesses: [],
            isGameOver: false,
          }}
          isGameComplete={false}
          hasWon={false}
          isLoading={true}
          error={null}
          onGuess={() => {}}
          onValidationError={() => {}}
          countdown={countdown}
          headerContent={
            <AppHeader
              onShowSettings={() => setShowSettingsModal(true)}
              currentStreak={streakData.currentStreak}
              isDebugMode={debugMode}
              puzzleNumber={puzzleNumber}
            />
          }
          footerContent={<Footer />}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
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

      {/* Use GameLayout with homepage-specific header */}
      <GameLayout
        gameState={gameLogic.gameState}
        isGameComplete={gameLogic.isGameComplete}
        hasWon={gameLogic.hasWon}
        isLoading={gameLogic.isLoading}
        error={gameLogic.error}
        onGuess={gameLogic.makeGuess}
        onValidationError={handleValidationError}
        confettiRef={confettiRef}
        debugMode={debugMode}
        countdown={countdown}
        headerContent={
          <AppHeader
            onShowSettings={() => setShowSettingsModal(true)}
            currentStreak={streakData.currentStreak}
            isDebugMode={debugMode}
            puzzleNumber={puzzleNumber}
          />
        }
        footerContent={<Footer />}
      />

      {/* Validation Error Feedback */}
      {validationError && (
        <div
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg text-white font-medium shadow-lg z-50"
          style={{ background: "var(--error)" }}
        >
          {validationError}
        </div>
      )}

      {/* Live Announcements for Screen Readers */}
      <LiveAnnouncer message={announcement} priority="polite" />

      {/* How to Play Modal */}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />

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

      {/* Achievement Modal */}
      <AchievementModal
        isOpen={hasNewAchievement}
        onClose={clearNewAchievement}
        achievement={newAchievement || ""}
      />

      {/* Confetti is now handled by GameLayout */}
    </div>
  );
}
