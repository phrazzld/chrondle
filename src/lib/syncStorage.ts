// Sync storage integration for Chrondle
// Extends existing storage.ts with sync capabilities

import { 
  safeGetItem, 
  safeSetItem, 
  safeRemoveItem, 
  loadSettings, 
  saveSettings 
} from './storage';
import { STORAGE_KEYS } from './constants';
import { 
  SyncData, 
  SyncableGameState, 
  createSyncData, 
  validateSyncData 
} from './sync';

// Extend storage keys for sync functionality
const SYNC_STORAGE_KEYS = {
  SYNC_CODE: 'chrondle-sync-code',
  SYNC_DATA: 'chrondle-sync-data',
  LAST_SYNC: 'chrondle-last-sync',
} as const;

// ===== SYNC CODE MANAGEMENT =====

/**
 * Saves the user's sync code to localStorage
 */
export function setSyncCode(code: string): boolean {
  return safeSetItem(SYNC_STORAGE_KEYS.SYNC_CODE, code);
}

/**
 * Retrieves the user's sync code from localStorage
 */
export function getSyncCode(): string | null {
  return safeGetItem(SYNC_STORAGE_KEYS.SYNC_CODE);
}

/**
 * Clears the user's sync code from localStorage
 */
export function clearSyncCode(): boolean {
  return safeRemoveItem(SYNC_STORAGE_KEYS.SYNC_CODE);
}

// ===== LOCAL SYNC DATA STORAGE =====

/**
 * Saves sync data to localStorage for offline access
 */
export function saveSyncData(data: SyncData): boolean {
  try {
    const serialized = JSON.stringify(data);
    return safeSetItem(SYNC_STORAGE_KEYS.SYNC_DATA, serialized);
  } catch {
    return false;
  }
}

/**
 * Loads sync data from localStorage
 */
export function loadSyncData(): SyncData | null {
  const data = safeGetItem(SYNC_STORAGE_KEYS.SYNC_DATA);
  if (!data) return null;

  try {
    const parsed = JSON.parse(data);
    return validateSyncData(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Records the last sync timestamp
 */
export function setLastSyncTime(timestamp: string): boolean {
  return safeSetItem(SYNC_STORAGE_KEYS.LAST_SYNC, timestamp);
}

/**
 * Gets the last sync timestamp
 */
export function getLastSyncTime(): string | null {
  return safeGetItem(SYNC_STORAGE_KEYS.LAST_SYNC);
}

// ===== GAME DATA EXPORT/IMPORT =====

/**
 * Exports current game data and settings for sync
 */
export function exportGameDataForSync(dateString?: string): SyncData {
  const today = dateString || new Date().toISOString().slice(0, 10);
  
  // Load current game progress
  const progressKey = `${STORAGE_KEYS.PROGRESS_PREFIX}${today}`;
  const progressData = safeGetItem(progressKey);
  
  let gameState: SyncableGameState;
  
  if (progressData) {
    try {
      const parsed = JSON.parse(progressData);
      gameState = {
        guesses: parsed.guesses || [],
        isGameOver: parsed.isGameOver || false,
        timestamp: parsed.timestamp || new Date().toISOString()
      };
    } catch {
      gameState = {
        guesses: [],
        isGameOver: false,
        timestamp: new Date().toISOString()
      };
    }
  } else {
    gameState = {
      guesses: [],
      isGameOver: false,
      timestamp: new Date().toISOString()
    };
  }

  // Load current settings
  const settings = loadSettings() || {};

  return createSyncData(gameState, settings);
}

/**
 * Imports sync data to localStorage, replacing current data
 */
export function importSyncDataToStorage(data: SyncData, dateString?: string): boolean {
  if (!validateSyncData(data)) {
    return false;
  }

  try {
    const today = dateString || new Date().toISOString().slice(0, 10);
    
    // Import game progress
    const progressKey = `${STORAGE_KEYS.PROGRESS_PREFIX}${today}`;
    const progressData = {
      guesses: data.gameState.guesses,
      isGameOver: data.gameState.isGameOver,
      timestamp: data.gameState.timestamp,
      // Include any additional fields that might be in the original progress data
      puzzleId: null, // These will be set by the game logic
      puzzleYear: null
    };
    
    safeSetItem(progressKey, JSON.stringify(progressData));

    // Import settings
    if (data.settings && Object.keys(data.settings).length > 0) {
      saveSettings(data.settings);
    }

    // Update sync metadata
    saveSyncData(data);
    setLastSyncTime(data.lastSync);

    return true;
  } catch {
    return false;
  }
}

// ===== SYNC STATUS AND UTILITIES =====

/**
 * Checks if sync is available and configured
 */
export function isSyncConfigured(): boolean {
  return getSyncCode() !== null;
}

/**
 * Gets sync status information
 */
export function getSyncStatus() {
  const syncCode = getSyncCode();
  const lastSync = getLastSyncTime();
  const syncData = loadSyncData();
  
  return {
    isConfigured: syncCode !== null,
    syncCode,
    lastSync: lastSync ? new Date(lastSync) : null,
    hasLocalData: syncData !== null,
    deviceFingerprint: syncData?.deviceFingerprint || null
  };
}

/**
 * Clears all sync-related data from localStorage
 */
export function clearAllSyncData(): boolean {
  try {
    clearSyncCode();
    safeRemoveItem(SYNC_STORAGE_KEYS.SYNC_DATA);
    safeRemoveItem(SYNC_STORAGE_KEYS.LAST_SYNC);
    return true;
  } catch {
    return false;
  }
}