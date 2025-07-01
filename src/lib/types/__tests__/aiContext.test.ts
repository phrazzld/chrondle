// Type validation tests for AI Context interfaces
// Ensures type definitions are correct and usable

import { describe, it, expect } from 'vitest';
import type {
  AIContextRequest,
  AIContextResponse,
  AIContextError,
  AIContextState,
  CachedAIContext,
  AIContextActions,
  UseAIContextReturn,
  AIContextDisplayProps
} from '../aiContext';

describe('AI Context Types', () => {
  it('should define correct AIContextRequest structure', () => {
    const request: AIContextRequest = {
      year: 1969,
      events: ['Moon landing', 'Woodstock festival']
    };

    expect(typeof request.year).toBe('number');
    expect(Array.isArray(request.events)).toBe(true);
    expect(request.events.length).toBeGreaterThan(0);
  });

  it('should define correct AIContextResponse structure', () => {
    const response: AIContextResponse = {
      context: 'Historical context for 1969...',
      year: 1969,
      generatedAt: '2024-01-01T00:00:00Z',
      source: 'openrouter-gemini'
    };

    expect(typeof response.context).toBe('string');
    expect(typeof response.year).toBe('number');
    expect(typeof response.generatedAt).toBe('string');
    expect(typeof response.source).toBe('string');
  });

  it('should define correct AIContextError structure', () => {
    const error: AIContextError = {
      error: 'Failed to generate context'
    };

    const errorWithCode: AIContextError = {
      error: 'Rate limit exceeded',
      code: 'RATE_LIMIT'
    };

    expect(typeof error.error).toBe('string');
    expect(error.code).toBeUndefined();
    expect(typeof errorWithCode.code).toBe('string');
  });

  it('should define correct AIContextState structure', () => {
    const initialState: AIContextState = {
      data: null,
      loading: false,
      error: null,
      enabled: true
    };

    const loadedState: AIContextState = {
      data: {
        context: 'Test context',
        year: 1969,
        generatedAt: '2024-01-01T00:00:00Z',
        source: 'test'
      },
      loading: false,
      error: null,
      enabled: true
    };

    expect(initialState.data).toBeNull();
    expect(typeof initialState.loading).toBe('boolean');
    expect(initialState.error).toBeNull();
    expect(typeof initialState.enabled).toBe('boolean');
    
    expect(loadedState.data).toBeTruthy();
    expect(loadedState.data?.context).toBe('Test context');
  });

  it('should define correct CachedAIContext structure', () => {
    const cached: CachedAIContext = {
      context: {
        context: 'Cached context',
        year: 1969,
        generatedAt: '2024-01-01T00:00:00Z',
        source: 'test'
      },
      cachedAt: Date.now(),
      cacheKey: 'context-1969-hash'
    };

    expect(typeof cached.context).toBe('object');
    expect(typeof cached.cachedAt).toBe('number');
    expect(typeof cached.cacheKey).toBe('string');
  });

  it('should define correct AIContextActions structure', () => {
    const mockActions: AIContextActions = {
      generateContext: async (year: number, events: string[]) => {
        expect(typeof year).toBe('number');
        expect(Array.isArray(events)).toBe(true);
      },
      clearContext: () => {
        // Mock implementation
      },
      retryGeneration: async () => {
        // Mock implementation
      },
      toggleEnabled: () => {
        // Mock implementation
      }
    };

    expect(typeof mockActions.generateContext).toBe('function');
    expect(typeof mockActions.clearContext).toBe('function');
    expect(typeof mockActions.retryGeneration).toBe('function');
    expect(typeof mockActions.toggleEnabled).toBe('function');
  });

  it('should define correct UseAIContextReturn structure', () => {
    const hookReturn: UseAIContextReturn = {
      data: null,
      loading: false,
      error: null,
      enabled: true,
      actions: {
        generateContext: async () => {},
        clearContext: () => {},
        retryGeneration: async () => {},
        toggleEnabled: () => {}
      }
    };

    // Should extend AIContextState
    expect(hookReturn.data).toBeNull();
    expect(typeof hookReturn.loading).toBe('boolean');
    expect(hookReturn.error).toBeNull();
    expect(typeof hookReturn.enabled).toBe('boolean');
    
    // Should include actions
    expect(typeof hookReturn.actions).toBe('object');
    expect(typeof hookReturn.actions.generateContext).toBe('function');
  });

  it('should define correct AIContextDisplayProps structure', () => {
    const props: AIContextDisplayProps = {
      context: {
        data: null,
        loading: false,
        error: null,
        enabled: true
      }
    };

    const propsWithCallbacks: AIContextDisplayProps = {
      context: {
        data: null,
        loading: false,
        error: null,
        enabled: true
      },
      onRetry: () => {},
      onToggleEnabled: () => {},
      className: 'custom-class'
    };

    expect(typeof props.context).toBe('object');
    expect(props.onRetry).toBeUndefined();
    expect(props.onToggleEnabled).toBeUndefined();
    expect(props.className).toBeUndefined();
    
    expect(typeof propsWithCallbacks.onRetry).toBe('function');
    expect(typeof propsWithCallbacks.onToggleEnabled).toBe('function');
    expect(typeof propsWithCallbacks.className).toBe('string');
  });
});