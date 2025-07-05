'use client';

import { useState, useEffect, useMemo } from 'react';
import { createDebugUtilities } from '@/lib/gameState';
import { GameState } from '@/lib/gameState';
import { URL_PARAMS } from '@/lib/constants';
import { logger } from '@/lib/logger';

export interface UseDebugModeReturn {
  isDebugMode: boolean;
  debugYear: string | null;
  scenario: string | null;
  debugParams: string;
  
  // Debug utilities
  debugUtilities: ReturnType<typeof createDebugUtilities> | null;
}

export function useDebugMode(gameState: GameState): UseDebugModeReturn {
  const [urlParams, setUrlParams] = useState<URLSearchParams | null>(null);

  // Initialize URL params on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setUrlParams(params);
    }
  }, []);

  // Memoize debug state calculations
  const debugState = useMemo(() => {
    if (!urlParams) {
      return {
        isDebugMode: false,
        debugYear: null,
        scenario: null,
        debugParams: ''
      };
    }

    const isDebugMode = urlParams.get(URL_PARAMS.DEBUG) === 'true';
    const debugYear = urlParams.get(URL_PARAMS.YEAR);
    const scenario = urlParams.get(URL_PARAMS.SCENARIO);
    
    // Build debug params string
    const activeParams: string[] = [];
    if (debugYear) activeParams.push(`year=${debugYear}`);
    if (scenario) activeParams.push(`scenario=${scenario}`);
    const debugParams = activeParams.length ? activeParams.join(' | ') : 'Basic debug mode';

    return {
      isDebugMode,
      debugYear,
      scenario,
      debugParams
    };
  }, [urlParams]);

  // Create debug utilities
  const debugUtilities = useMemo(() => {
    if (!debugState.isDebugMode) return null;
    return createDebugUtilities(gameState);
  }, [debugState.isDebugMode, gameState]);

  // Set up global debug utilities
  useEffect(() => {
    if (typeof window !== 'undefined' && debugUtilities) {
      // @ts-expect-error - Adding debug utilities to window
      window.chrondle = debugUtilities;
      
      if (debugState.isDebugMode) {
        logger.info('🔧 Debug mode active. Use window.chrondle for utilities.');
      } else {
        logger.info('🔧 Debug utilities available: window.chrondle.debug(), window.chrondle.clearStorage()');
      }
    }

    // Cleanup on unmount
    return () => {
      if (typeof window !== 'undefined') {
        // @ts-expect-error - Delete debug utilities from window object
        delete window.chrondle;
      }
    };
  }, [debugUtilities, debugState.isDebugMode]);

  // Set up debug keyboard shortcuts
  useEffect(() => {
    if (!debugState.isDebugMode || typeof window === 'undefined') return;

    function handleDebugShortcuts(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'r':
            e.preventDefault();
            window.location.reload();
            break;
          case 'c':
            e.preventDefault();
            debugUtilities?.clearStorage();
            window.location.reload();
            break;
          case 'd':
            e.preventDefault();
            debugUtilities?.state();
            break;
        }
      }
    }

    document.addEventListener('keydown', handleDebugShortcuts);
    logger.info('⌨️  Debug shortcuts: Ctrl+R (reset), Ctrl+C (clear storage), Ctrl+D (dump state)');

    return () => {
      document.removeEventListener('keydown', handleDebugShortcuts);
    };
  }, [debugState.isDebugMode, debugUtilities]);

  return {
    ...debugState,
    debugUtilities
  };
}