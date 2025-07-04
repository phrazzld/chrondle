'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { openRouterService } from '@/lib/openrouter';
import { AI_CONFIG } from '@/lib/constants';
import type { 
  AIContextState, 
  AIContextResponse,
  UseAIContextReturn,
  AIContextActions
} from '@/lib/types/aiContext';

/**
 * Custom hook for managing AI historical context
 * Simplified version with no client-side caching - relies on OpenRouter caching
 */
export function useHistoricalContext(year?: number, events?: string[]): UseAIContextReturn {
  const [data, setData] = useState<AIContextResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(true);

  // Generate context for given year and events
  const generateContext = useCallback(async (targetYear: number, targetEvents: string[]): Promise<void> => {
    if (!enabled) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Generate new context using OpenRouter service (relies on OpenRouter's caching)
      const response = await openRouterService.getHistoricalContext(targetYear, targetEvents);
      setData(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate historical context';
      console.error('Historical context generation error:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  // Clear current context and error state
  const clearContext = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  // Retry failed context generation
  const retryGeneration = useCallback(async (): Promise<void> => {
    if (!year || !events || events.length === 0) return;
    await generateContext(year, events);
  }, [year, events, generateContext]);

  // Toggle AI context feature on/off
  const toggleEnabled = useCallback(() => {
    setEnabled(prev => !prev);
    if (!enabled) {
      // If re-enabling and we have year/events, generate context
      if (year && events && events.length > 0) {
        generateContext(year, events);
      }
    } else {
      // If disabling, clear current state
      clearContext();
      setLoading(false);
    }
  }, [enabled, year, events, generateContext, clearContext]);

  // Auto-generate context when year/events change (if enabled)
  useEffect(() => {
    if (!enabled || !year || !events || events.length === 0) return;
    
    // Generate context directly - no caching logic
    generateContext(year, events);
  }, [year, events, enabled, generateContext]);

  // Create actions object
  const actions: AIContextActions = useMemo(() => ({
    generateContext,
    clearContext,
    retryGeneration,
    toggleEnabled
  }), [generateContext, clearContext, retryGeneration, toggleEnabled]);

  // Create state object
  const state: AIContextState = useMemo(() => ({
    data,
    loading,
    error,
    enabled
  }), [data, loading, error, enabled]);

  return {
    ...state,
    actions
  };
}

/**
 * Hook for managing AI context settings/preferences
 * Simplified version without localStorage persistence
 */
export function useAIContextSettings() {
  const [enabled, setEnabled] = useState<boolean>(AI_CONFIG.FEATURE_ENABLED);

  const toggleEnabled = useCallback(() => {
    setEnabled(prev => !prev);
  }, []);

  return {
    enabled,
    toggleEnabled
  };
}