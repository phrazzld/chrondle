"use client";

import React from "react";
import { GameInstructions } from "@/components/GameInstructions";
import { CurrentHintCard } from "@/components/CurrentHintCard";
import { GuessInput } from "@/components/GuessInput";
import { Timeline } from "@/components/Timeline";
import { ProximityDisplay } from "@/components/ui/ProximityDisplay";
import { GameProgress } from "@/components/GameProgress";
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
  const showProximity = gameState.guesses.length > 0 && !hasWon;
  const targetYear = gameState.puzzle?.year || 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Optional header content */}
      {headerContent && <div>{headerContent}</div>}

      {/* Main game content */}
      <main className="flex-1 px-4 py-6">
        <div className="max-w-2xl mx-auto w-full space-y-6">
          {/* Game Instructions - Always at top */}
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

          {/* Current Hint Card - Above input for mobile visibility */}
          {!isGameComplete && gameState.puzzle && (
            <CurrentHintCard
              event={gameState.puzzle.events[currentHintIndex] || null}
              hintNumber={currentHintIndex + 1}
              totalHints={gameState.puzzle.events.length}
              isLoading={isLoading}
              error={error}
            />
          )}

          {/* Guess Input - Below current hint */}
          {!isGameComplete && (
            <GuessInput
              onGuess={onGuess}
              disabled={isGameComplete || isLoading}
              isLoading={isLoading}
              remainingGuesses={remainingGuesses}
              onValidationError={onValidationError}
            />
          )}

          {/* Timeline - Shows after first guess */}
          <Timeline
            minYear={-2500}
            maxYear={new Date().getFullYear()}
            guesses={gameState.guesses}
            targetYear={targetYear}
            isGameComplete={isGameComplete}
            hasWon={hasWon}
          />

          {/* Proximity Display - Shows after first guess if not won */}
          {showProximity && (
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

          {/* Game Progress - Always visible */}
          <GameProgress
            guessCount={gameState.guesses.length}
            totalHints={gameState.puzzle?.events.length || 6}
          />

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
          className="fixed inset-0 z-50 pointer-events-none"
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
