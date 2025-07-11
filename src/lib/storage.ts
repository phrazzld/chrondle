// Comprehensive localStorage integration for Chrondle
// Ensures 100% compatibility with original HTML localStorage usage patterns

import { STORAGE_KEYS, STREAK_CONFIG } from "./constants";
import { logger } from "./logger";

export interface StorageEntry {
  key: string;
  value: string | null;
}

// --- STORAGE AVAILABILITY CHECK ---

export function isLocalStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const test = "__localStorage_test__";
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

// --- TYPE-SAFE STORAGE UTILITIES ---

// Security: Enhanced JSON parsing with validation
export function safeGetJSON<T>(key: string): T | null {
  const value = safeGetItem(key);
  if (!value) return null;

  try {
    // Security: Validate JSON string before parsing
    if (!isValidJSONString(value)) {
      logger.warn(
        `Invalid JSON detected for key ${key}, clearing corrupted data`,
      );
      safeRemoveItem(key);
      return null;
    }

    const parsed = JSON.parse(value) as T;

    // Security: Additional validation for parsed object
    if (!isValidStorageObject(parsed)) {
      logger.warn(
        `Suspicious object structure detected for key ${key}, clearing data`,
      );
      safeRemoveItem(key);
      return null;
    }

    return parsed;
  } catch (error) {
    logger.error(`Failed to parse JSON for key ${key}:`, error);
    // Security: Clear potentially malicious data
    safeRemoveItem(key);
    return null;
  }
}

export function safeSetJSON<T>(key: string, value: T): boolean {
  try {
    // Security: Validate input before serialization
    if (!isValidStorageObject(value)) {
      logger.error(`Invalid object structure prevented storage for key ${key}`);
      return false;
    }

    const serialized = JSON.stringify(value);

    // Security: Check serialized size to prevent storage abuse
    if (serialized.length > 10000) {
      // 10KB limit per entry
      logger.error(
        `Object too large for storage (${serialized.length} bytes) for key ${key}`,
      );
      return false;
    }

    return safeSetItem(key, serialized);
  } catch (error) {
    logger.error(`Failed to serialize JSON for key ${key}:`, error);
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

export function saveGameProgress<T>(
  progress: T,
  debugMode: boolean = false,
): boolean {
  if (debugMode) {
    logger.debug("Debug mode: skipping localStorage save");
    return true;
  }

  const key = getProgressKey();
  const progressWithTimestamp = {
    ...progress,
    timestamp: new Date().toISOString(),
  };

  logger.debug(`Saving progress:`, progress);
  return safeSetJSON(key, progressWithTimestamp);
}

export function loadGameProgress<T = Record<string, unknown>>(
  debugMode: boolean = false,
): T | null {
  if (debugMode) {
    logger.debug("Debug mode: skipping localStorage load");
    return null;
  }

  const key = getProgressKey();
  const savedData = safeGetJSON<T>(key);

  logger.debug(`Loading progress for key: ${key}`);
  logger.debug(`Found saved progress:`, savedData);

  return savedData;
}

// Settings storage
export function saveSettings<T>(settings: T): boolean {
  return safeSetJSON(STORAGE_KEYS.SETTINGS, settings);
}

export function loadSettings<T = Record<string, unknown>>(): T | null {
  return safeGetJSON<T>(STORAGE_KEYS.SETTINGS);
}

// First-time player tracking
export function markPlayerAsPlayed(): void {
  safeSetItem(STORAGE_KEYS.HAS_PLAYED, "true");
}

export function hasPlayerPlayedBefore(): boolean {
  return safeGetItem(STORAGE_KEYS.HAS_PLAYED) === "true";
}

// --- STREAK MANAGEMENT ---

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalGamesPlayed: number;
  lastPlayedDate: string;
  playedDates: string[];
  achievements: string[];
}

export function loadStreakData(): StreakData {
  const defaultStreak: StreakData = {
    currentStreak: 0,
    longestStreak: 0,
    totalGamesPlayed: 0,
    lastPlayedDate: "",
    playedDates: [],
    achievements: [],
  };

  const savedData = safeGetJSON<StreakData>(STORAGE_KEYS.STREAK_DATA);
  if (!savedData) return defaultStreak;

  return { ...defaultStreak, ...savedData };
}

export function saveStreakData(streakData: StreakData): boolean {
  return safeSetJSON(STORAGE_KEYS.STREAK_DATA, streakData);
}

export function calculateCurrentStreak(playedDates: string[]): number {
  if (playedDates.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  const checkDate = new Date(today);

  // Walk backwards from today until we hit a gap
  while (streak < STREAK_CONFIG.MAX_STREAK_HISTORY) {
    const dateString = checkDate.toISOString().slice(0, 10);

    if (playedDates.includes(dateString)) {
      streak++;
    } else {
      // Gap found - but handle the "haven't played today yet" case
      if (checkDate.getTime() === today.getTime()) {
        // Today not played yet - that's OK, keep checking yesterday
      } else {
        // Found an actual gap in the past
        break;
      }
    }

    // Move to previous day
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return streak;
}

export function recordGamePlayed(hasWon: boolean): StreakData {
  const today = new Date().toISOString().slice(0, 10);
  const streakData = loadStreakData();

  // Don't double-count if already played today
  if (streakData.playedDates.includes(today)) {
    return streakData;
  }

  // Add today to played dates if won
  if (hasWon) {
    streakData.playedDates.push(today);
    streakData.lastPlayedDate = today;

    // Recalculate current streak
    streakData.currentStreak = calculateCurrentStreak(streakData.playedDates);
    streakData.longestStreak = Math.max(
      streakData.longestStreak,
      streakData.currentStreak,
    );
  } else {
    // Game played but not won - breaks streak
    if (streakData.playedDates.length > 0) {
      streakData.currentStreak = 0;
    }
  }

  streakData.totalGamesPlayed++;

  // Cleanup old data to prevent unbounded growth
  cleanupOldStreakData(streakData);

  saveStreakData(streakData);
  return streakData;
}

function cleanupOldStreakData(streakData: StreakData): void {
  if (streakData.playedDates.length <= STREAK_CONFIG.MAX_STREAK_HISTORY) {
    return;
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - STREAK_CONFIG.MAX_STREAK_HISTORY);
  const cutoffString = cutoffDate.toISOString().slice(0, 10);

  // Remove dates older than our retention window
  streakData.playedDates = streakData.playedDates.filter(
    (date) => date >= cutoffString,
  );
}

// --- STORAGE CLEANUP UTILITIES ---

export function getAllChronldeEntries(): StorageEntry[] {
  if (!isLocalStorageAvailable()) return [];

  const allChrondles: StorageEntry[] = [];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("chrondle-")) {
        allChrondles.push({
          key,
          value: localStorage.getItem(key),
        });
      }
    }
  } catch (error) {
    console.error("Error reading localStorage entries:", error);
  }

  return allChrondles;
}

export function cleanupOldStorage(): void {
  if (!isLocalStorageAvailable()) return;

  const today = new Date().toISOString().slice(0, 10);
  const todayKey = `${STORAGE_KEYS.PROGRESS_PREFIX}${today}`;

  logger.debug(`Cleaning up old localStorage entries, keeping: ${todayKey}`);

  const keysToRemove: string[] = [];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        key.startsWith(STORAGE_KEYS.PROGRESS_PREFIX) &&
        key !== todayKey
      ) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
      logger.debug(`🗑️ Removed old storage entry: ${key}`);
    });

    if (keysToRemove.length > 0) {
      logger.debug(`Cleaned up ${keysToRemove.length} old entries`);
    }
  } catch (error) {
    console.error("Error during storage cleanup:", error);
  }
}

export function clearAllChrondleStorage(): string[] {
  if (!isLocalStorageAvailable()) return [];

  const keys: string[] = [];

  try {
    // Get all chrondle keys first
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("chrondle-")) {
        keys.push(key);
      }
    }

    // Remove all chrondle keys
    keys.forEach((key) => localStorage.removeItem(key));

    logger.info(`🗑️ Cleared ${keys.length} chrondle storage entries:`, keys);
  } catch (error) {
    console.error("Error clearing chrondle storage:", error);
  }

  return keys;
}

// --- DEBUG UTILITIES ---

export function logAllChronldeStorage(): void {
  const allChrondles = getAllChronldeEntries();
  logger.debug(`All chrondle localStorage entries:`, allChrondles);
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
      storageAvailable: false,
    };
  }

  let totalEntries = 0;
  let chronldeEntries = 0;

  try {
    totalEntries = localStorage.length;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("chrondle-")) {
        chronldeEntries++;
      }
    }
  } catch (error) {
    console.error("Error getting storage info:", error);
  }

  return {
    totalEntries,
    chronldeEntries,
    storageAvailable: true,
  };
}

// --- NOTIFICATION SETTINGS ---

export interface NotificationSettings {
  enabled: boolean;
  time: string; // HH:MM format (24-hour)
  permission: NotificationPermission | "unknown";
  lastPermissionRequest: string | null; // ISO date string
  registrationId: string | null; // Service worker registration ID
}

export function loadNotificationSettings(): NotificationSettings {
  const defaultSettings: NotificationSettings = {
    enabled: false,
    time: "09:00",
    permission: "default",
    lastPermissionRequest: null,
    registrationId: null,
  };

  const savedData = safeGetJSON<NotificationSettings>(
    STORAGE_KEYS.NOTIFICATION_SETTINGS,
  );
  if (!savedData) return defaultSettings;

  return { ...defaultSettings, ...savedData };
}

export function saveNotificationSettings(
  settings: NotificationSettings,
): boolean {
  return safeSetJSON(STORAGE_KEYS.NOTIFICATION_SETTINGS, settings);
}

export function updateNotificationPermission(
  permission: NotificationPermission,
): boolean {
  const settings = loadNotificationSettings();
  settings.permission = permission;
  if (permission === "granted") {
    settings.lastPermissionRequest = new Date().toISOString();
  }
  return saveNotificationSettings(settings);
}

export function shouldShowPermissionReminder(): boolean {
  const settings = loadNotificationSettings();

  // Don't show if already granted or denied permanently
  if (settings.permission === "granted" || settings.permission === "denied") {
    return false;
  }

  // Show if never asked before
  if (!settings.lastPermissionRequest) {
    return true;
  }

  // Show if it's been 3+ days since last ask
  const lastAsk = new Date(settings.lastPermissionRequest);
  const now = new Date();
  const daysSinceAsk =
    (now.getTime() - lastAsk.getTime()) / (1000 * 60 * 60 * 24);

  return daysSinceAsk >= 3;
}

// --- SECURITY VALIDATION UTILITIES ---

// Security: Validate JSON string format before parsing
function isValidJSONString(str: string): boolean {
  // Basic checks for malicious patterns
  if (
    str.includes("__proto__") ||
    str.includes("constructor") ||
    str.includes("prototype")
  ) {
    return false;
  }

  // Check for excessive nesting that could cause DoS
  const maxDepth = 10;
  let depth = 0;
  let maxFound = 0;

  for (const char of str) {
    if (char === "{" || char === "[") {
      depth++;
      maxFound = Math.max(maxFound, depth);
      if (maxFound > maxDepth) {
        return false;
      }
    } else if (char === "}" || char === "]") {
      depth--;
    }
  }

  return true;
}

// Security: Validate parsed object structure
function isValidStorageObject(obj: unknown): boolean {
  if (obj === null || obj === undefined) {
    return true; // null/undefined are valid
  }

  if (
    typeof obj === "string" ||
    typeof obj === "number" ||
    typeof obj === "boolean"
  ) {
    return true; // primitives are safe
  }

  if (Array.isArray(obj)) {
    // Validate array contents and prevent excessive size
    if (obj.length > 1000) return false;
    return obj.every((item) => isValidStorageObject(item));
  }

  if (typeof obj === "object") {
    // Check for prototype pollution attempts
    if (
      Object.prototype.hasOwnProperty.call(obj, "__proto__") ||
      Object.prototype.hasOwnProperty.call(obj, "constructor") ||
      Object.prototype.hasOwnProperty.call(obj, "prototype")
    ) {
      return false;
    }

    // Validate object properties and prevent excessive size
    const entries = Object.entries(obj);
    if (entries.length > 100) return false; // Limit object properties

    return entries.every(([key, value]) => {
      // Validate key is safe
      if (typeof key !== "string" || key.length > 100) return false;
      // Recursively validate value
      return isValidStorageObject(value);
    });
  }

  return false; // Functions, symbols, etc. are not allowed
}

export function validateStorageIntegrity(): boolean {
  if (!isLocalStorageAvailable()) {
    console.warn("localStorage not available");
    return false;
  }

  // Test basic operations
  const testKey = "__chrondle_test__";
  const testValue = "test";

  try {
    localStorage.setItem(testKey, testValue);
    const retrieved = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);

    if (retrieved !== testValue) {
      console.error("localStorage read/write test failed");
      return false;
    }

    logger.info("✅ localStorage integrity check passed");
    return true;
  } catch (error) {
    console.error("localStorage integrity check failed:", error);
    return false;
  }
}
