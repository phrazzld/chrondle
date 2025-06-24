import { describe, it, expect } from 'vitest';
import { detectSyncConflict, mergeGameStates, generateSyncCode } from '../sync';

describe('Anonymous Sync - Basic Functionality', () => {
  describe('Conflict Detection', () => {
    it('should detect no conflict when local and remote states match', () => {
      const localState = { 
        guesses: [1969], 
        isGameOver: false,
        timestamp: '2024-01-15T10:00:00.000Z'
      };
      const remoteState = { 
        guesses: [1969], 
        isGameOver: false,
        timestamp: '2024-01-15T10:00:00.000Z'
      };
      
      const hasConflict = detectSyncConflict(localState, remoteState);
      
      expect(hasConflict).toBe(false);
    });

    it('should detect conflict when guess arrays differ', () => {
      const localState = { 
        guesses: [1969], 
        isGameOver: false,
        timestamp: '2024-01-15T10:00:00.000Z'
      };
      const remoteState = { 
        guesses: [1970], 
        isGameOver: false,
        timestamp: '2024-01-15T10:00:00.000Z'
      };
      
      const hasConflict = detectSyncConflict(localState, remoteState);
      
      expect(hasConflict).toBe(true);
    });

    it('should detect conflict when game completion status differs', () => {
      const localState = { 
        guesses: [1969], 
        isGameOver: false,
        timestamp: '2024-01-15T10:00:00.000Z'
      };
      const remoteState = { 
        guesses: [1969], 
        isGameOver: true,
        timestamp: '2024-01-15T10:00:00.000Z'
      };
      
      const hasConflict = detectSyncConflict(localState, remoteState);
      
      expect(hasConflict).toBe(true);
    });
  });

  describe('State Merging', () => {
    it('should merge states by taking the most complete progress', () => {
      const localState = { 
        guesses: [1969], 
        isGameOver: false,
        timestamp: '2024-01-15T09:00:00.000Z'
      };
      const remoteState = { 
        guesses: [1969, 1970], 
        isGameOver: false,
        timestamp: '2024-01-15T10:00:00.000Z'
      };
      
      const merged = mergeGameStates(localState, remoteState);
      
      expect(merged.guesses).toEqual([1969, 1970]);
      expect(merged.isGameOver).toBe(false);
      expect(merged.timestamp).toBe('2024-01-15T10:00:00.000Z'); // Latest timestamp
    });

    it('should preserve completed game state when merging', () => {
      const localState = { 
        guesses: [1969], 
        isGameOver: true,
        timestamp: '2024-01-15T10:00:00.000Z'
      };
      const remoteState = { 
        guesses: [1969], 
        isGameOver: false,
        timestamp: '2024-01-15T09:00:00.000Z'
      };
      
      const merged = mergeGameStates(localState, remoteState);
      
      expect(merged.isGameOver).toBe(true); // Completed state wins
      expect(merged.timestamp).toBe('2024-01-15T10:00:00.000Z'); // Latest timestamp
    });

    it('should never lose guesses during merge', () => {
      const localState = { 
        guesses: [1969, 1970], 
        isGameOver: false,
        timestamp: '2024-01-15T10:00:00.000Z'
      };
      const remoteState = { 
        guesses: [1969], 
        isGameOver: false,
        timestamp: '2024-01-15T09:00:00.000Z'
      };
      
      const merged = mergeGameStates(localState, remoteState);
      
      expect(merged.guesses.length).toBeGreaterThanOrEqual(
        Math.max(localState.guesses.length, remoteState.guesses.length)
      );
      expect(merged.guesses).toEqual([1969, 1970]);
    });
  });

  describe('Sync Code Generation', () => {
    it('should generate 8-character uppercase sync code', () => {
      const code = generateSyncCode();
      
      expect(code).toHaveLength(8);
      expect(code).toMatch(/^[A-Z0-9]{8}$/);
      expect(code).toBe('TESTUUID'); // Based on our mocked UUID (test-uuid-... -> testuuid...)
    });

    it('should generate unique codes on subsequent calls', () => {
      // Override the mock for this test
      let callCount = 0;
      global.crypto.randomUUID = () => {
        return `mock${callCount++}-uuid-1234-5678-9abc-def123456789`;
      };
      
      const code1 = generateSyncCode();
      const code2 = generateSyncCode();
      
      expect(code1).not.toBe(code2);
    });
  });
});