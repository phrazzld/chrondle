"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { fetchTotalPuzzles } from "@/lib/puzzleData";
import { useConvexGameState } from "@/hooks/useConvexGameState";
import { GameLayout } from "@/components/GameLayout";
import { AppHeader } from "@/components/AppHeader";
import { Footer } from "@/components/Footer";
import { LiveAnnouncer } from "@/components/ui/LiveAnnouncer";
import { useVictoryConfetti } from "@/hooks/useVictoryConfetti";
import { formatYear, getGuessDirectionInfo } from "@/lib/utils";
import { getEnhancedProximityFeedback } from "@/lib/enhancedFeedback";
import { SettingsModal } from "@/components/modals/SettingsModal";
import { BackgroundAnimation } from "@/components/BackgroundAnimation";
import { ConfettiRef } from "@/components/magicui/confetti";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { ArchiveErrorBoundary } from "@/components/ArchiveErrorBoundary";

// Type for validation result
type PuzzleIdValidation =
  | { valid: true; id: number; error?: never }
  | { valid: false; id?: never; error: string };

// Helper function to validate puzzle ID parameter
function isValidPuzzleId(idStr: string): PuzzleIdValidation {
  // Check if it's a valid number string
  if (!/^\d+$/.test(idStr)) {
    return { valid: false, error: "Invalid puzzle ID format" } as const;
  }

  const id = parseInt(idStr, 10);

  // Check if parsing was successful
  if (isNaN(id) || id < 1) {
    return { valid: false, error: "Invalid puzzle ID value" } as const;
  }

  // For now, just return valid if it's a positive number
  // Actual validation will happen when we try to fetch the puzzle
  return { valid: true, id } as const;
}

interface ArchivePuzzleContentProps {
  id: string;
}

function ArchivePuzzleContent({
  id,
}: ArchivePuzzleContentProps): React.ReactElement {
  const router = useRouter();
  const validation = isValidPuzzleId(id);
  const confettiRef = useRef<ConfettiRef>(null);

  // States
  const [showSettings, setShowSettings] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [isValidated, setIsValidated] = useState(false);
  const [totalPuzzles, setTotalPuzzles] = useState(0);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // The puzzle ID is the puzzle number (1-based)
  const puzzleNumber = validation.valid && validation.id ? validation.id : 0;

  // Use game state for archive puzzle with puzzle number
  const { gameState, makeGuess, hasWon, isGameComplete, isLoading } =
    useConvexGameState(
      false, // debugMode
      puzzleNumber > 0 ? puzzleNumber : undefined, // archivePuzzleNumber - pass immediately, don't wait for puzzle
    );

  // Get target year from game state puzzle
  const targetYear = gameState.puzzle?.year || 2000;

  // Fetch total puzzles count for navigation
  useEffect(() => {
    async function fetchData() {
      if (!validation.valid) {
        setAnnouncement(`Error: ${validation.error}`);
        setIsValidated(true);
        return;
      }

      try {
        // Fetch total puzzles count for navigation
        const totalCount = await fetchTotalPuzzles();
        setTotalPuzzles(totalCount);

        // Check if puzzle number is valid
        if (validation.id > totalCount) {
          setFetchError(
            `Puzzle #${validation.id} does not exist. We have ${totalCount} puzzles.`,
          );
          setAnnouncement(
            `Puzzle #${validation.id} does not exist. We have ${totalCount} puzzles.`,
          );
        }
      } catch (error) {
        console.error("Failed to fetch total puzzles count:", error);
        setFetchError("Failed to load puzzle data");
        setAnnouncement("Error: Failed to load puzzle data");
      } finally {
        setIsValidated(true);
      }
    }

    fetchData();
  }, [validation]);

  // Use victory confetti hook for celebration
  useVictoryConfetti(confettiRef, {
    hasWon,
    isGameComplete,
    isMounted: isValidated, // Use isValidated as mounted state
    guessCount: gameState.guesses.length,
    disabled: false,
  });

  // Handle victory announcement
  useEffect(() => {
    if (hasWon && !showSuccess && gameState.guesses.length > 0) {
      // Check if this is a fresh win (last guess was just made)
      const lastGuess = gameState.guesses[gameState.guesses.length - 1];
      if (lastGuess === targetYear) {
        setShowSuccess(true);
        setAnnouncement(`Correct! The year was ${formatYear(targetYear)}`);
      }
    }
  }, [hasWon, targetYear, showSuccess, gameState.guesses]);

  // Handle guess submission
  const handleGuess = useCallback(
    (guess: number): void => {
      if (!gameState.puzzle || isGameComplete) return;

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
    [gameState.puzzle, isGameComplete, makeGuess, targetYear],
  );

  // Handle navigation
  const handleNavigate = (direction: "prev" | "next"): void => {
    if (!validation.valid || !validation.id) return;

    const currentId = validation.id;
    const newId = direction === "prev" ? currentId - 1 : currentId + 1;

    if (newId >= 1 && newId <= totalPuzzles) {
      router.push(`/archive/puzzle/${newId}`);
    }
  };

  // Error state
  if (isValidated && (!validation.valid || fetchError || !gameState.puzzle)) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <AppHeader
          onShowSettings={(): void => setShowSettings(true)}
          currentStreak={0}
        />

        <main className="flex-grow max-w-2xl mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {validation.error || fetchError || "Puzzle not found"}
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
  if (!isValidated || isLoading || !gameState.puzzle) {
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
      {/* Use GameLayout with archive-specific header */}
      <GameLayout
        gameState={gameState}
        isGameComplete={isGameComplete}
        hasWon={hasWon}
        isLoading={false}
        error={null}
        onGuess={handleGuess}
        onValidationError={(msg: string): void => setAnnouncement(msg)}
        confettiRef={confettiRef}
        headerContent={
          <>
            <AppHeader
              onShowSettings={(): void => setShowSettings(true)}
              currentStreak={0}
            />
            {/* Archive Navigation */}
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <Link
                  href="/archive"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  ← Back to Archive
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(): void => handleNavigate("prev")}
                    disabled={validation.id === 1}
                    className="px-3 py-1 text-sm rounded-md border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
                  >
                    Previous
                  </button>

                  <span className="text-sm text-muted-foreground px-2">
                    Puzzle #{validation.id}
                  </span>

                  <button
                    onClick={(): void => handleNavigate("next")}
                    disabled={validation.id === totalPuzzles}
                    className="px-3 py-1 text-sm rounded-md border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </>
        }
        footerContent={<Footer />}
      />

      {/* Modals */}
      <SettingsModal
        isOpen={showSettings}
        onClose={(): void => setShowSettings(false)}
      />

      {/* Hint review modal temporarily disabled - needs proper implementation */}

      {/* Live Announcer for Screen Readers */}
      <LiveAnnouncer message={announcement} />

      {/* Confetti is now handled by GameLayout */}
    </div>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ArchivePuzzlePage({
  params,
}: PageProps): React.ReactElement {
  const { id } = use(params);

  return (
    <ArchiveErrorBoundary>
      <ArchivePuzzleContent id={id} />
    </ArchiveErrorBoundary>
  );
}
