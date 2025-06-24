import { describe, it, expect, beforeEach } from 'vitest';
import { 
  saveSyncData, 
  loadSyncData, 
  exportGameDataForSync,
  importSyncDataToStorage,
  getSyncCode,
  setSyncCode,
  clearSyncCode
} from '../syncStorage';
import { SyncData } from '../sync';

describe('Sync Storage Integration', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('Sync Code Management', () => {
    it('should save and retrieve sync code', () => {
      const code = 'ABC12345';
      
      setSyncCode(code);
      const retrieved = getSyncCode();
      
      expect(retrieved).toBe(code);
    });

    it('should return null when no sync code exists', () => {
      const code = getSyncCode();
      expect(code).toBeNull();
    });

    it('should clear sync code', () => {
      setSyncCode('ABC12345');
      expect(getSyncCode()).toBe('ABC12345');
      
      clearSyncCode();
      expect(getSyncCode()).toBeNull();
    });
  });

  describe('Local Sync Data Storage', () => {
    it('should save and load sync data', () => {
      const syncData: SyncData = {
        version: 1,
        lastSync: '2024-01-15T10:00:00.000Z',
        gameState: {
          guesses: [1969, 1970],
          isGameOver: false,
          timestamp: '2024-01-15T10:00:00.000Z'
        },
        settings: { darkMode: true },
        deviceFingerprint: 'test-device'
      };

      const success = saveSyncData(syncData);
      expect(success).toBe(true);

      const loaded = loadSyncData();
      expect(loaded).toEqual(syncData);
    });

    it('should return null when no sync data exists', () => {
      const data = loadSyncData();
      expect(data).toBeNull();
    });

    it('should handle corrupted sync data gracefully', () => {
      // Manually corrupt the sync data
      localStorage.setItem('chrondle-sync-data', 'invalid-json');
      
      const data = loadSyncData();
      expect(data).toBeNull();
    });
  });

  describe('Game Data Export/Import', () => {
    it('should export current game data for sync', () => {
      // Set up some test data in localStorage
      localStorage.setItem('chrondle-progress-2024-01-15', JSON.stringify({
        guesses: [1969],
        isGameOver: false,
        timestamp: '2024-01-15T10:00:00.000Z'
      }));
      
      localStorage.setItem('chrondle-settings', JSON.stringify({
        darkMode: true,
        colorBlindMode: false
      }));

      const exported = exportGameDataForSync('2024-01-15');
      
      expect(exported.gameState.guesses).toEqual([1969]);
      expect(exported.gameState.isGameOver).toBe(false);
      expect(exported.settings).toEqual({
        darkMode: true,
        colorBlindMode: false
      });
      expect(exported.version).toBe(1);
    });

    it('should handle missing game progress gracefully', () => {
      const exported = exportGameDataForSync('2024-01-15');
      
      expect(exported.gameState.guesses).toEqual([]);
      expect(exported.gameState.isGameOver).toBe(false);
      expect(exported.settings).toEqual({});
    });

    it('should import sync data to localStorage', () => {
      const syncData: SyncData = {
        version: 1,
        lastSync: '2024-01-15T10:00:00.000Z',
        gameState: {
          guesses: [1969, 1970],
          isGameOver: true,
          timestamp: '2024-01-15T10:00:00.000Z'
        },
        settings: { darkMode: true, colorBlindMode: false },
        deviceFingerprint: 'test-device'
      };

      const success = importSyncDataToStorage(syncData, '2024-01-15');
      expect(success).toBe(true);

      // Verify the data was imported correctly
      const progressData = localStorage.getItem('chrondle-progress-2024-01-15');
      const progress = JSON.parse(progressData!);
      
      expect(progress.guesses).toEqual([1969, 1970]);
      expect(progress.isGameOver).toBe(true);

      const settingsData = localStorage.getItem('chrondle-settings');
      const settings = JSON.parse(settingsData!);
      
      expect(settings.darkMode).toBe(true);
      expect(settings.colorBlindMode).toBe(false);
    });
  });
});