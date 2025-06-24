// Serverless function for anonymous sync functionality
// Provides simple data storage using sync codes without user accounts

import { NextApiRequest, NextApiResponse } from 'next';

// In-memory storage for demo (in production, use Redis or a database)
const syncStorage = new Map<string, {
  data: any;
  expires: number;
  created: number;
}>();

// Cleanup expired entries periodically
const EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours
const MAX_ENTRIES = 10000; // Prevent memory issues

function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, entry] of syncStorage.entries()) {
    if (entry.expires < now) {
      syncStorage.delete(key);
    }
  }
  
  // If still too many entries, remove oldest ones
  if (syncStorage.size > MAX_ENTRIES) {
    const entries = Array.from(syncStorage.entries())
      .sort((a, b) => a[1].created - b[1].created);
    
    const toRemove = entries.slice(0, syncStorage.size - MAX_ENTRIES);
    toRemove.forEach(([key]) => syncStorage.delete(key));
  }
}

function isValidSyncCode(code: string): boolean {
  return /^[A-Z0-9]{8}$/.test(code);
}

function isValidSyncData(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  
  // Basic validation of sync data structure
  return (
    typeof data.version === 'number' &&
    typeof data.lastSync === 'string' &&
    data.gameState &&
    typeof data.gameState === 'object' &&
    Array.isArray(data.gameState.guesses) &&
    typeof data.gameState.isGameOver === 'boolean' &&
    typeof data.gameState.timestamp === 'string' &&
    data.settings &&
    typeof data.settings === 'object' &&
    typeof data.deviceFingerprint === 'string'
  );
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Enable CORS for cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { code } = req.query;
  
  if (typeof code !== 'string' || !isValidSyncCode(code)) {
    return res.status(400).json({ 
      error: 'Invalid sync code format. Must be 8 uppercase alphanumeric characters.' 
    });
  }

  // Cleanup expired entries before processing
  cleanupExpiredEntries();

  if (req.method === 'POST') {
    // Store sync data
    try {
      const data = req.body;
      
      if (!isValidSyncData(data)) {
        return res.status(400).json({ 
          error: 'Invalid sync data format.' 
        });
      }

      const now = Date.now();
      const expires = now + EXPIRY_TIME;
      
      syncStorage.set(code, {
        data,
        expires,
        created: now
      });

      return res.status(200).json({ 
        success: true,
        message: 'Sync data stored successfully',
        expires: new Date(expires).toISOString()
      });
    } catch (error) {
      console.error('Error storing sync data:', error);
      return res.status(500).json({ 
        error: 'Failed to store sync data.' 
      });
    }
  } else if (req.method === 'GET') {
    // Retrieve sync data
    try {
      const entry = syncStorage.get(code);
      
      if (!entry || entry.expires < Date.now()) {
        return res.status(404).json({ 
          error: 'Sync code not found or expired.' 
        });
      }

      return res.status(200).json({
        success: true,
        data: entry.data,
        created: new Date(entry.created).toISOString(),
        expires: new Date(entry.expires).toISOString()
      });
    } catch (error) {
      console.error('Error retrieving sync data:', error);
      return res.status(500).json({ 
        error: 'Failed to retrieve sync data.' 
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
    return res.status(405).json({ 
      error: `Method ${req.method} not allowed.` 
    });
  }
}

// Export for testing
export { cleanupExpiredEntries, isValidSyncCode, isValidSyncData };