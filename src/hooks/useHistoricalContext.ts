'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { openRouterService } from '@/lib/openrouter';
import { AI_CONFIG, STORAGE_KEYS } from '@/lib/constants';
import type { 
  AIContextState, 
  AIContextResponse, 
  CachedAIContext,
  UseAIContextReturn,
  AIContextActions
} from '@/lib/types/aiContext';

/**
 * Custom hook for managing AI historical context
 * Follows useGameState patterns and integrates with OpenRouter service
 */
export function useHistoricalContext(year?: number, events?: string[]): UseAIContextReturn {
  const [data, setData] = useState<AIContextResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(true);

  // Generate cache key for the current year/events combination
  const cacheKey = useMemo(() => {
    if (!year || !events || events.length === 0) return null;
    const eventsHash = events.join('|').slice(0, 50); // Truncate for manageable keys
    return `${year}-${eventsHash}`;
  }, [year, events]);

  // Check cache for existing context
  const getCachedContext = useCallback((key: string): AIContextResponse | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const cached = localStorage.getItem(`${STORAGE_KEYS.AI_CONTEXT_PREFIX}${key}`);
      if (!cached) return null;
      
      const cachedData: CachedAIContext = JSON.parse(cached);
      const isExpired = Date.now() - cachedData.cachedAt > AI_CONFIG.CACHE_TTL;
      
      if (isExpired) {
        localStorage.removeItem(`${STORAGE_KEYS.AI_CONTEXT_PREFIX}${key}`);
        return null;
      }
      
      return cachedData.context;
    } catch (error) {
      console.error('Error reading AI context cache:', error);
      return null;
    }
  }, []);

  // Save context to cache
  const setCachedContext = useCallback((key: string, context: AIContextResponse): void => {
    if (typeof window === 'undefined') return;
    
    try {
      const cachedData: CachedAIContext = {
        context,
        cachedAt: Date.now(),
        cacheKey: key
      };
      localStorage.setItem(`${STORAGE_KEYS.AI_CONTEXT_PREFIX}${key}`, JSON.stringify(cachedData));
    } catch (error) {
      console.error('Error saving AI context cache:', error);
    }
  }, []);

  // Generate context for given year and events
  const generateContext = useCallback(async (targetYear: number, targetEvents: string[]): Promise<void> => {
    if (!enabled) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Generate cache key for this request
      const eventsHash = targetEvents.join('|').slice(0, 50);
      const requestCacheKey = `${targetYear}-${eventsHash}`;
      
      // Check cache first
      const cached = getCachedContext(requestCacheKey);
      if (cached) {
        setData(cached);
        setLoading(false);
        return;
      }
      
      // Generate new context using OpenRouter service
      const response = await openRouterService.getHistoricalContext(targetYear, targetEvents);
      
      // Cache the response
      setCachedContext(requestCacheKey, response);
      
      setData(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate historical context';
      console.error('Historical context generation error:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [enabled, getCachedContext, setCachedContext]);

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
    if (!enabled || !year || !events || events.length === 0 || !cacheKey) return;
    
    // Check cache first
    const cached = getCachedContext(cacheKey);
    if (cached) {
      setData(cached);
      return;
    }
    
    // Generate new context if not cached
    generateContext(year, events);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, events, enabled, cacheKey]); // Remove generateContext and getCachedContext from deps to prevent infinite loops

  // Cleanup old cache entries on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const cleanupCache = () => {
      try {
        const keys = Object.keys(localStorage);
        const aiContextKeys = keys.filter(key => key.startsWith(STORAGE_KEYS.AI_CONTEXT_PREFIX));
        
        for (const key of aiContextKeys) {
          const cached = localStorage.getItem(key);
          if (cached) {
            try {
              const cachedData: CachedAIContext = JSON.parse(cached);
              const isExpired = Date.now() - cachedData.cachedAt > AI_CONFIG.CACHE_TTL;
              
              if (isExpired) {
                localStorage.removeItem(key);
              }
            } catch {
              // Remove corrupted cache entries
              localStorage.removeItem(key);
            }
          }
        }
      } catch (error) {
        console.error('Error cleaning up AI context cache:', error);
      }
    };
    
    cleanupCache();
  }, []);

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
 */
export function useAIContextSettings() {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === 'undefined') return AI_CONFIG.FEATURE_ENABLED;
    
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AI_CONTEXT_CACHE);
      return saved ? JSON.parse(saved).enabled : AI_CONFIG.FEATURE_ENABLED;
    } catch {
      return AI_CONFIG.FEATURE_ENABLED;
    }
  });

  const toggleEnabled = useCallback(() => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.AI_CONTEXT_CACHE, JSON.stringify({ enabled: newEnabled }));
      } catch (error) {
        console.error('Error saving AI context settings:', error);
      }
    }
  }, [enabled]);

  return {
    enabled,
    toggleEnabled
  };
}