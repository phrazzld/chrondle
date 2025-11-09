"use client";

import { useCallback, useMemo, useState } from "react";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useOrderGame } from "@/hooks/useOrderGame";
import type { OrderEvent, OrderHint, OrderPuzzle, OrderScore } from "@/types/orderGameState";
import { HintDisplay } from "@/components/order/HintDisplay";
import { OrderReveal } from "@/components/order/OrderReveal";
import { generateAnchorHint, generateBracketHint, generateRelativeHint } from "@/lib/order/hints";
import { copyOrderShareCardToClipboard, type OrderShareResult } from "@/lib/order/shareCard";
import { logger } from "@/lib/logger";

interface OrderGameIslandProps {
  preloadedPuzzle: Preloaded<typeof api.orderPuzzles.getDailyOrderPuzzle>;
}

type HintType = OrderHint["type"];

const HINT_MULTIPLIERS = [1, 0.85, 0.7, 0.5];

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

  return (
    <ReadyOrderGame
      puzzle={gameState.puzzle}
      currentOrder={gameState.currentOrder}
      hints={gameState.hints}
      moves={gameState.moves}
      reorderEvents={reorderEvents}
      takeHint={takeHint}
      onCommit={(score) =>
        commitOrdering(score).catch((error) => logger.error("Failed to commit ordering", error))
      }
    />
  );
}

function renderShell(message: string) {
  return (
    <main className="bg-background flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground text-base">{message}</p>
    </main>
  );
}

interface ReadyOrderGameProps {
  puzzle: OrderPuzzle;
  currentOrder: string[];
  hints: OrderHint[];
  moves: number;
  reorderEvents: (fromIndex: number, toIndex: number) => void;
  takeHint: (hint: OrderHint) => void;
  onCommit: (score: OrderScore) => void;
}

function ReadyOrderGame({
  puzzle,
  currentOrder,
  hints,
  moves,
  reorderEvents,
  takeHint,
  onCommit,
}: ReadyOrderGameProps) {
  const [pendingHintType, setPendingHintType] = useState<HintType | null>(null);
  const [hintError, setHintError] = useState<string | null>(null);

  const correctOrder = useMemo(
    () =>
      [...puzzle.events]
        .sort((a, b) => a.year - b.year || a.id.localeCompare(b.id))
        .map((event) => event.id),
    [puzzle.events],
  );

  const puzzleSeed = useMemo(() => hashHintContext([puzzle.seed]), [puzzle.seed]);

  const multiplier = useMemo(
    () => HINT_MULTIPLIERS[Math.min(hints.length, HINT_MULTIPLIERS.length - 1)],
    [hints.length],
  );

  const disabledHintTypes: Partial<Record<HintType, boolean>> = useMemo(
    () => ({
      anchor: hints.some((hint) => hint.type === "anchor"),
      relative: hints.some((hint) => hint.type === "relative"),
      bracket: hints.some((hint) => hint.type === "bracket"),
    }),
    [hints],
  );

  const requestHint = useCallback(
    (type: HintType) => {
      if (pendingHintType || disabledHintTypes[type]) {
        return;
      }

      setPendingHintType(type);
      setHintError(null);

      try {
        const hint = createHintForType(type, {
          currentOrder,
          events: puzzle.events,
          hints,
          correctOrder,
          puzzleSeed,
        });
        takeHint(hint);
      } catch (error) {
        logger.error("Failed to generate Order hint", error);
        setHintError("Unable to generate hint. Adjust your ordering and try again.");
      } finally {
        setPendingHintType(null);
      }
    },
    [
      pendingHintType,
      disabledHintTypes,
      currentOrder,
      puzzle.events,
      hints,
      correctOrder,
      puzzleSeed,
      takeHint,
    ],
  );

  const handleCommit = useCallback(() => {
    const score = calculateScore(currentOrder, puzzle.events, hints.length);
    onCommit(score);
  }, [currentOrder, puzzle.events, hints.length, onCommit]);

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-16">
      <header className="text-center">
        <p className="text-muted-foreground text-sm tracking-wide uppercase">Order Mode</p>
        <h1 className="text-foreground text-3xl font-semibold">Puzzle #{puzzle.puzzleNumber}</h1>
        <p className="text-muted-foreground">{puzzle.date}</p>
      </header>

      <div className="flex flex-col gap-6 lg:flex-row-reverse">
        <HintDisplay
          className="w-full lg:w-[360px]"
          events={puzzle.events}
          hints={hints}
          multiplier={multiplier}
          onRequestHint={requestHint}
          disabledTypes={disabledHintTypes}
          pendingType={pendingHintType}
          error={hintError ?? undefined}
        />

        <section className="border-border bg-card rounded-2xl border p-6 shadow-sm lg:flex-1">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-muted-foreground text-sm">Moves</p>
              <p className="text-foreground text-2xl font-semibold">{moves}</p>
            </div>
            <button
              type="button"
              onClick={handleCommit}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 py-2 text-sm font-semibold"
            >
              Commit Ordering
            </button>
          </div>
          <ol className="space-y-4">
            {currentOrder.map((eventId, index) => {
              const event = puzzle.events.find((evt) => evt.id === eventId);
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
                      aria-label={`Move ${event.text} up`}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => reorderEvents(index, index + 1)}
                      disabled={index === currentOrder.length - 1}
                      className="border-border text-foreground hover:bg-muted rounded-full border px-3 py-1 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={`Move ${event.text} down`}
                    >
                      ↓
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </main>
  );
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

  const hintMultiplier = HINT_MULTIPLIERS[Math.min(hintCount, HINT_MULTIPLIERS.length - 1)];
  return {
    totalScore: Math.round(correctPairs * 2 * hintMultiplier),
    correctPairs,
    totalPairs,
    hintMultiplier,
  };
}

function createHintForType(
  type: HintType,
  context: {
    currentOrder: string[];
    events: OrderEvent[];
    hints: OrderHint[];
    correctOrder: string[];
    puzzleSeed: number;
  },
): OrderHint {
  const { currentOrder, events, hints, correctOrder, puzzleSeed } = context;
  if (!events.length) {
    throw new Error("Cannot generate hints without events.");
  }

  const stateSeed = hashHintContext([puzzleSeed, type, currentOrder.join("-"), hints.length]);

  switch (type) {
    case "anchor": {
      const excludeEventIds = hints
        .filter((hint) => hint.type === "anchor")
        .map((hint) => hint.eventId);
      return generateAnchorHint(currentOrder, correctOrder, {
        seed: stateSeed,
        excludeEventIds,
      });
    }
    case "relative": {
      const excludePairs = hints
        .filter((hint) => hint.type === "relative")
        .map((hint) => ({
          earlierEventId: hint.earlierEventId,
          laterEventId: hint.laterEventId,
        }));
      return generateRelativeHint(currentOrder, events, {
        seed: stateSeed,
        excludePairs,
      });
    }
    case "bracket": {
      const event = selectBracketEvent(currentOrder, events, hints, stateSeed);
      return generateBracketHint(event);
    }
    default: {
      const exhaustiveCheck: never = type;
      throw new Error(`Unsupported hint type: ${exhaustiveCheck}`);
    }
  }
}

function selectBracketEvent(
  currentOrder: string[],
  events: OrderEvent[],
  hints: OrderHint[],
  seed: number,
): OrderEvent {
  if (!events.length) {
    throw new Error("No events available for bracket hint.");
  }

  const bracketedIds = new Set(
    hints.filter((hint) => hint.type === "bracket").map((hint) => hint.eventId),
  );
  const chronological = [...events].sort((a, b) => a.year - b.year || a.id.localeCompare(b.id));
  const orderIndex = new Map(currentOrder.map((id, index) => [id, index]));

  const candidatePool = chronological
    .filter((event) => !bracketedIds.has(event.id))
    .map((event, correctIndex) => ({
      event,
      displacement: Math.abs((orderIndex.get(event.id) ?? correctIndex) - correctIndex),
    }));

  const pool = candidatePool.length
    ? candidatePool
    : chronological.map((event, correctIndex) => ({
        event,
        displacement: Math.abs((orderIndex.get(event.id) ?? correctIndex) - correctIndex),
      }));

  const maxDisplacement = Math.max(...pool.map((item) => item.displacement));
  const topCandidates = pool.filter((item) => item.displacement === maxDisplacement);
  const normalizedSeed = Math.abs(seed);
  const index = topCandidates.length > 1 ? normalizedSeed % topCandidates.length : 0;
  return topCandidates[Math.max(0, index)].event;
}

function hashHintContext(parts: Array<string | number>): number {
  let hash = 0x811c9dc5;
  for (const part of parts) {
    const chunk = String(part);
    for (let i = 0; i < chunk.length; i++) {
      hash ^= chunk.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    hash ^= chunk.length;
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}
