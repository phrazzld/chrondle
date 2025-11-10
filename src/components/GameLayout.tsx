"use client";

import React, { useState, useEffect } from "react";
import { GameInstructions } from "@/components/GameInstructions";
import { RangeInput } from "@/components/game/RangeInput";
import { HintRevealButtons } from "@/components/game/HintRevealButtons";
import { Confetti, ConfettiRef } from "@/components/magicui/confetti";
import { GameComplete } from "@/components/modals/GameComplete";
import { validateGameLayoutProps } from "@/lib/propValidation";
import { SCORING_CONSTANTS } from "@/lib/scoring";
import type { RangeGuess } from "@/types/range";

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
    ranges: RangeGuess[];
    isGameOver: boolean;
    totalScore: number;
  };
  isGameComplete: boolean;
  hasWon: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  onRangeCommit: (range: {
    start: number;
    end: number;
    hintsUsed: number;
  }) => void | Promise<boolean>;

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
  remainingAttempts: number;
}

export function GameLayout(props: GameLayoutProps) {
  // Validate props in development
  validateGameLayoutProps(props);

  const {
    gameState,
    isGameComplete,
    hasWon,
    isLoading,
    onRangeCommit,
    headerContent,
    footerContent,
    confettiRef,
    countdown,
    isArchive = false,
  } = props;

  // Local state for hints revealed in current session (0-6)
  // Starts at 0 (first hint is free and always shown)
  const [hintsRevealed, setHintsRevealed] = useState(0);

  // Reset hints when game completes or puzzle changes
  useEffect(() => {
    setHintsRevealed(0);
  }, [gameState.puzzle?.year, isGameComplete]);

  const targetYear = gameState.puzzle?.year ?? 0;
  const totalScore = gameState.totalScore ?? 0;
  const puzzleNumber = gameState.puzzle?.puzzleNumber;

  // Current multiplier based on hints revealed
  const currentMultiplier = SCORING_CONSTANTS.HINT_MULTIPLIERS[hintsRevealed];

  // Handler for revealing hints
  const handleRevealHint = (hintIndex: number) => {
    // hintIndex is 0-based (0-5 for hints 2-6)
    // hintsRevealed should become hintIndex + 1
    setHintsRevealed(hintIndex + 1);
  };

  return (
    <div className="bg-background flex flex-1 flex-col">
      {/* Optional header content */}
      {headerContent && <div>{headerContent}</div>}

      {/* Main game content */}
      <main className="flex-1 overflow-auto px-4 py-6">
        <div className="mx-auto w-full max-w-2xl space-y-8">
          {/* Game Instructions - Header and subheading always at top */}
          <GameInstructions
            isGameComplete={isGameComplete}
            hasWon={hasWon}
            targetYear={targetYear}
            timeString={countdown?.timeString}
            isArchive={isArchive}
            historicalContext={gameState.puzzle?.historicalContext}
          />

          {/* Historical Events Hints - Manual reveal system (shown first for better flow) */}
          {!isGameComplete && gameState.puzzle && (
            <HintRevealButtons
              events={gameState.puzzle.events}
              hintsRevealed={hintsRevealed}
              onRevealHint={handleRevealHint}
              disabled={isGameComplete || isLoading}
            />
          )}

          {/* Range Input - After hints so user can adjust based on information */}
          <RangeInput
            minYear={-5000}
            maxYear={new Date().getFullYear()}
            onCommit={onRangeCommit}
            disabled={isGameComplete || isLoading}
            className=""
            hintsUsed={hintsRevealed}
            currentMultiplier={currentMultiplier}
            isOneGuessMode={true}
          />

          {/* Game Complete Summary */}
          {isGameComplete && (
            <GameComplete
              ranges={gameState.ranges}
              totalScore={totalScore}
              hasWon={hasWon}
              puzzleNumber={puzzleNumber}
            />
          )}
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
