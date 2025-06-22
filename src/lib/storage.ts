// Comprehensive localStorage integration for Chrondle
// Ensures 100% compatibility with original HTML localStorage usage patterns

import { STORAGE_KEYS } from './constants';

export interface StorageEntry {
  key: string;
  value: string | null;
}

// --- STORAGE AVAILABILITY CHECK ---

export function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

// --- SAFE STORAGE OPERATIONS ---

export function safeGetItem(key: string): string | null {
  if (!isLocalStorageAvailable()) return null;
  
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSetItem(key: string, value: string): boolean {
  if (!isLocalStorageAvailable()) return false;
  
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function safeRemoveItem(key: string): boolean {
  if (!isLocalStorageAvailable()) return false;
  
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

// --- CHRONDLE-SPECIFIC STORAGE OPERATIONS ---

// Game progress storage (daily)
export function getProgressKey(): string {
  const today = new Date();
  const dateString = today.toISOString().slice(0, 10); // YYYY-MM-DD
  return `${STORAGE_KEYS.PROGRESS_PREFIX}${dateString}`;
}

export function saveGameProgress(progress: any, debugMode: boolean = false): void {
  if (debugMode) {
    console.log('Debug mode: skipping localStorage save');
    return;
  }
  
  const key = getProgressKey();
  const progressData = JSON.stringify({
    ...progress,
    timestamp: new Date().toISOString()
  });
  
  console.log(`🔍 DEBUG: Saving progress:`, progress);
  safeSetItem(key, progressData);
}

export function loadGameProgress(debugMode: boolean = false): any | null {
  if (debugMode) {
    console.log('Debug mode: skipping localStorage load');
    return null;
  }
  
  const key = getProgressKey();
  const savedData = safeGetItem(key);
  
  console.log(`🔍 DEBUG: Loading progress for key: ${key}`);
  console.log(`🔍 DEBUG: Found saved progress:`, savedData);
  
  if (savedData) {
    try {
      return JSON.parse(savedData);
    } catch (error) {
      console.error('Failed to parse saved progress:', error);
      return null;
    }
  }
  
  return null;
}

// Settings storage
export function saveSettings(settings: any): void {
  const settingsData = JSON.stringify(settings);
  safeSetItem(STORAGE_KEYS.SETTINGS, settingsData);
}

export function loadSettings(): any | null {
  const settingsData = safeGetItem(STORAGE_KEYS.SETTINGS);
  
  if (settingsData) {
    try {
      return JSON.parse(settingsData);
    } catch (error) {
      console.error('Failed to parse settings:', error);
      return null;
    }
  }
  
  return null;
}

// First-time player tracking
export function markPlayerAsPlayed(): void {
  safeSetItem(STORAGE_KEYS.HAS_PLAYED, 'true');
}

export function hasPlayerPlayedBefore(): boolean {
  return safeGetItem(STORAGE_KEYS.HAS_PLAYED) === 'true';
}

// LLM integration storage
export function getLLMApiKey(): string | null {
  return safeGetItem(STORAGE_KEYS.OPENAI_API_KEY);
}

export function getLastLLMCall(): number | null {
  const lastCall = safeGetItem(STORAGE_KEYS.LAST_LLM_CALL);
  return lastCall ? parseInt(lastCall, 10) : null;
}

export function setLastLLMCall(timestamp: number): void {
  safeSetItem(STORAGE_KEYS.LAST_LLM_CALL, timestamp.toString());
}

// --- STORAGE CLEANUP UTILITIES ---

export function getAllChronldeEntries(): StorageEntry[] {
  if (!isLocalStorageAvailable()) return [];
  
  const allChrondles: StorageEntry[] = [];
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('chrondle-')) {
        allChrondles.push({
          key,
          value: localStorage.getItem(key)
        });
      }
    }
  } catch (error) {
    console.error('Error reading localStorage entries:', error);
  }
  
  return allChrondles;
}

export function cleanupOldStorage(): void {
  if (!isLocalStorageAvailable()) return;
  
  const today = new Date().toISOString().slice(0, 10);
  const todayKey = `${STORAGE_KEYS.PROGRESS_PREFIX}${today}`;
  
  console.log(`🔍 DEBUG: Cleaning up old localStorage entries, keeping: ${todayKey}`);
  
  const keysToRemove: string[] = [];
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEYS.PROGRESS_PREFIX) && key !== todayKey) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`🗑️ Removed old storage entry: ${key}`);
    });
    
    if (keysToRemove.length > 0) {
      console.log(`🔍 DEBUG: Cleaned up ${keysToRemove.length} old entries`);
    }
  } catch (error) {
    console.error('Error during storage cleanup:', error);
  }
}

export function clearAllChronldeStorage(): string[] {
  if (!isLocalStorageAvailable()) return [];
  
  const keys: string[] = [];
  
  try {
    // Get all chrondle keys first
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('chrondle-')) {
        keys.push(key);
      }
    }
    
    // Remove all chrondle keys
    keys.forEach(key => localStorage.removeItem(key));
    
    console.log(`🗑️ Cleared ${keys.length} chrondle storage entries:`, keys);
  } catch (error) {
    console.error('Error clearing chrondle storage:', error);
  }
  
  return keys;
}

// --- DEBUG UTILITIES ---

export function logAllChronldeStorage(): void {
  const allChrondles = getAllChronldeEntries();
  console.log(`🔍 DEBUG: All chrondle localStorage entries:`, allChrondles);
}

export function getStorageInfo(): {
  totalEntries: number;
  chronldeEntries: number;
  storageAvailable: boolean;
} {
  if (!isLocalStorageAvailable()) {
    return {
      totalEntries: 0,
      chronldeEntries: 0,
      storageAvailable: false
    };
  }
  
  let totalEntries = 0;
  let chronldeEntries = 0;
  
  try {
    totalEntries = localStorage.length;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('chrondle-')) {
        chronldeEntries++;
      }
    }
  } catch (error) {
    console.error('Error getting storage info:', error);
  }
  
  return {
    totalEntries,
    chronldeEntries,
    storageAvailable: true
  };
}

// --- VALIDATION UTILITIES ---

export function validateStorageIntegrity(): boolean {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage not available');
    return false;
  }
  
  // Test basic operations
  const testKey = '__chrondle_test__';
  const testValue = 'test';
  
  try {
    localStorage.setItem(testKey, testValue);
    const retrieved = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    
    if (retrieved !== testValue) {
      console.error('localStorage read/write test failed');
      return false;
    }
    
    console.log('✅ localStorage integrity check passed');
    return true;
  } catch (error) {
    console.error('localStorage integrity check failed:', error);
    return false;
  }
}