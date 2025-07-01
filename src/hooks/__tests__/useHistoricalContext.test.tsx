// Tests for useHistoricalContext Hook
// Following React Testing Library patterns and useGameState test structure

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useHistoricalContext, useAIContextSettings } from '../useHistoricalContext';
import { openRouterService } from '@/lib/openrouter';
import { AI_CONFIG, STORAGE_KEYS } from '@/lib/constants';
import type { AIContextResponse } from '@/lib/types/aiContext';

// Mock the OpenRouter service
vi.mock('@/lib/openrouter', () => ({
  openRouterService: {
    getHistoricalContext: vi.fn()
  }
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    key: (index: number) => Object.keys(store)[index] || null,
    get length() { return Object.keys(store).length; },
    keys: () => Object.keys(store),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Helper function to create mock AI response
function createMockAIResponse(year: number = 1969): AIContextResponse {
  return {
    context: `Historical context for ${year} with significant events and cultural impact.`,
    year,
    generatedAt: '2024-01-01T00:00:00Z',
    source: 'openrouter-gemini'
  };
}

describe('useHistoricalContext', () => {
  const mockGetHistoricalContext = vi.mocked(openRouterService.getHistoricalContext);

  beforeEach(() => {
    localStorageMock.clear();
    mockGetHistoricalContext.mockClear();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Basic Functionality', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useHistoricalContext());

      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.enabled).toBe(true);
      expect(result.current.actions).toBeDefined();
    });

    it('should not auto-generate when year or events are missing', () => {
      renderHook(() => useHistoricalContext(1969)); // events missing
      renderHook(() => useHistoricalContext(undefined, ['Moon landing'])); // year missing
      renderHook(() => useHistoricalContext(1969, [])); // empty events

      expect(mockGetHistoricalContext).not.toHaveBeenCalled();
    });

    it('should auto-generate context when year and events are provided', async () => {
      const mockResponse = createMockAIResponse(1969);
      mockGetHistoricalContext.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => 
        useHistoricalContext(1969, ['Moon landing', 'Woodstock'])
      );

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockGetHistoricalContext).toHaveBeenCalledWith(1969, ['Moon landing', 'Woodstock']);
      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Manual Context Generation', () => {
    it('should generate context manually via actions', async () => {
      const mockResponse = createMockAIResponse(1776);
      mockGetHistoricalContext.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useHistoricalContext());

      await act(async () => {
        await result.current.actions.generateContext(1776, ['Declaration of Independence']);
      });

      expect(mockGetHistoricalContext).toHaveBeenCalledWith(1776, ['Declaration of Independence']);
      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.loading).toBe(false);
    });

    it('should handle generation errors gracefully', async () => {
      const error = new Error('Network error');
      mockGetHistoricalContext.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useHistoricalContext());

      await act(async () => {
        await result.current.actions.generateContext(1969, ['Moon landing']);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBe('Network error');
      expect(result.current.loading).toBe(false);
    });

    it('should not generate when disabled', async () => {
      const { result } = renderHook(() => useHistoricalContext());

      act(() => {
        result.current.actions.toggleEnabled(); // Disable
      });

      await act(async () => {
        await result.current.actions.generateContext(1969, ['Moon landing']);
      });

      expect(mockGetHistoricalContext).not.toHaveBeenCalled();
      expect(result.current.data).toBeNull();
    });
  });

  describe('Caching Functionality', () => {
    it('should cache successful responses', async () => {
      const mockResponse = createMockAIResponse(1969);
      mockGetHistoricalContext.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => 
        useHistoricalContext(1969, ['Moon landing'])
      );

      await waitFor(() => {
        expect(result.current.data).toEqual(mockResponse);
      });

      // Check that context was cached
      const cacheKey = '1969-Moon landing';
      const cached = localStorageMock.getItem(`${STORAGE_KEYS.AI_CONTEXT_PREFIX}${cacheKey}`);
      expect(cached).toBeTruthy();

      const cachedData = JSON.parse(cached!);
      expect(cachedData.context).toEqual(mockResponse);
      expect(cachedData.cacheKey).toBe(cacheKey);
    });

    it('should use cached context when available', async () => {
      const mockResponse = createMockAIResponse(1969);
      const cacheKey = '1969-Moon landing';
      const cachedData = {
        context: mockResponse,
        cachedAt: Date.now(),
        cacheKey
      };

      localStorageMock.setItem(
        `${STORAGE_KEYS.AI_CONTEXT_PREFIX}${cacheKey}`,
        JSON.stringify(cachedData)
      );

      const { result } = renderHook(() => 
        useHistoricalContext(1969, ['Moon landing'])
      );

      // Should use cache, not call service
      expect(mockGetHistoricalContext).not.toHaveBeenCalled();
      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.loading).toBe(false);
    });

    it('should ignore expired cache entries', async () => {
      const mockResponse = createMockAIResponse(1969);
      mockGetHistoricalContext.mockResolvedValueOnce(mockResponse);

      const cacheKey = '1969-Moon landing';
      const expiredCachedData = {
        context: createMockAIResponse(1969),
        cachedAt: Date.now() - AI_CONFIG.CACHE_TTL - 1000, // Expired
        cacheKey
      };

      localStorageMock.setItem(
        `${STORAGE_KEYS.AI_CONTEXT_PREFIX}${cacheKey}`,
        JSON.stringify(expiredCachedData)
      );

      const { result } = renderHook(() => 
        useHistoricalContext(1969, ['Moon landing'])
      );

      await waitFor(() => {
        expect(result.current.data).toEqual(mockResponse);
      });

      // Should call service because cache was expired
      expect(mockGetHistoricalContext).toHaveBeenCalled();
    });

    it('should handle corrupted cache gracefully', async () => {
      const mockResponse = createMockAIResponse(1969);
      mockGetHistoricalContext.mockResolvedValueOnce(mockResponse);

      const cacheKey = '1969-Moon landing';
      localStorageMock.setItem(
        `${STORAGE_KEYS.AI_CONTEXT_PREFIX}${cacheKey}`,
        'invalid json'
      );

      const { result } = renderHook(() => 
        useHistoricalContext(1969, ['Moon landing'])
      );

      await waitFor(() => {
        expect(result.current.data).toEqual(mockResponse);
      });

      // Should call service because cache was corrupted
      expect(mockGetHistoricalContext).toHaveBeenCalled();
    });
  });

  describe('Action Functions', () => {
    it('should clear context and error via clearContext action', async () => {
      const mockResponse = createMockAIResponse(1969);
      mockGetHistoricalContext.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => 
        useHistoricalContext(1969, ['Moon landing'])
      );

      await waitFor(() => {
        expect(result.current.data).toEqual(mockResponse);
      });

      act(() => {
        result.current.actions.clearContext();
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should retry generation via retryGeneration action', async () => {
      const error = new Error('Network error');
      const mockResponse = createMockAIResponse(1969);
      
      mockGetHistoricalContext
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => 
        useHistoricalContext(1969, ['Moon landing'])
      );

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
      });

      await act(async () => {
        await result.current.actions.retryGeneration();
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.error).toBeNull();
    });

    it('should toggle enabled state and generate when re-enabled', async () => {
      const mockResponse = createMockAIResponse(1969);
      mockGetHistoricalContext.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => 
        useHistoricalContext(1969, ['Moon landing'])
      );

      // Disable
      act(() => {
        result.current.actions.toggleEnabled();
      });

      expect(result.current.enabled).toBe(false);
      expect(result.current.data).toBeNull();

      // Re-enable
      act(() => {
        result.current.actions.toggleEnabled();
      });

      expect(result.current.enabled).toBe(true);

      await waitFor(() => {
        expect(result.current.data).toEqual(mockResponse);
      });
    });
  });

  describe('Cache Cleanup', () => {
    it('should cleanup expired cache entries on mount', () => {
      // Add some cache entries - one valid, one expired
      const validCacheKey = 'valid-key';
      const expiredCacheKey = 'expired-key';

      localStorageMock.setItem(
        `${STORAGE_KEYS.AI_CONTEXT_PREFIX}${validCacheKey}`,
        JSON.stringify({
          context: createMockAIResponse(1969),
          cachedAt: Date.now(),
          cacheKey: validCacheKey
        })
      );

      localStorageMock.setItem(
        `${STORAGE_KEYS.AI_CONTEXT_PREFIX}${expiredCacheKey}`,
        JSON.stringify({
          context: createMockAIResponse(1776),
          cachedAt: Date.now() - AI_CONFIG.CACHE_TTL - 1000,
          cacheKey: expiredCacheKey
        })
      );

      // Mount hook to trigger cleanup
      renderHook(() => useHistoricalContext());

      // Valid cache should remain
      expect(localStorageMock.getItem(`${STORAGE_KEYS.AI_CONTEXT_PREFIX}${validCacheKey}`)).toBeTruthy();
      
      // Expired cache should be removed
      expect(localStorageMock.getItem(`${STORAGE_KEYS.AI_CONTEXT_PREFIX}${expiredCacheKey}`)).toBeNull();
    });
  });
});

describe('useAIContextSettings', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should initialize with default enabled state', () => {
    const { result } = renderHook(() => useAIContextSettings());

    expect(result.current.enabled).toBe(AI_CONFIG.FEATURE_ENABLED);
  });

  it('should load saved settings from localStorage', () => {
    localStorageMock.setItem(STORAGE_KEYS.AI_CONTEXT_CACHE, JSON.stringify({ enabled: false }));

    const { result } = renderHook(() => useAIContextSettings());

    expect(result.current.enabled).toBe(false);
  });

  it('should toggle enabled state and save to localStorage', () => {
    const { result } = renderHook(() => useAIContextSettings());

    act(() => {
      result.current.toggleEnabled();
    });

    expect(result.current.enabled).toBe(false);

    const saved = localStorageMock.getItem(STORAGE_KEYS.AI_CONTEXT_CACHE);
    expect(JSON.parse(saved!).enabled).toBe(false);
  });

  it('should handle localStorage errors gracefully', () => {
    // Mock localStorage to throw errors
    vi.spyOn(localStorageMock, 'setItem').mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });

    const { result } = renderHook(() => useAIContextSettings());

    // Should not throw error
    act(() => {
      result.current.toggleEnabled();
    });

    expect(result.current.enabled).toBe(false); // State should still update
  });
});