"use client";

import { useCallback, useMemo, useRef } from "react";
import { useAuthState } from "@/hooks/data/useAuthState";
import { useOrderPuzzleData } from "@/hooks/data/useOrderPuzzleData";
import { useOrderProgress } from "@/hooks/data/useOrderProgress";
import { useOrderSession } from "@/hooks/useOrderSession";
import { deriveOrderGameState, type OrderDataSources } from "@/lib/deriveOrderGameState";
import { applyHintToOrdering } from "@/lib/order/applyHintToOrdering";
import type { OrderGameState, OrderHint, OrderScore } from "@/types/orderGameState";

interface UseOrderGameReturn {
  gameState: OrderGameState;
  reorderEvents: (fromIndex: number, toIndex: number) => void;
  takeHint: (hint: OrderHint) => void;
  commitOrdering: (score: OrderScore) => Promise<void>;
}

export function useOrderGame(puzzleNumber?: number, initialPuzzle?: unknown): UseOrderGameReturn {
  const puzzle = useOrderPuzzleData(puzzleNumber, initialPuzzle);
  const auth = useAuthState();
  const progress = useOrderProgress(auth.userId, puzzle.puzzle?.id ?? null);

  const baselineOrder = useMemo(
    () => puzzle.puzzle?.events.map((event) => event.id) ?? [],
    [puzzle.puzzle?.events],
  );

  // Compute correct chronological order for hint application
  const correctOrder = useMemo(
    () =>
      puzzle.puzzle
        ? [...puzzle.puzzle.events]
            .sort((a, b) => a.year - b.year || a.id.localeCompare(b.id))
            .map((event) => event.id)
        : [],
    [puzzle.puzzle],
  );

  const session = useOrderSession(puzzle.puzzle?.id ?? null, baselineOrder, auth.isAuthenticated);

  const dataSources: OrderDataSources = useMemo(
    () => ({
      puzzle,
      auth,
      progress,
      session: session.state,
    }),
    [puzzle, auth, progress, session.state],
  );

  const gameState = useMemo(() => deriveOrderGameState(dataSources), [dataSources]);

  const sessionOrderingRef = useRef(session.state.ordering);
  sessionOrderingRef.current = session.state.ordering;

  const reorderEvents = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) {
        return;
      }

      const ordering = moveItem(sessionOrderingRef.current, fromIndex, toIndex);
      session.setOrdering(ordering);
    },
    [session],
  );

  const takeHint = useCallback(
    (hint: OrderHint) => {
      // Apply hint effect to ordering (anchor hints move events to correct position)
      const currentOrdering = sessionOrderingRef.current;

      const newOrdering = applyHintToOrdering(currentOrdering, hint, correctOrder);

      // Update ordering if it changed
      if (newOrdering !== currentOrdering) {
        session.setOrdering(newOrdering);
      }

      // Add hint to history
      session.addHint(hint);
    },
    [session, correctOrder],
  );

  const commitOrdering = useCallback(
    async (score: OrderScore) => {
      session.markCommitted(score);
    },
    [session],
  );

  return useMemo(
    () => ({
      gameState,
      reorderEvents,
      takeHint,
      commitOrdering,
    }),
    [gameState, reorderEvents, takeHint, commitOrdering],
  );
}

function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return items;
  }

  const copy = [...items];
  const [removed] = copy.splice(from, 1);
  copy.splice(to, 0, removed);
  return copy;
}
