"use client";

import { useState } from "react";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useOrderGame } from "@/hooks/useOrderGame";
import type { OrderEvent, OrderHint, OrderScore } from "@/types/orderGameState";
import { OrderReveal } from "@/components/order/OrderReveal";
import { copyOrderShareCardToClipboard, type OrderShareResult } from "@/lib/order/shareCard";
import { logger } from "@/lib/logger";

interface OrderGameIslandProps {
  preloadedPuzzle: Preloaded<typeof api.orderPuzzles.getDailyOrderPuzzle>;
}

export function OrderGameIsland({ preloadedPuzzle }: OrderGameIslandProps) {
  const puzzle = usePreloadedQuery(preloadedPuzzle);
  const { gameState, reorderEvents, takeHint, commitOrdering } = useOrderGame(undefined, puzzle);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  if (gameState.status === "loading-puzzle") {
    return renderShell("Loading Order puzzle…");
  }

  if (gameState.status === "loading-auth" || gameState.status === "loading-progress") {
    return renderShell("Preparing your Order session…");
  }

  if (gameState.status === "error") {
    return renderShell(`Something went wrong: ${gameState.error}`);
  }

  if (gameState.status === "completed") {
    const handleShare = async () => {
      try {
        const results: OrderShareResult[] = gameState.correctOrder.map((id, idx) =>
          gameState.finalOrder[idx] === id ? "correct" : "incorrect",
        );

        await copyOrderShareCardToClipboard({
          dateLabel: gameState.puzzle.date,
          puzzleNumber: gameState.puzzle.puzzleNumber,
          results,
          score: gameState.score,
        });

        setShareFeedback("Image copied to clipboard!");
      } catch (error) {
        logger.error("Failed to generate Order share card", error);
        setShareFeedback("Share failed. Try again.");
      }
    };

    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
        <OrderReveal
          events={gameState.puzzle.events}
          finalOrder={gameState.finalOrder}
          correctOrder={gameState.correctOrder}
          score={gameState.score}
          onShare={handleShare}
        />
        {shareFeedback && (
          <p className="text-muted-foreground text-center text-sm" role="status">
            {shareFeedback}
          </p>
        )}
      </main>
    );
  }

  const { currentOrder, puzzle: currentPuzzle, hints, moves } = gameState;

  const handleCommit = () => {
    const score = calculateScore(currentOrder, currentPuzzle.events, hints.length);
    commitOrdering(score).catch((error) => logger.error("Failed to commit ordering", error));
  };

  const handleHint = () => {
    if (!currentPuzzle.events.length) return;
    takeHint({
      type: "anchor",
      eventId: currentPuzzle.events[0].id,
      position: 0,
    });
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-16">
      <header className="text-center">
        <p className="text-muted-foreground text-sm tracking-wide uppercase">Order Mode</p>
        <h1 className="text-foreground text-3xl font-semibold">
          Puzzle #{currentPuzzle.puzzleNumber}
        </h1>
        <p className="text-muted-foreground">{currentPuzzle.date}</p>
      </header>

      <section className="border-border bg-card rounded-2xl border p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm">Moves</p>
            <p className="text-foreground text-2xl font-semibold">{moves}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleHint}
              className="border-border text-foreground hover:bg-muted rounded-full border px-3 py-1 text-sm font-medium"
            >
              Take Anchor Hint
            </button>
            <button
              type="button"
              onClick={handleCommit}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-4 py-2 text-sm font-medium"
            >
              Commit Ordering
            </button>
          </div>
        </div>
        <ol className="space-y-4">
          {currentOrder.map((eventId, index) => {
            const event = currentPuzzle.events.find((evt) => evt.id === eventId);
            if (!event) return null;
            return (
              <li
                key={eventId}
                className="border-border bg-background flex items-center justify-between rounded-2xl border px-4 py-3 text-left shadow-sm"
              >
                <div>
                  <p className="text-muted-foreground text-xs tracking-wide uppercase">
                    #{index + 1}
                  </p>
                  <p className="text-foreground text-base font-semibold">{event.text}</p>
                  <p className="text-muted-foreground text-sm">{event.year}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => reorderEvents(index, index - 1)}
                    disabled={index === 0}
                    className="border-border text-foreground hover:bg-muted rounded-full border px-3 py-1 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => reorderEvents(index, index + 1)}
                    disabled={index === currentOrder.length - 1}
                    className="border-border text-foreground hover:bg-muted rounded-full border px-3 py-1 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ↓
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {!!hints.length && (
        <section className="border-border bg-muted/40 rounded-2xl border border-dashed p-4 text-left">
          <p className="text-foreground text-sm font-semibold">Hints Used</p>
          <ul className="text-muted-foreground mt-2 list-disc pl-4 text-sm">
            {hints.map((hint, idx) => (
              <li key={idx}>{describeHint(hint)}</li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

function renderShell(message: string) {
  return (
    <main className="bg-background flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground text-base">{message}</p>
    </main>
  );
}

function describeHint(hint: OrderHint) {
  switch (hint.type) {
    case "anchor":
      return `Anchor: ${hint.eventId} locked in position ${hint.position + 1}`;
    case "relative":
      return `Relative: ${hint.earlierEventId} occurs before ${hint.laterEventId}`;
    case "bracket":
      return `Bracket: ${hint.eventId} happened between ${hint.yearRange[0]} and ${hint.yearRange[1]}`;
    case "bracket":
      return `Bracket: ${hint.eventId} happened between ${hint.yearRange[0]} and ${hint.yearRange[1]}`;
    default:
      return "Hint applied";
  }
}

function calculateScore(ordering: string[], events: OrderEvent[], hintCount: number): OrderScore {
  const resolvedOrdering = ordering.length ? ordering : events.map((event) => event.id);
  const trueOrder = [...events].sort((a, b) => a.year - b.year).map((event) => event.id);
  const n = resolvedOrdering.length;
  const totalPairs = (n * (n - 1)) / 2;
  let correctPairs = 0;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const first = resolvedOrdering[i];
      const second = resolvedOrdering[j];
      if (trueOrder.indexOf(first) < trueOrder.indexOf(second)) {
        correctPairs += 1;
      }
    }
  }

  const multipliers = [1, 0.85, 0.7, 0.5];
  const hintMultiplier = multipliers[Math.min(hintCount, multipliers.length - 1)];
  return {
    totalScore: Math.round(correctPairs * 2 * hintMultiplier),
    correctPairs,
    totalPairs,
    hintMultiplier,
  };
}
