"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { openRouterService } from "@/lib/openrouter";
import { AI_CONFIG } from "@/lib/constants";
import type {
  AIContextState,
  AIContextResponse,
  UseAIContextReturn,
  AIContextActions,
} from "@/lib/types/aiContext";

/**
 * Custom hook for managing AI historical context
 * Simplified version with no client-side caching - relies on OpenRouter caching
 */
export function useHistoricalContext(
  year?: number,
  events?: string[],
): UseAIContextReturn {
  const [data, setData] = useState<AIContextResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(true);

  // Generate context for given year and events
  const generateContext = useCallback(
    async (
      targetYear: number,
      targetEvents: string[],
      abortSignal?: AbortSignal,
    ): Promise<void> => {
      if (!enabled) return;

      // Validate inputs before making API call
      if (
        !targetYear ||
        !Array.isArray(targetEvents) ||
        targetEvents.length === 0
      ) {
        console.warn(
          "useHistoricalContext: Invalid inputs - year:",
          targetYear,
          "events:",
          targetEvents,
        );
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Generate new context using OpenRouter service (relies on OpenRouter's caching)
        const response = await openRouterService.getHistoricalContext(
          targetYear,
          targetEvents,
          abortSignal,
        );

        // Only update state if not aborted
        if (!abortSignal?.aborted) {
          setData(response);
        }
      } catch (err) {
        // Ignore AbortError when request is cancelled
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to generate historical context";
        console.error("Historical context generation error:", err);
        if (!abortSignal?.aborted) {
          setError(errorMessage);
        }
      } finally {
        if (!abortSignal?.aborted) {
          setLoading(false);
        }
      }
    },
    [enabled],
  );

  // Clear current context and error state
  const clearContext = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  // Retry failed context generation
  const retryGeneration = useCallback(async (): Promise<void> => {
    if (!year || !Array.isArray(events) || events.length === 0) {
      console.warn(
        "useHistoricalContext: Cannot retry - invalid inputs - year:",
        year,
        "events:",
        events,
      );
      return;
    }
    await generateContext(year, events);
  }, [year, events, generateContext]);

  // Toggle AI context feature on/off
  const toggleEnabled = useCallback(() => {
    setEnabled((prev) => !prev);
    if (!enabled) {
      // If re-enabling and we have year/events, generate context
      if (year && Array.isArray(events) && events.length > 0) {
        generateContext(year, events); // No abort signal for manual toggle
      }
    } else {
      // If disabling, clear current state
      clearContext();
      setLoading(false);
    }
  }, [enabled, year, events, generateContext, clearContext]);

  // Auto-generate context when year/events change (if enabled)
  useEffect(() => {
    if (!enabled || !year || !Array.isArray(events) || events.length === 0)
      return;

    // Create AbortController for this effect
    const abortController = new AbortController();

    // Generate context with abort signal
    generateContext(year, events, abortController.signal);

    // Cleanup: abort any pending requests when effect runs again or component unmounts
    return () => {
      abortController.abort();
    };
  }, [year, events, enabled, generateContext]);

  // Create actions object
  const actions: AIContextActions = useMemo(
    () => ({
      generateContext,
      clearContext,
      retryGeneration,
      toggleEnabled,
    }),
    [generateContext, clearContext, retryGeneration, toggleEnabled],
  );

  // Create state object
  const state: AIContextState = useMemo(
    () => ({
      data,
      loading,
      error,
      enabled,
    }),
    [data, loading, error, enabled],
  );

  return {
    ...state,
    actions,
  };
}

/**
 * Hook for managing AI context settings/preferences
 * Simplified version without localStorage persistence
 */
export function useAIContextSettings() {
  const [enabled, setEnabled] = useState<boolean>(AI_CONFIG.FEATURE_ENABLED);

  const toggleEnabled = useCallback(() => {
    setEnabled((prev) => !prev);
  }, []);

  return {
    enabled,
    toggleEnabled,
  };
}
