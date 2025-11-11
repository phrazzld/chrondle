"use client";

import React, { useState, useEffect } from "react";
import { GameInstructions } from "@/components/GameInstructions";
import { RangeInput } from "@/components/game/RangeInput";
import { HintRevealButtons } from "@/components/game/HintRevealButtons";
import { ScoreDisplay } from "@/components/game/ScoreDisplay";
import { Confetti, ConfettiRef } from "@/components/magicui/confetti";
import { GameComplete } from "@/components/modals/GameComplete";
import { validateGameLayoutProps } from "@/lib/propValidation";
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

  // Local state for range input (lifted from RangeInput for header score display)
  const minYear = -5000;
  const maxYear = new Date().getFullYear();
  const [range, setRange] = useState<[number, number]>([minYear, maxYear]);

  // Calculate width from range for score display
  const width = range[1] - range[0] + 1;

  // Reset hints and range when game completes or puzzle changes
  useEffect(() => {
    setHintsRevealed(0);
    setRange([minYear, maxYear]); // Reset to full timeline
  }, [gameState.puzzle?.year, isGameComplete, minYear, maxYear]);

  const targetYear = gameState.puzzle?.year ?? 0;
  const totalScore = gameState.totalScore ?? 0;
  const puzzleNumber = gameState.puzzle?.puzzleNumber;

  // Handler for revealing hints
  const handleRevealHint = (hintIndex: number) => {
    // hintIndex is 0-based (0-5 for hints 2-6)
    // hintsRevealed should become hintIndex + 1
    setHintsRevealed(hintIndex + 1);
  };

  // Handler for range changes from RangeInput
  const handleRangeChange = (newRange: [number, number]) => {
    setRange(newRange);
  };

  return (
    <div className="bg-background flex flex-1 flex-col">
      {/* Optional header content */}
      {headerContent && <div>{headerContent}</div>}

      {/* Main game content */}
      <main className="flex-1 overflow-auto px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto w-full max-w-2xl space-y-10 sm:space-y-12">
          {/* Active Game: Header with Score in Upper Right */}
          {!isGameComplete && (
            <div className="flex flex-row items-start justify-between gap-2 sm:gap-4">
              {/* Left: Game Instructions */}
              <GameInstructions isGameComplete={false} hasWon={false} isArchive={isArchive} />

              {/* Right: Compact Score Display */}
              <ScoreDisplay
                variant="compact"
                width={width}
                hintsUsed={hintsRevealed}
                className="flex-shrink-0"
              />
            </div>
          )}

          {/* Completed Game: Full-width Instructions */}
          {isGameComplete && (
            <GameInstructions
              isGameComplete={isGameComplete}
              hasWon={hasWon}
              targetYear={targetYear}
              timeString={countdown?.timeString}
              isArchive={isArchive}
              historicalContext={gameState.puzzle?.historicalContext}
            />
          )}

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
          {!isGameComplete && (
            <RangeInput
              minYear={minYear}
              maxYear={maxYear}
              onCommit={onRangeCommit}
              disabled={isLoading}
              className=""
              hintsUsed={hintsRevealed}
              isOneGuessMode={true}
              value={range}
              onChange={handleRangeChange}
            />
          )}

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
