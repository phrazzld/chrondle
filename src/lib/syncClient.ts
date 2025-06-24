// Client-side sync operations for Chrondle
// Handles HTTP requests to the sync server

import { SyncData, validateSyncData } from './sync';

const SYNC_API_BASE = '/api/sync';

export interface SyncResponse {
  success: boolean;
  data?: SyncData;
  message?: string;
  error?: string;
  expires?: string;
  created?: string;
}

/**
 * Uploads sync data to the server
 */
export async function uploadSyncData(code: string, data: SyncData): Promise<SyncResponse> {
  try {
    const response = await fetch(`${SYNC_API_BASE}/${code}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || `HTTP ${response.status}: ${response.statusText}`
      };
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Downloads sync data from the server
 */
export async function downloadSyncData(code: string): Promise<SyncResponse> {
  try {
    const response = await fetch(`${SYNC_API_BASE}/${code}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || `HTTP ${response.status}: ${response.statusText}`
      };
    }

    // Validate the received data
    if (result.data && !validateSyncData(result.data)) {
      return {
        success: false,
        error: 'Invalid data received from server'
      };
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Test if the sync server is available
 */
export async function testSyncConnection(): Promise<boolean> {
  try {
    // Use a test code that should return 404
    const response = await fetch(`${SYNC_API_BASE}/TEST0000`, {
      method: 'GET',
    });
    
    // We expect a 404, which means the server is responding
    return response.status === 404;
  } catch {
    return false;
  }
}

/**
 * Retry logic for sync operations
 */
export async function retrySyncOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt < maxRetries) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  throw lastError;
}