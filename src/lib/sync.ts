// Anonymous sync functionality for Chrondle
// Test-driven implementation starting with the simplest things that work

export interface SyncableGameState {
  guesses: number[];
  isGameOver: boolean;
  timestamp: string;
}

export interface SyncData {
  version: number;
  lastSync: string;
  gameState: SyncableGameState;
  settings: Record<string, unknown>;
  deviceFingerprint: string;
}

/**
 * Detects if there's a conflict between local and remote game states
 * Uses JSON comparison as the simplest approach that works
 */
export function detectSyncConflict(
  local: SyncableGameState, 
  remote: SyncableGameState
): boolean {
  // Normalize states for comparison by removing timestamp differences
  const normalizeState = (state: SyncableGameState) => ({
    guesses: state.guesses,
    isGameOver: state.isGameOver
  });
  
  const normalizedLocal = normalizeState(local);
  const normalizedRemote = normalizeState(remote);
  
  return JSON.stringify(normalizedLocal) !== JSON.stringify(normalizedRemote);
}

/**
 * Merges two game states using conflict resolution rules:
 * 1. Take the state with more guesses (more progress)
 * 2. Preserve completed game status if either is completed
 * 3. Use the latest timestamp
 */
export function mergeGameStates(
  local: SyncableGameState,
  remote: SyncableGameState
): SyncableGameState {
  // Determine which state has more progress
  const localProgress = local.guesses.length + (local.isGameOver ? 10 : 0);
  const remoteProgress = remote.guesses.length + (remote.isGameOver ? 10 : 0);
  
  // Use the state with more progress as the base
  const baseState = localProgress >= remoteProgress ? local : remote;
  
  // Always preserve completion status if either is completed
  const isGameOver = local.isGameOver || remote.isGameOver;
  
  // Use latest timestamp
  const latestTimestamp = new Date(local.timestamp) > new Date(remote.timestamp) 
    ? local.timestamp 
    : remote.timestamp;
  
  return {
    guesses: baseState.guesses,
    isGameOver,
    timestamp: latestTimestamp
  };
}

/**
 * Generates an 8-character sync code for anonymous sharing
 * Uses crypto.randomUUID for cryptographic randomness
 */
export function generateSyncCode(): string {
  const uuid = crypto.randomUUID();
  // Remove hyphens and take first 8 characters, then convert to uppercase
  const cleanUuid = uuid.replace(/-/g, '');
  return cleanUuid.substring(0, 8).toUpperCase();
}

/**
 * Generates a simple device fingerprint for sync validation
 * Uses available browser characteristics
 */
export function generateDeviceFingerprint(): string {
  if (typeof window === 'undefined') {
    return 'server-side-render';
  }
  
  const factors = [
    navigator.userAgent.length.toString(),
    screen.width.toString(),
    screen.height.toString(),
    new Date().getTimezoneOffset().toString(),
    navigator.language
  ];
  
  return btoa(factors.join('|')).substring(0, 12);
}

/**
 * Creates a sync data package from current game state and settings
 */
export function createSyncData(
  gameState: SyncableGameState,
  settings: Record<string, unknown> = {}
): SyncData {
  return {
    version: 1,
    lastSync: new Date().toISOString(),
    gameState,
    settings,
    deviceFingerprint: generateDeviceFingerprint()
  };
}

/**
 * Validates sync data structure and content
 */
export function validateSyncData(data: unknown): data is SyncData {
  if (!data || typeof data !== 'object') {
    return false;
  }
  
  const syncData = data as Record<string, unknown>;
  
  // Check required fields
  if (typeof syncData.version !== 'number') return false;
  if (typeof syncData.lastSync !== 'string') return false;
  if (!syncData.gameState || typeof syncData.gameState !== 'object') return false;
  if (!syncData.settings || typeof syncData.settings !== 'object') return false;
  if (typeof syncData.deviceFingerprint !== 'string') return false;
  
  const gameState = syncData.gameState as Record<string, unknown>;
  if (!Array.isArray(gameState.guesses)) return false;
  if (typeof gameState.isGameOver !== 'boolean') return false;
  if (typeof gameState.timestamp !== 'string') return false;
  
  return true;
}