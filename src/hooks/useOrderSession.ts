"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Id } from "convex/_generated/dataModel";
import type { OrderHint, OrderScore } from "@/types/orderGameState";
import type { OrderSessionState } from "@/lib/deriveOrderGameState";

interface UseOrderSessionReturn {
  state: OrderSessionState;
  setOrdering: (ordering: string[]) => void;
  addHint: (hint: OrderHint) => void;
  resetSession: (ordering: string[]) => void;
  markCommitted: (score: OrderScore) => void;
}

const DEFAULT_STATE: OrderSessionState = {
  ordering: [],
  hints: [],
  moves: 0,
  committedAt: null,
  score: null,
};

export function useOrderSession(
  puzzleId: Id<"orderPuzzles"> | null,
  baselineOrder: string[],
): UseOrderSessionReturn {
  const [state, setState] = useState<OrderSessionState>(() => ({
    ...DEFAULT_STATE,
    ordering: baselineOrder,
  }));

  const baselineSignature = useMemo(() => baselineOrder.join("|"), [baselineOrder]);

  useEffect(() => {
    setState({
      ordering: baselineOrder,
      hints: [],
      moves: 0,
      committedAt: null,
      score: null,
    });
  }, [puzzleId, baselineSignature, baselineOrder]);

  const setOrdering = useCallback((ordering: string[]) => {
    setState((prev) => ({
      ...prev,
      ordering,
      moves: prev.moves + 1,
    }));
  }, []);

  const addHint = useCallback((hint: OrderHint) => {
    setState((prev) => ({
      ...prev,
      hints: prev.hints.concat(hint),
    }));
  }, []);

  const resetSession = useCallback((ordering: string[]) => {
    setState({
      ordering,
      hints: [],
      moves: 0,
      committedAt: null,
      score: null,
    });
  }, []);

  const markCommitted = useCallback((score: OrderScore) => {
    setState((prev) => ({
      ...prev,
      committedAt: Date.now(),
      score,
    }));
  }, []);

  return useMemo(
    () => ({
      state,
      setOrdering,
      addHint,
      resetSession,
      markCommitted,
    }),
    [state, setOrdering, addHint, resetSession, markCommitted],
  );
}
