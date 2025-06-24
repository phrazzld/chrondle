import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSync } from '../useSync';

// Mock the storage functions
vi.mock('@/lib/syncStorage', () => ({
  getSyncCode: vi.fn(() => null),
  setSyncCode: vi.fn(() => true),
  clearSyncCode: vi.fn(() => true),
  exportGameDataForSync: vi.fn(() => ({
    version: 1,
    lastSync: '2024-01-15T10:00:00.000Z',
    gameState: { guesses: [], isGameOver: false, timestamp: '2024-01-15T10:00:00.000Z' },
    settings: {},
    deviceFingerprint: 'test-device'
  })),
  getSyncStatus: vi.fn(() => ({
    isConfigured: false,
    syncCode: null,
    lastSync: null,
    hasLocalData: false,
    deviceFingerprint: null
  }))
}));

vi.mock('@/lib/sync', () => ({
  generateSyncCode: vi.fn(() => 'ABC12345')
}));

describe('useSync Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with idle state', () => {
    const { result } = renderHook(() => useSync());
    
    expect(result.current.status).toBe('idle');
    expect(result.current.syncCode).toBeNull();
    expect(result.current.isConfigured).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should generate sync code', async () => {
    const { result } = renderHook(() => useSync());
    
    await act(async () => {
      const code = await result.current.generateCode();
      expect(code).toBe('ABC12345');
    });
    
    expect(result.current.status).toBe('idle');
    expect(result.current.syncCode).toBe('ABC12345');
  });

  it('should handle sync code generation error', async () => {
    const { generateSyncCode } = await import('@/lib/sync');
    vi.mocked(generateSyncCode).mockImplementation(() => {
      throw new Error('Crypto not available');
    });
    
    const { result } = renderHook(() => useSync());
    
    await act(async () => {
      const code = await result.current.generateCode();
      expect(code).toBeNull();
    });
    
    expect(result.current.status).toBe('error');
    expect(result.current.error).toContain('Failed to generate sync code');
  });

  it('should enable sync with valid code', async () => {
    const { result } = renderHook(() => useSync());
    
    await act(async () => {
      const success = await result.current.enableSync('ABC12345');
      expect(success).toBe(true);
    });
    
    expect(result.current.syncCode).toBe('ABC12345');
    expect(result.current.isConfigured).toBe(true);
  });
});