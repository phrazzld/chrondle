'use client';

import React, { useState, useCallback } from 'react';
import { BaseModal } from './BaseModal';
import { useSync } from '@/hooks/useSync';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SyncMode = 'setup' | 'generate' | 'enter' | 'status' | 'conflicts';

export const SyncModal: React.FC<SyncModalProps> = ({ isOpen, onClose }) => {
  const sync = useSync();
  const [mode, setMode] = useState<SyncMode>('setup');
  const [codeInput, setCodeInput] = useState('');
  const [, setShowCode] = useState(false);

  // Determine the appropriate mode based on sync state
  React.useEffect(() => {
    if (sync.isConfigured) {
      if (sync.conflicts.length > 0) {
        setMode('conflicts');
      } else {
        setMode('status');
      }
    } else {
      setMode('setup');
    }
  }, [sync.isConfigured, sync.conflicts.length]);

  const handleGenerateCode = useCallback(async () => {
    setMode('generate');
    const code = await sync.generateCode();
    if (code) {
      setShowCode(true);
    }
  }, [sync]);

  const handleEnterCode = useCallback(async () => {
    if (!codeInput.trim()) return;
    
    const success = await sync.enableSync(codeInput.trim().toUpperCase());
    if (success) {
      setCodeInput('');
      setMode('status');
    }
  }, [codeInput, sync]);

  const handleDisableSync = useCallback(async () => {
    const success = await sync.disableSync();
    if (success) {
      setMode('setup');
      setShowCode(false);
      setCodeInput('');
    }
  }, [sync]);

  const formatSyncCode = (code: string) => {
    return code.replace(/(.{4})(.{4})/, '$1-$2');
  };

  const renderSetupMode = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
          Sync Your Progress
        </h3>
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Keep your game progress, streaks, and settings synchronized across devices without creating an account.
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleGenerateCode}
          disabled={sync.isLoading}
          className="btn-primary w-full"
          style={{ 
            opacity: sync.isLoading ? 0.6 : 1,
            cursor: sync.isLoading ? 'wait' : 'pointer'
          }}
        >
          📱 Generate Sync Code
        </button>
        
        <div className="text-center">
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>or</span>
        </div>
        
        <button
          onClick={() => setMode('enter')}
          disabled={sync.isLoading}
          className="btn-secondary w-full"
        >
          🔗 Enter Sync Code
        </button>
      </div>
    </div>
  );

  const renderGenerateMode = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
          Your Sync Code
        </h3>
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Share this code with your other devices to sync your progress.
        </p>
      </div>

      {sync.syncCode && (
        <div className="text-center space-y-4">
          <div 
            className="p-4 rounded-lg border-2 font-mono text-2xl font-bold tracking-wider"
            style={{ 
              background: 'var(--input)',
              borderColor: 'var(--primary)',
              color: 'var(--primary)'
            }}
          >
            {formatSyncCode(sync.syncCode)}
          </div>
          
          <div className="space-y-2">
            <button
              onClick={() => navigator.clipboard.writeText(sync.syncCode!)}
              className="btn-secondary text-sm"
            >
              📋 Copy Code
            </button>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Code expires in 24 hours for security
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setMode('setup')}
          className="btn-secondary flex-1"
        >
          Back
        </button>
        <button
          onClick={() => setMode('status')}
          className="btn-primary flex-1"
        >
          Done
        </button>
      </div>
    </div>
  );

  const renderEnterMode = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
          Enter Sync Code
        </h3>
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Enter the 8-character code from your other device.
        </p>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          value={codeInput}
          onChange={(e) => setCodeInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
          placeholder="ABC1-2345"
          maxLength={9} // Allow for the dash
          className="w-full p-3 text-center font-mono text-lg border-2 rounded-lg"
          style={{
            background: 'var(--input)',
            borderColor: 'var(--border)',
            color: 'var(--foreground)'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--primary)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--border)';
          }}
        />
        
        {sync.error && (
          <div 
            className="p-2 rounded text-sm"
            style={{ 
              background: 'var(--status-error)',
              color: 'white'
            }}
          >
            {sync.error}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setMode('setup')}
          className="btn-secondary flex-1"
        >
          Back
        </button>
        <button
          onClick={handleEnterCode}
          disabled={codeInput.length !== 8 || sync.isLoading}
          className="btn-primary flex-1"
          style={{ 
            opacity: (codeInput.length !== 8 || sync.isLoading) ? 0.6 : 1,
            cursor: (codeInput.length !== 8 || sync.isLoading) ? 'not-allowed' : 'pointer'
          }}
        >
          {sync.isLoading ? 'Connecting...' : 'Connect'}
        </button>
      </div>
    </div>
  );

  const renderStatusMode = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
          Sync Status
        </h3>
        <div 
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm"
          style={{ 
            background: sync.status === 'synced' ? 'var(--feedback-success)' : 'var(--status-info)',
            color: 'white'
          }}
        >
          {sync.status === 'synced' ? '✅' : '🔄'} 
          {sync.status === 'synced' ? 'Synced' : 'Ready to Sync'}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 rounded-lg" style={{ background: 'var(--input)' }}>
          <span className="text-sm font-medium">Sync Code</span>
          <span className="font-mono text-sm" style={{ color: 'var(--primary)' }}>
            {sync.syncCode ? formatSyncCode(sync.syncCode) : 'Not set'}
          </span>
        </div>
        
        {sync.lastSync && (
          <div className="flex justify-between items-center p-3 rounded-lg" style={{ background: 'var(--input)' }}>
            <span className="text-sm font-medium">Last Sync</span>
            <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              {sync.lastSync.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <button
          onClick={sync.pushData}
          disabled={sync.isLoading}
          className="btn-primary w-full"
        >
          📤 {sync.isLoading ? 'Syncing...' : 'Sync Now'}
        </button>
        
        <button
          onClick={handleDisableSync}
          disabled={sync.isLoading}
          className="btn-secondary w-full text-sm"
        >
          🗑️ Disable Sync
        </button>
      </div>
    </div>
  );

  const renderConflictsMode = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
          Sync Conflicts
        </h3>
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Your local progress differs from the synced version. Choose which to keep.
        </p>
      </div>

      {sync.conflicts.map((conflict) => (
        <div key={conflict.id} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div 
              className="p-3 rounded-lg border-2"
              style={{ 
                background: 'var(--input)',
                borderColor: 'var(--feedback-earlier)'
              }}
            >
              <h4 className="font-semibold text-sm mb-2">Local Progress</h4>
              <p className="text-xs">Guesses: {conflict.local.guesses.length}</p>
              <p className="text-xs">Complete: {conflict.local.isGameOver ? 'Yes' : 'No'}</p>
            </div>
            
            <div 
              className="p-3 rounded-lg border-2"
              style={{ 
                background: 'var(--input)',
                borderColor: 'var(--feedback-later)'
              }}
            >
              <h4 className="font-semibold text-sm mb-2">Remote Progress</h4>
              <p className="text-xs">Guesses: {conflict.remote.guesses.length}</p>
              <p className="text-xs">Complete: {conflict.remote.isGameOver ? 'Yes' : 'No'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => sync.resolveConflict(conflict.id, 'local')}
              className="btn-secondary text-xs p-2"
            >
              Keep Local
            </button>
            <button
              onClick={() => sync.resolveConflict(conflict.id, 'merge')}
              className="btn-primary text-xs p-2"
            >
              Merge
            </button>
            <button
              onClick={() => sync.resolveConflict(conflict.id, 'remote')}
              className="btn-secondary text-xs p-2"
            >
              Keep Remote
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderContent = () => {
    switch (mode) {
      case 'setup':
        return renderSetupMode();
      case 'generate':
        return renderGenerateMode();
      case 'enter':
        return renderEnterMode();
      case 'status':
        return renderStatusMode();
      case 'conflicts':
        return renderConflictsMode();
      default:
        return renderSetupMode();
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="flex justify-between items-center mb-6">
        <h2 
          className="text-2xl font-bold font-[family-name:var(--font-playfair-display)]"
          style={{ color: 'var(--foreground)' }}
        >
          Anonymous Sync
        </h2>
        <button 
          onClick={onClose}
          className="modal-close-btn touch-optimized"
          style={{ color: 'var(--muted-foreground)' }}
          title="Close sync dialog"
          aria-label="Close sync dialog"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {renderContent()}
    </BaseModal>
  );
};