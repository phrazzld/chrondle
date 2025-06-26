'use client';

import React, { useState, useCallback } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
        <h3 className="text-lg font-semibold mb-2 text-foreground">
          Sync Your Progress
        </h3>
        <p className="text-sm text-muted-foreground">
          Keep your game progress, streaks, and settings synchronized across devices without creating an account.
        </p>
      </div>

      <div className="space-y-3">
        <Button
          onClick={handleGenerateCode}
          disabled={sync.isLoading}
          className="w-full"
        >
          📱 Generate Sync Code
        </Button>
        
        <div className="text-center">
          <span className="text-xs text-muted-foreground">or</span>
        </div>
        
        <Button
          onClick={() => setMode('enter')}
          disabled={sync.isLoading}
          variant="secondary"
          className="w-full"
        >
          🔗 Enter Sync Code
        </Button>
      </div>
    </div>
  );

  const renderGenerateMode = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2 text-foreground">
          Your Sync Code
        </h3>
        <p className="text-sm text-muted-foreground">
          Share this code with your other devices to sync your progress.
        </p>
      </div>

      {sync.syncCode && (
        <div className="text-center space-y-4">
          <div className="p-4 rounded-lg border-2 border-primary bg-secondary font-mono text-2xl font-bold tracking-wider text-primary">
            {formatSyncCode(sync.syncCode)}
          </div>
          
          <div className="space-y-2">
            <Button
              onClick={() => navigator.clipboard.writeText(sync.syncCode!)}
              variant="secondary"
              size="sm"
            >
              📋 Copy Code
            </Button>
            <p className="text-xs text-muted-foreground">
              Code expires in 24 hours for security
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          onClick={() => setMode('setup')}
          variant="secondary"
          className="flex-1"
        >
          Back
        </Button>
        <Button
          onClick={() => setMode('status')}
          className="flex-1"
        >
          Done
        </Button>
      </div>
    </div>
  );

  const renderEnterMode = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2 text-foreground">
          Enter Sync Code
        </h3>
        <p className="text-sm text-muted-foreground">
          Enter the 8-character code from your other device.
        </p>
      </div>

      <div className="space-y-4">
        <Input
          type="text"
          value={codeInput}
          onChange={(e) => setCodeInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
          placeholder="ABC1-2345"
          maxLength={9}
          className="w-full p-3 text-center font-mono text-lg"
        />
        
        {sync.error && (
          <div className="p-2 rounded text-sm bg-destructive text-destructive-foreground">
            {sync.error}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          onClick={() => setMode('setup')}
          variant="secondary"
          className="flex-1"
        >
          Back
        </Button>
        <Button
          onClick={handleEnterCode}
          disabled={codeInput.length !== 8 || sync.isLoading}
          className="flex-1"
        >
          {sync.isLoading ? 'Connecting...' : 'Connect'}
        </Button>
      </div>
    </div>
  );

  const renderStatusMode = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2 text-foreground">
          Sync Status
        </h3>
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm text-white ${
          sync.status === 'synced' ? 'bg-green-600' : 'bg-blue-600'
        }`}>
          {sync.status === 'synced' ? '✅' : '🔄'} 
          {sync.status === 'synced' ? 'Synced' : 'Ready to Sync'}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 rounded-lg bg-secondary">
          <span className="text-sm font-medium">Sync Code</span>
          <span className="font-mono text-sm text-primary">
            {sync.syncCode ? formatSyncCode(sync.syncCode) : 'Not set'}
          </span>
        </div>
        
        {sync.lastSync && (
          <div className="flex justify-between items-center p-3 rounded-lg bg-secondary">
            <span className="text-sm font-medium">Last Sync</span>
            <span className="text-sm text-muted-foreground">
              {sync.lastSync.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Button
          onClick={sync.pushData}
          disabled={sync.isLoading}
          className="w-full"
        >
          📤 {sync.isLoading ? 'Syncing...' : 'Sync Now'}
        </Button>
        
        <Button
          onClick={handleDisableSync}
          disabled={sync.isLoading}
          variant="secondary"
          className="w-full text-sm"
        >
          🗑️ Disable Sync
        </Button>
      </div>
    </div>
  );

  const renderConflictsMode = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2 text-foreground">
          Sync Conflicts
        </h3>
        <p className="text-sm text-muted-foreground">
          Your local progress differs from the synced version. Choose which to keep.
        </p>
      </div>

      {sync.conflicts.map((conflict) => (
        <div key={conflict.id} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border-2 border-red-500 bg-secondary">
              <h4 className="font-semibold text-sm mb-2">Local Progress</h4>
              <p className="text-xs">Guesses: {conflict.local.guesses.length}</p>
              <p className="text-xs">Complete: {conflict.local.isGameOver ? 'Yes' : 'No'}</p>
            </div>
            
            <div className="p-3 rounded-lg border-2 border-blue-500 bg-secondary">
              <h4 className="font-semibold text-sm mb-2">Remote Progress</h4>
              <p className="text-xs">Guesses: {conflict.remote.guesses.length}</p>
              <p className="text-xs">Complete: {conflict.remote.isGameOver ? 'Yes' : 'No'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={() => sync.resolveConflict(conflict.id, 'local')}
              variant="secondary"
              size="sm"
            >
              Keep Local
            </Button>
            <Button
              onClick={() => sync.resolveConflict(conflict.id, 'merge')}
              size="sm"
            >
              Merge
            </Button>
            <Button
              onClick={() => sync.resolveConflict(conflict.id, 'remote')}
              variant="secondary"
              size="sm"
            >
              Keep Remote
            </Button>
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-serif">
            Anonymous Sync
          </DialogTitle>
        </DialogHeader>
        
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};