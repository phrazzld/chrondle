"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { TOTAL_PUZZLES, getPuzzleByIndex } from "@/lib/puzzleData";
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
import { BackgroundAnimation } from "@/components/BackgroundAnimation";
import { Confetti, ConfettiRef } from "@/components/magicui/confetti";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { ArchiveErrorBoundary } from "@/components/ArchiveErrorBoundary";

// Helper function to validate puzzle ID parameter
function isValidPuzzleId(idStr: string): {
  valid: boolean;
  id?: number;
  error?: string;
} {
  // Check if it's a valid number string
  if (!/^\d+$/.test(idStr)) {
    return { valid: false, error: "Invalid puzzle ID format" };
  }

  const id = parseInt(idStr, 10);

  // Check if parsing was successful
  if (isNaN(id) || id < 1) {
    return { valid: false, error: "Invalid puzzle ID value" };
  }

  // Check if ID is in valid range (1-based)
  if (id > TOTAL_PUZZLES) {
    return {
      valid: false,
      error: `Puzzle #${id} does not exist. We have ${TOTAL_PUZZLES} puzzles.`,
    };
  }

  return { valid: true, id };
}

interface ArchivePuzzleContentProps {
  id: string;
}

function ArchivePuzzleContent({ id }: ArchivePuzzleContentProps) {
  const router = useRouter();
  const validation = isValidPuzzleId(id);
  const confettiRef = useRef<ConfettiRef>(null);

  // States
  const [showSettings, setShowSettings] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [isValidated, setIsValidated] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);

  // Get puzzle data using index (convert 1-based ID to 0-based index)
  const puzzleIndex = validation.valid && validation.id ? validation.id - 1 : 0;
  const puzzle = validation.valid ? getPuzzleByIndex(puzzleIndex) : null;
  const targetYear = puzzle?.year || 2000;

  // Use game state for archive puzzle
  const { gameState, makeGuess, hasWon, isGameComplete } = useConvexGameState(
    false, // debugMode
    targetYear, // archiveYear
  );

  // Update hint index based on guesses
  useEffect(() => {
    if (gameState.guesses.length > 0) {
      setCurrentHintIndex(
        Math.min(gameState.guesses.length, puzzle?.events.length || 0) - 1,
      );
    }
  }, [gameState.guesses, puzzle?.events.length]);

  // Handle validation effect
  useEffect(() => {
    if (!validation.valid) {
      setAnnouncement(`Error: ${validation.error}`);
    } else if (!puzzle) {
      setAnnouncement("Error: Failed to load puzzle data");
    }
    setIsValidated(true);
  }, [validation, puzzle]);

  // Handle game completion
  useEffect(() => {
    if (hasWon && !showSuccess) {
      setShowSuccess(true);
      confettiRef.current?.fire();
      setAnnouncement(`Correct! The year was ${formatYear(targetYear)}`);
    }
  }, [hasWon, targetYear, showSuccess]);

  // Handle guess submission
  const handleGuess = useCallback(
    (guess: number) => {
      if (!puzzle || isGameComplete) return;

      makeGuess(guess);

      // Update announcement with feedback
      const directionInfo = getGuessDirectionInfo(guess, targetYear);
      const proximityInfo = getEnhancedProximityFeedback(guess, targetYear);

      let message = `You guessed ${formatYear(guess)}. `;
      if (directionInfo.direction === "correct") {
        message = `Correct! The year was ${formatYear(targetYear)}`;
      } else {
        message += `The correct year is ${directionInfo.direction}. `;
        message += proximityInfo.message;
      }

      setAnnouncement(message);
    },
    [puzzle, isGameComplete, makeGuess, targetYear],
  );

  // Handle navigation
  const handleNavigate = (direction: "prev" | "next") => {
    if (!validation.valid || !validation.id) return;

    const currentId = validation.id;
    const newId = direction === "prev" ? currentId - 1 : currentId + 1;

    if (newId >= 1 && newId <= TOTAL_PUZZLES) {
      router.push(`/archive/puzzle/${newId}`);
    }
  };

  // Error state
  if (isValidated && (!validation.valid || !puzzle)) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <AppHeader
          onShowSettings={() => setShowSettings(true)}
          currentStreak={0}
        />

        <main className="flex-grow max-w-2xl mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {validation.error || "Puzzle not found"}
            </h1>
            <Link
              href="/archive"
              className="text-primary hover:text-primary/80 underline"
            >
              Return to Archive
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Loading state
  if (!isValidated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Loading puzzle...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <BackgroundAnimation
        guesses={gameState.guesses}
        targetYear={targetYear}
        isGameOver={isGameComplete}
      />
      <AppHeader
        onShowSettings={() => setShowSettings(true)}
        currentStreak={0}
      />

      <main className="flex-grow max-w-2xl mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
        {/* Archive Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/archive"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Archive
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleNavigate("prev")}
              disabled={validation.id === 1}
              className="px-3 py-1 text-sm rounded-md border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
            >
              Previous
            </button>

            <span className="text-sm text-muted-foreground px-2">
              Puzzle #{validation.id}
            </span>

            <button
              onClick={() => handleNavigate("next")}
              disabled={validation.id === TOTAL_PUZZLES}
              className="px-3 py-1 text-sm rounded-md border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
            >
              Next
            </button>
          </div>
        </div>

        {/* Game Content */}
        <div className="space-y-6">
          {/* Hints Display */}
          <HintsDisplay
            events={puzzle?.events || []}
            guesses={gameState.guesses}
            targetYear={targetYear}
            currentHintIndex={currentHintIndex}
            isGameComplete={isGameComplete}
            isLoading={false}
            error={null}
          />

          {/* Proximity Display */}
          {gameState.guesses.length > 0 && !hasWon && (
            <ProximityDisplay
              currentGuess={gameState.guesses[gameState.guesses.length - 1]}
              currentDistance={Math.abs(
                gameState.guesses[gameState.guesses.length - 1] - targetYear,
              )}
              targetYear={targetYear}
              hasWon={hasWon}
              guessCount={gameState.guesses.length}
            />
          )}

          {/* Timeline */}
          <Timeline
            minYear={-2000}
            maxYear={new Date().getFullYear()}
            guesses={gameState.guesses}
            targetYear={targetYear}
            isGameComplete={isGameComplete}
            hasWon={hasWon}
          />

          {/* Game Progress */}
          <GameProgress
            currentHintIndex={currentHintIndex}
            isGameWon={hasWon}
            isGameComplete={isGameComplete}
            guessCount={gameState.guesses.length}
            totalHints={puzzle?.events.length || 6}
          />

          {/* Guess Input */}
          {!isGameComplete && (
            <GuessInput
              onGuess={handleGuess}
              disabled={isGameComplete}
              remainingGuesses={6 - gameState.guesses.length}
              onValidationError={(msg) => setAnnouncement(msg)}
            />
          )}

          {/* Game Complete Message */}
          {isGameComplete && (
            <div className="text-center py-4">
              {hasWon ? (
                <p className="text-lg font-semibold text-green-600">
                  Congratulations! You found the year in{" "}
                  {gameState.guesses.length} guesses!
                </p>
              ) : (
                <p className="text-lg font-semibold text-red-600">
                  Game Over. The correct year was {formatYear(targetYear)}.
                </p>
              )}
            </div>
          )}

          {/* Instructions */}
          <GameInstructions />
        </div>
      </main>

      <Footer />

      {/* Modals */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Hint review modal temporarily disabled - needs proper implementation */}

      {/* Live Announcer for Screen Readers */}
      <LiveAnnouncer message={announcement} />

      {/* Confetti */}
      <Confetti
        ref={confettiRef}
        className="absolute left-0 top-0 z-50 size-full pointer-events-none"
      />
    </div>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ArchivePuzzlePage({ params }: PageProps) {
  const { id } = await params;

  return (
    <ArchiveErrorBoundary>
      <ArchivePuzzleContent id={id} />
    </ArchiveErrorBoundary>
  );
}
