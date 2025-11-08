"use client";

import React, { useMemo } from "react";
import { AnimatePresence } from "motion/react";
import { GameInstructions } from "@/components/GameInstructions";
import { CurrentHintCard } from "@/components/CurrentHintCard";
import { GuessInput } from "@/components/GuessInput";
import { RangeTimeline, RangeTimelineRange } from "@/components/game/RangeTimeline";
import { LastGuessDisplay } from "@/components/ui/LastGuessDisplay";
import { HintsDisplay } from "@/components/HintsDisplay";
import { Confetti, ConfettiRef } from "@/components/magicui/confetti";
import { validateGameLayoutProps } from "@/lib/propValidation";

export interface GameLayoutProps {
  // Core game state
  gameState: {
    puzzle: {
      year: number;
      events: string[];
      puzzleNumber?: number;
      historicalContext?: string;
    } | null;
    guesses: number[];
    isGameOver: boolean;
  };
  isGameComplete: boolean;
  hasWon: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  onGuess: (year: number) => void;

  // Optional header content (nav controls for archive, settings for homepage)
  headerContent?: React.ReactNode;

  // Optional footer content
  footerContent?: React.ReactNode;

  // Validation error handler
  onValidationError?: (message: string) => void;

  // Confetti config
  confettiRef?: React.RefObject<ConfettiRef>;

  // Debug mode
  debugMode?: boolean;

  // Countdown data
  countdown?: {
    timeString: string;
    isComplete: boolean;
    isLoading: boolean;
    error: string | null;
  };

  // Archive indicator
  isArchive?: boolean;
}

export function GameLayout(props: GameLayoutProps) {
  // Validate props in development
  validateGameLayoutProps(props);

  const {
    gameState,
    isGameComplete,
    hasWon,
    isLoading,
    error,
    onGuess,
    headerContent,
    footerContent,
    onValidationError,
    confettiRef,
    countdown,
    isArchive = false,
  } = props;

  // Calculate currentHintIndex from gameState
  const currentHintIndex = Math.min(gameState.guesses.length, 5);
  const remainingGuesses = 6 - gameState.guesses.length;
  const targetYear = gameState.puzzle?.year ?? 0;

  const timelineRanges = useMemo<RangeTimelineRange[]>(() => {
    if (!gameState.guesses || gameState.guesses.length === 0) {
      return [];
    }

    return gameState.guesses.map((guess) => ({
      start: guess,
      end: guess,
      score: 0,
      contained: gameState.puzzle ? guess === gameState.puzzle.year : false,
      hintsUsed: 0,
    }));
  }, [gameState.guesses, gameState.puzzle]);

  return (
    <div className="bg-background flex flex-1 flex-col">
      {/* Optional header content */}
      {headerContent && <div>{headerContent}</div>}

      {/* Main game content */}
      <main className="flex-1 overflow-auto px-4 py-6">
        <div className="mx-auto w-full max-w-2xl space-y-6">
          {/* Game Instructions - Header and subheading always at top */}
          <GameInstructions
            isGameComplete={isGameComplete}
            hasWon={hasWon}
            targetYear={targetYear}
            guesses={gameState.guesses}
            timeString={countdown?.timeString}
            isArchive={isArchive}
            puzzleEvents={gameState.puzzle?.events || []}
            puzzleNumber={gameState.puzzle?.puzzleNumber}
            historicalContext={gameState.puzzle?.historicalContext}
          />

          {/* Last Guess Display - ALWAYS visible, reserves space even before first guess */}
          {!isGameComplete && (
            <LastGuessDisplay
              currentGuess={
                gameState.guesses.length > 0
                  ? gameState.guesses[gameState.guesses.length - 1]
                  : undefined
              }
              currentDistance={
                gameState.guesses.length > 0
                  ? Math.abs(gameState.guesses[gameState.guesses.length - 1] - targetYear)
                  : undefined
              }
              targetYear={targetYear}
              hasWon={hasWon}
              guessCount={gameState.guesses.length}
            />
          )}

          {/* Guess Input */}
          {!isGameComplete && (
            <GuessInput
              onGuess={onGuess}
              disabled={isGameComplete || isLoading}
              isLoading={isLoading}
              remainingGuesses={remainingGuesses}
              onValidationError={onValidationError}
            />
          )}

          {/* Timeline */}
          <RangeTimeline
            ranges={timelineRanges}
            targetYear={gameState.puzzle?.year ?? null}
            minYear={-5000}
            maxYear={new Date().getFullYear()}
            isComplete={isGameComplete}
          />

          {/* Current Hint Card - Below timeline, can change height without affecting elements above */}
          {!isGameComplete && gameState.puzzle && (
            <AnimatePresence mode="wait">
              <CurrentHintCard
                key={`current-hint-${currentHintIndex}`}
                event={gameState.puzzle.events[currentHintIndex] || null}
                hintNumber={currentHintIndex + 1}
                totalHints={gameState.puzzle.events.length}
                isLoading={isLoading}
                error={error}
                isInitialHint={currentHintIndex === 0}
              />
            </AnimatePresence>
          )}

          {/* Hints Display - Always at bottom */}
          <HintsDisplay
            events={gameState.puzzle?.events || []}
            guesses={gameState.guesses}
            targetYear={targetYear}
            isGameComplete={isGameComplete}
            error={error}
          />
        </div>
      </main>

      {/* Optional footer content */}
      {footerContent}

      {/* Victory Confetti - Always with manualstart=true */}
      {confettiRef && (
        <Confetti
          ref={confettiRef}
          className="pointer-events-none fixed inset-0 z-50"
          style={{
            width: "100%",
            height: "100%",
            position: "fixed",
            top: 0,
          }}
          manualstart={true}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
