"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { SUPPORTED_YEARS } from "@/lib/puzzleData";
import { useConvexGameState } from "@/hooks/useConvexGameState";
import { HintsDisplay } from "@/components/HintsDisplay";
import { GuessInput } from "@/components/GuessInput";
import { GameProgress } from "@/components/GameProgress";
import { GameInstructions } from "@/components/GameInstructions";
import { Timeline } from "@/components/Timeline";
import { ProximityDisplay } from "@/components/ui/ProximityDisplay";
import { AppHeader } from "@/components/AppHeader";
import { Footer } from "@/components/Footer";
import { LiveAnnouncer } from "@/components/ui/LiveAnnouncer";
import { formatYear, getGuessDirectionInfo } from "@/lib/utils";
import { getEnhancedProximityFeedback } from "@/lib/enhancedFeedback";
import { SettingsModal } from "@/components/modals/SettingsModal";
import { HintReviewModal } from "@/components/modals/HintReviewModal";
import { BackgroundAnimation } from "@/components/BackgroundAnimation";
import { Confetti, ConfettiRef } from "@/components/magicui/confetti";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { ArchiveErrorBoundary } from "@/components/ArchiveErrorBoundary";

// Helper function to validate year parameter
function isValidYear(yearStr: string): {
  valid: boolean;
  year?: number;
  error?: string;
} {
  // Check if it's a valid number string
  if (!/^-?\d+$/.test(yearStr)) {
    return { valid: false, error: "Invalid year format" };
  }

  const year = parseInt(yearStr, 10);

  // Check if parsing was successful
  if (isNaN(year)) {
    return { valid: false, error: "Invalid year value" };
  }

  // Check if year is in supported range
  if (!SUPPORTED_YEARS.includes(year)) {
    const minYear = Math.min(...SUPPORTED_YEARS);
    const maxYear = Math.max(...SUPPORTED_YEARS);
    return {
      valid: false,
      error: `Year ${year} not available. Valid range: ${minYear} to ${maxYear}`,
    };
  }

  return { valid: true, year };
}

function ArchiveGamePageContent({ params }: { params: { year: string } }) {
  const router = useRouter();

  // Validate year parameter immediately
  const validation = isValidYear(params.year);
  const year = validation.year || 0; // Default to 0 if invalid

  // SSR state
  const [mounted, setMounted] = useState(false);
  const [showInvalidYearError, setShowInvalidYearError] = useState(false);

  // Confetti ref for victory celebration
  const confettiRef = useRef<ConfettiRef>(null);

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

  // Validate year and redirect if invalid
  useEffect(() => {
    if (!validation.valid) {
      setShowInvalidYearError(true);
      // Redirect after a short delay to show error
      const timer = setTimeout(() => {
        router.push("/archive");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [validation.valid, router]);

  // Use game state with archive year (only if valid)
  const gameLogic = useConvexGameState(
    false,
    validation.valid ? year : undefined,
  );

  // NOTE: Archive games do not update streaks
  // Streaks are only for daily puzzles to encourage daily play.
  // Archive puzzles are for practice and exploration without affecting stats.
  // This is why we don't import or use the useStreak hook here.

  // Mount effect
  useEffect(() => {
    setMounted(true);
  }, []);

  // Trigger confetti celebration on victory
  useEffect(() => {
    if (
      gameLogic.hasWon &&
      gameLogic.isGameComplete &&
      mounted &&
      confettiRef.current
    ) {
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (prefersReducedMotion) {
        // Simple, less intensive confetti for users who prefer reduced motion
        const triggerReducedConfetti = async () => {
          try {
            await confettiRef.current?.fire({
              particleCount: 30,
              spread: 45,
              origin: { x: 0.5, y: 0.6 },
              colors: ["#d4a574", "#27ae60"],
              gravity: 1.2,
              drift: 0,
            });
          } catch (error) {
            console.error("Victory confetti error:", error);
          }
        };
        triggerReducedConfetti();
      } else {
        // Full confetti celebration for users who enjoy motion
        const triggerVictoryConfetti = async () => {
          try {
            // First burst from center
            await confettiRef.current?.fire({
              particleCount: 100,
              spread: 70,
              origin: { x: 0.5, y: 0.6 },
              colors: ["#d4a574", "#27ae60", "#3498db", "#f39c12"],
            });

            // Second burst with different spread
            setTimeout(async () => {
              await confettiRef.current?.fire({
                particleCount: 50,
                spread: 120,
                origin: { x: 0.5, y: 0.7 },
                colors: ["#d4a574", "#27ae60", "#3498db", "#f39c12"],
              });
            }, 250);
          } catch (error) {
            console.error("Victory confetti error:", error);
          }
        };
        triggerVictoryConfetti();
      }
    }
  }, [gameLogic.hasWon, gameLogic.isGameComplete, mounted]);

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

  // Handle validation errors from GuessInput component
  const handleValidationError = useCallback((message: string) => {
    setValidationError(message);
    setTimeout(() => setValidationError(""), 2000);
  }, []);

  const closeHintReviewModal = useCallback(() => {
    setHintReviewModal(null);
  }, []);

  // Show error state for invalid year
  if (showInvalidYearError && !validation.valid) {
    return (
      <div className="min-h-screen" style={{ background: "var(--background)" }}>
        <AppHeader
          onShowSettings={() => setShowSettingsModal(true)}
          currentStreak={0}
        />

        {/* Error state */}
        <main className="min-h-screen flex items-center justify-center">
          <div className="max-w-md w-full mx-4 p-6 bg-card rounded-lg border shadow-lg">
            <div className="text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h1 className="text-xl font-bold text-foreground mb-2">
                Invalid Year
              </h1>
              <p className="text-muted-foreground mb-6">
                {validation.error || "The requested year is not available."}
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecting to archive...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show loading state during SSR and initial mount
  if (!mounted || gameLogic.isLoading) {
    return (
      <div className="min-h-screen" style={{ background: "var(--background)" }}>
        <AppHeader
          onShowSettings={() => setShowSettingsModal(true)}
          currentStreak={0}
        />

        {/* Loading state */}
        <main className="min-h-screen">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold">
                  Loading Archive Puzzle...
                </h1>
              </div>
            </div>
          </div>
        </main>
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

      <AppHeader
        onShowSettings={() => setShowSettingsModal(true)}
        currentStreak={0} // No streaks in archive mode
      />

      {/* Main Content Area */}
      <main
        id="main-content"
        className={`min-h-screen ${gameLogic.gameState.guesses.length > 0 ? "gesture-enabled" : ""}`}
        role="main"
        aria-label="Historical guessing game - Archive puzzle"
      >
        <div className="max-w-6xl mx-auto px-6 py-6">
          {/* Single Column Game Layout */}
          <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
            {/* Archive-specific header */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">
                Archive Puzzle: Year {year}
              </h1>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Link
                  href="/"
                  className="hover:text-foreground transition-colors"
                >
                  Home
                </Link>
                <span>›</span>
                <Link
                  href="/archive"
                  className="hover:text-foreground transition-colors"
                >
                  Archive
                </Link>
                <span>›</span>
                <span className="text-foreground">{year}</span>
              </div>
            </div>

            {/* Game Instructions - Modified for archive */}
            <GameInstructions
              isGameComplete={gameLogic.isGameComplete}
              hasWon={gameLogic.hasWon}
              targetYear={gameLogic.gameState.puzzle?.year}
              guesses={gameLogic.gameState.guesses}
              timeString="" // No countdown in archive
              currentStreak={0} // No streaks in archive
              puzzleEvents={gameLogic.gameState.puzzle?.events || []}
              closestGuess={gameLogic.closestGuess}
            />

            {/* Input Section - Hidden when game complete */}
            {!gameLogic.isGameComplete && (
              <GuessInput
                onGuess={gameLogic.makeGuess}
                disabled={gameLogic.isGameComplete || gameLogic.isLoading}
                remainingGuesses={gameLogic.remainingGuesses}
                onValidationError={handleValidationError}
              />
            )}

            {/* Timeline Visualization */}
            <Timeline
              minYear={-2000}
              maxYear={new Date().getFullYear()}
              guesses={gameLogic.gameState.guesses}
              targetYear={gameLogic.gameState.puzzle?.year || null}
              isGameComplete={gameLogic.isGameComplete}
              hasWon={gameLogic.hasWon}
            />

            {/* Proximity Display - Show closest guess during active gameplay */}
            {!gameLogic.isGameComplete &&
              gameLogic.gameState.guesses.length > 0 &&
              !gameLogic.hasWon &&
              gameLogic.gameState.puzzle && (
                <ProximityDisplay
                  currentGuess={
                    gameLogic.gameState.guesses[
                      gameLogic.gameState.guesses.length - 1
                    ]
                  }
                  currentDistance={Math.abs(
                    gameLogic.gameState.guesses[
                      gameLogic.gameState.guesses.length - 1
                    ] - gameLogic.gameState.puzzle.year,
                  )}
                  targetYear={gameLogic.gameState.puzzle.year}
                  hasWon={gameLogic.hasWon}
                  guessCount={gameLogic.gameState.guesses.length}
                  className="animate-fade-in"
                />
              )}

            {/* Progress Section */}
            <GameProgress
              currentHintIndex={gameLogic.currentHintIndex}
              isGameWon={gameLogic.hasWon}
              isGameComplete={gameLogic.isGameComplete}
              guessCount={gameLogic.gameState.guesses.length}
            />

            {/* Hints Section */}
            <HintsDisplay
              events={gameLogic.gameState.puzzle?.events || []}
              guesses={gameLogic.gameState.guesses}
              targetYear={gameLogic.gameState.puzzle?.year || 0}
              currentHintIndex={gameLogic.currentHintIndex}
              isGameComplete={gameLogic.isGameComplete}
              isLoading={gameLogic.isLoading}
              error={gameLogic.error}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

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
          onNavigate={() => {}} // Simplified for now
          touchHandlers={{
            onTouchStart: () => {},
            onTouchMove: () => {},
            onTouchEnd: () => {},
          }} // Simplified for now
        />
      )}

      {/* Victory Confetti */}
      <Confetti
        ref={confettiRef}
        className="fixed inset-0 z-50 pointer-events-none"
        style={{
          width: "100vw",
          height: "100vh",
          left: 0,
          top: 0,
        }}
        manualstart={true}
        aria-hidden="true"
      />
    </div>
  );
}

export default function ArchiveGamePage({
  params,
}: {
  params: { year: string };
}) {
  return (
    <ArchiveErrorBoundary year={params.year}>
      <ArchiveGamePageContent params={params} />
    </ArchiveErrorBoundary>
  );
}
