// React hook for managing sync functionality in Chrondle
// Follows existing hook patterns and integrates with storage layer

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  generateSyncCode,
  mergeGameStates,
  detectSyncConflict,
  SyncData,
  SyncableGameState
} from '@/lib/sync';
import { 
  setSyncCode,
  clearSyncCode,
  exportGameDataForSync,
  importSyncDataToStorage,
  getSyncStatus,
  saveSyncData,
  setLastSyncTime
} from '@/lib/syncStorage';
import { 
  uploadSyncData,
  downloadSyncData,
  retrySyncOperation
} from '@/lib/syncClient';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'conflict' | 'error';

export interface SyncState {
  status: SyncStatus;
  syncCode: string | null;
  isConfigured: boolean;
  lastSync: Date | null;
  error: string | null;
  conflicts: SyncConflict[];
  isLoading: boolean;
}

export interface SyncConflict {
  id: string;
  local: SyncableGameState;
  remote: SyncableGameState;
  timestamp: string;
}

export interface UseSyncReturn {
  // State
  status: SyncStatus;
  syncCode: string | null;
  isConfigured: boolean;
  lastSync: Date | null;
  error: string | null;
  conflicts: SyncConflict[];
  isLoading: boolean;
  
  // Actions
  generateCode: () => Promise<string | null>;
  enableSync: (code: string) => Promise<boolean>;
  disableSync: () => Promise<boolean>;
  pushData: () => Promise<boolean>;
  pullData: (code?: string) => Promise<boolean>;
  resolveConflict: (conflictId: string, resolution: 'local' | 'remote' | 'merge') => Promise<boolean>;
  
  // Utilities
  exportCurrentData: () => SyncData;
  clearAllData: () => Promise<boolean>;
}

export function useSync(): UseSyncReturn {
  const [state, setState] = useState<SyncState>(() => {
    const syncStatus = getSyncStatus();
    return {
      status: 'idle',
      syncCode: syncStatus.syncCode,
      isConfigured: syncStatus.isConfigured,
      lastSync: syncStatus.lastSync,
      error: null,
      conflicts: [],
      isLoading: false
    };
  });

  // Update state when sync status changes
  useEffect(() => {
    const syncStatus = getSyncStatus();
    setState(prev => ({
      ...prev,
      syncCode: syncStatus.syncCode,
      isConfigured: syncStatus.isConfigured,
      lastSync: syncStatus.lastSync
    }));
  }, []);

  const setError = useCallback((error: string) => {
    setState(prev => ({
      ...prev,
      status: 'error',
      error,
      isLoading: false
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
      status: prev.isConfigured ? 'idle' : 'idle'
    }));
  }, []);

  const generateCode = useCallback(async (): Promise<string | null> => {
    setState(prev => ({ ...prev, isLoading: true }));
    clearError();

    try {
      const code = generateSyncCode();
      const success = setSyncCode(code);
      
      if (success) {
        setState(prev => ({
          ...prev,
          syncCode: code,
          isConfigured: true,
          status: 'idle',
          isLoading: false
        }));
        return code;
      } else {
        setError('Failed to save sync code');
        return null;
      }
    } catch (error) {
      setError(`Failed to generate sync code: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  }, [clearError, setError]);

  const enableSync = useCallback(async (code: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }));
    clearError();

    try {
      // Validate code format
      if (!/^[A-Z0-9]{8}$/.test(code)) {
        setError('Invalid sync code format. Code must be 8 uppercase characters.');
        return false;
      }

      const success = setSyncCode(code);
      
      if (success) {
        setState(prev => ({
          ...prev,
          syncCode: code,
          isConfigured: true,
          status: 'idle',
          isLoading: false
        }));
        return true;
      } else {
        setError('Failed to save sync code');
        return false;
      }
    } catch (error) {
      setError(`Failed to enable sync: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }, [clearError, setError]);

  const disableSync = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }));
    clearError();

    try {
      const success = clearSyncCode();
      
      if (success) {
        setState(prev => ({
          ...prev,
          syncCode: null,
          isConfigured: false,
          status: 'idle',
          lastSync: null,
          conflicts: [],
          isLoading: false
        }));
        return true;
      } else {
        setError('Failed to disable sync');
        return false;
      }
    } catch (error) {
      setError(`Failed to disable sync: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }, [clearError, setError]);

  const pushData = useCallback(async (): Promise<boolean> => {
    if (!state.syncCode) {
      setError('No sync code configured');
      return false;
    }

    setState(prev => ({ ...prev, status: 'syncing', isLoading: true }));
    clearError();

    try {
      const data = exportGameDataForSync();
      
      // Try to upload to server with retry logic
      const result = await retrySyncOperation(
        () => uploadSyncData(state.syncCode!, data),
        3,
        1000
      );
      
      if (result.success) {
        // Also save locally as backup
        saveSyncData(data);
        const now = new Date().toISOString();
        setLastSyncTime(now);
        
        setState(prev => ({
          ...prev,
          status: 'synced',
          lastSync: new Date(now),
          isLoading: false
        }));
        return true;
      } else {
        setError(result.error || 'Failed to upload sync data');
        return false;
      }
    } catch (error) {
      setError(`Failed to push data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }, [state.syncCode, clearError, setError]);

  const pullData = useCallback(async (code?: string): Promise<boolean> => {
    const syncCode = code || state.syncCode;
    
    if (!syncCode) {
      setError('No sync code provided');
      return false;
    }

    setState(prev => ({ ...prev, status: 'syncing', isLoading: true }));
    clearError();

    try {
      // Download data from server with retry logic
      const result = await retrySyncOperation(
        () => downloadSyncData(syncCode),
        3,
        1000
      );
      
      if (!result.success) {
        setError(result.error || 'Failed to download sync data');
        return false;
      }

      const remoteData = result.data!;
      const currentData = exportGameDataForSync();

      // Check for conflicts
      const hasConflict = detectSyncConflict(currentData.gameState, remoteData.gameState);
      
      if (hasConflict) {
        const conflict: SyncConflict = {
          id: `conflict-${Date.now()}`,
          local: currentData.gameState,
          remote: remoteData.gameState,
          timestamp: new Date().toISOString()
        };
        
        setState(prev => ({
          ...prev,
          status: 'conflict',
          conflicts: [conflict],
          isLoading: false
        }));
        return false;
      } else {
        // No conflict, import the data
        const success = importSyncDataToStorage(remoteData);
        
        if (success) {
          setState(prev => ({
            ...prev,
            status: 'synced',
            lastSync: new Date(remoteData.lastSync),
            isLoading: false
          }));
          return true;
        } else {
          setError('Failed to import sync data');
          return false;
        }
      }
    } catch (error) {
      setError(`Failed to pull data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }, [state.syncCode, clearError, setError]);

  const resolveConflict = useCallback(async (
    conflictId: string, 
    resolution: 'local' | 'remote' | 'merge'
  ): Promise<boolean> => {
    const conflict = state.conflicts.find(c => c.id === conflictId);
    if (!conflict) {
      setError('Conflict not found');
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true }));
    clearError();

    try {
      let resolvedState: SyncableGameState;
      
      switch (resolution) {
        case 'local':
          resolvedState = conflict.local;
          break;
        case 'remote':
          resolvedState = conflict.remote;
          break;
        case 'merge':
          resolvedState = mergeGameStates(conflict.local, conflict.remote);
          break;
        default:
          setError('Invalid resolution type');
          return false;
      }

      // Create sync data with resolved state
      const syncData: SyncData = {
        version: 1,
        lastSync: new Date().toISOString(),
        gameState: resolvedState,
        settings: exportGameDataForSync().settings,
        deviceFingerprint: exportGameDataForSync().deviceFingerprint
      };

      // Import the resolved data
      const success = importSyncDataToStorage(syncData);
      
      if (success) {
        setState(prev => ({
          ...prev,
          status: 'synced',
          conflicts: prev.conflicts.filter(c => c.id !== conflictId),
          lastSync: new Date(syncData.lastSync),
          isLoading: false
        }));
        return true;
      } else {
        setError('Failed to save resolved data');
        return false;
      }
    } catch (error) {
      setError(`Failed to resolve conflict: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }, [state.conflicts, clearError, setError]);

  const exportCurrentData = useCallback((): SyncData => {
    return exportGameDataForSync();
  }, []);

  const clearAllData = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }));
    clearError();

    try {
      const success = clearSyncCode();
      
      if (success) {
        setState({
          status: 'idle',
          syncCode: null,
          isConfigured: false,
          lastSync: null,
          error: null,
          conflicts: [],
          isLoading: false
        });
        return true;
      } else {
        setError('Failed to clear sync data');
        return false;
      }
    } catch (error) {
      setError(`Failed to clear data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }, [clearError, setError]);

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(() => ({
    // State
    status: state.status,
    syncCode: state.syncCode,
    isConfigured: state.isConfigured,
    lastSync: state.lastSync,
    error: state.error,
    conflicts: state.conflicts,
    isLoading: state.isLoading,
    
    // Actions
    generateCode,
    enableSync,
    disableSync,
    pushData,
    pullData,
    resolveConflict,
    
    // Utilities
    exportCurrentData,
    clearAllData
  }), [
    state,
    generateCode,
    enableSync,
    disableSync,
    pushData,
    pullData,
    resolveConflict,
    exportCurrentData,
    clearAllData
  ]);
}