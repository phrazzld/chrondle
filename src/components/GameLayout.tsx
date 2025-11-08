"use client";

import React, { useMemo } from "react";
import { AnimatePresence } from "motion/react";
import { GameInstructions } from "@/components/GameInstructions";
import { CurrentHintCard } from "@/components/CurrentHintCard";
import { RangeTimeline, type RangeTimelineRange } from "@/components/game/RangeTimeline";
import { RangeInput } from "@/components/game/RangeInput";
import { HintsDisplay } from "@/components/HintsDisplay";
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
    error,
    onRangeCommit,
    headerContent,
    footerContent,
    confettiRef,
    countdown,
    isArchive = false,
    remainingAttempts,
  } = props;

  // Calculate currentHintIndex from gameState
  const currentHintIndex = Math.min(gameState.guesses.length, 5);
  const targetYear = gameState.puzzle?.year ?? 0;
  const totalScore = gameState.totalScore ?? 0;
  const puzzleNumber = gameState.puzzle?.puzzleNumber;

  const timelineRanges = useMemo<RangeTimelineRange[]>(() => {
    if (!gameState.ranges || gameState.ranges.length === 0) {
      return [];
    }

    return gameState.ranges.map((range, index) => ({
      start: range.start,
      end: range.end,
      score: range.score,
      contained: range.score > 0,
      hintsUsed: range.hintsUsed,
      timestamp: range.timestamp ?? index,
    }));
  }, [gameState.ranges]);

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
            timeString={countdown?.timeString}
            isArchive={isArchive}
            historicalContext={gameState.puzzle?.historicalContext}
          />

          <RangeInput
            targetYear={targetYear}
            minYear={-5000}
            maxYear={new Date().getFullYear()}
            onCommit={onRangeCommit}
            disabled={isGameComplete || isLoading}
            className="mt-2"
          />
          <p className="text-muted-foreground text-center text-xs">
            {remainingAttempts} attempt{remainingAttempts === 1 ? "" : "s"} remaining
          </p>

          {/* Timeline */}
          <RangeTimeline
            ranges={timelineRanges}
            targetYear={gameState.puzzle?.year ?? null}
            minYear={-5000}
            maxYear={new Date().getFullYear()}
            isComplete={isGameComplete}
          />

          {isGameComplete && (
            <GameComplete
              ranges={gameState.ranges}
              totalScore={totalScore}
              hasWon={hasWon}
              puzzleNumber={puzzleNumber}
            />
          )}

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
