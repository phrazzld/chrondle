import { logger } from "@/lib/logger";
import type { OrderGameState, OrderHint, OrderPuzzle, OrderScore } from "@/types/orderGameState";

/**
 * Orthogonal data sources required to derive the Order game state.
 */
export interface OrderDataSources {
  puzzle: {
    puzzle: OrderPuzzle | null;
    isLoading: boolean;
    error: Error | null;
  };
  auth: {
    userId: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
  };
  progress: {
    progress: OrderProgressData | null;
    isLoading: boolean;
  };
  session: OrderSessionState;
}

/**
 * Authenticated user progress stored on the server.
 */
export interface OrderProgressData {
  ordering: string[];
  hints: OrderHint[];
  completedAt: number | null;
  score: OrderScore | null;
}

/**
 * Anonymous/local session state stored in localStorage.
 */
export interface OrderSessionState {
  ordering: string[];
  hints: OrderHint[];
  committedAt: number | null;
  score: OrderScore | null;
}

/**
 * Pure function that derives the Order game state from orthogonal data sources.
 * Mirrors the Classic deriveGameState implementation while accounting for
 * ordering-specific behaviors.
 */
export function deriveOrderGameState(sources: OrderDataSources): OrderGameState {
  try {
    const { puzzle, auth, progress, session } = sources;

    if (puzzle.isLoading) {
      return { status: "loading-puzzle" };
    }

    if (puzzle.error) {
      return {
        status: "error",
        error: puzzle.error.message || "Failed to load Order puzzle",
      };
    }

    if (!puzzle.puzzle) {
      return { status: "error", error: "No Order puzzle available" };
    }

    if (auth.isLoading) {
      return { status: "loading-auth" };
    }

    if (auth.isAuthenticated && progress.isLoading) {
      return { status: "loading-progress" };
    }

    const orderPuzzle = puzzle.puzzle;
    const baselineOrder = orderPuzzle.events.map((event) => event.id);

    const serverOrdering =
      auth.isAuthenticated && progress.progress ? progress.progress.ordering : null;
    const currentOrder = normalizeOrdering(serverOrdering, session.ordering, baselineOrder);

    const serverHints = auth.isAuthenticated && progress.progress ? progress.progress.hints : [];
    const hints = mergeHints(serverHints, session.hints);

    const isServerComplete =
      auth.isAuthenticated && Boolean(progress.progress?.completedAt ?? null);
    const isSessionComplete = !auth.isAuthenticated && Boolean(session.committedAt);

    if (isServerComplete || isSessionComplete) {
      const score =
        (auth.isAuthenticated ? progress.progress?.score : null) ?? session.score ?? null;

      if (!score) {
        throw new Error("Completed Order puzzle is missing score data");
      }

      const finalOrder = normalizeOrdering(
        isServerComplete ? serverOrdering : null,
        isSessionComplete ? session.ordering : [],
        baselineOrder,
      );

      const correctOrder = [...orderPuzzle.events]
        .sort((a, b) => a.year - b.year)
        .map((event) => event.id);

      return {
        status: "completed",
        puzzle: orderPuzzle,
        finalOrder,
        correctOrder,
        score,
        hints,
      };
    }

    return {
      status: "ready",
      puzzle: orderPuzzle,
      currentOrder,
      hints,
    };
  } catch (error) {
    logger.error("Error deriving Order game state:", error);
    return {
      status: "error",
      error:
        error instanceof Error
          ? `Order state derivation failed: ${error.message}`
          : "Failed to calculate Order game state",
    };
  }
}

/**
 * Ensures ordering arrays contain every puzzle event exactly once.
 * Prefers server ordering, falls back to session ordering, then puzzle baseline.
 */
function normalizeOrdering(
  preferred: string[] | null,
  fallback: string[],
  baseline: string[],
): string[] {
  const validIds = new Set(baseline);

  const build = (candidate?: string[] | null): string[] | null => {
    if (!candidate || candidate.length === 0) {
      return null;
    }

    const seen = new Set<string>();
    const normalized: string[] = [];

    for (const id of candidate) {
      if (validIds.has(id) && !seen.has(id)) {
        normalized.push(id);
        seen.add(id);
      }
    }

    for (const id of baseline) {
      if (!seen.has(id)) {
        normalized.push(id);
        seen.add(id);
      }
    }

    return normalized;
  };

  return build(preferred) ?? build(fallback) ?? [...baseline];
}

/**
 * Deduplicates hints while preserving server-provided entries first.
 */
function mergeHints(serverHints: OrderHint[], sessionHints: OrderHint[]): OrderHint[] {
  const serialized = new Set(serverHints.map(serializeHint));
  const merged = [...serverHints];

  for (const hint of sessionHints) {
    const key = serializeHint(hint);
    if (!serialized.has(key)) {
      serialized.add(key);
      merged.push(hint);
    }
  }

  return merged;
}

function serializeHint(hint: OrderHint): string {
  switch (hint.type) {
    case "anchor":
      return `anchor:${hint.eventId}:${hint.position}`;
    case "relative":
      return `relative:${hint.earlierEventId}:${hint.laterEventId}`;
    case "bracket":
      return `bracket:${hint.eventId}:${hint.yearRange[0]}-${hint.yearRange[1]}`;
    default:
      return JSON.stringify(hint);
  }
}
