'use client';

import { useState, useCallback, useEffect } from 'react';
import { generateShareText, generateEmojiTimeline } from '@/lib/utils';
import { useClipboard } from '@/hooks/useClipboard';

export type ShareStatus = 'idle' | 'copying' | 'success' | 'error';

interface UseShareGameOptions {
  onSuccess?: () => void;
  onError?: () => void;
  detailed?: boolean;
}

export function useShareGame(
  guesses: number[],
  targetYear: number,
  hasWon: boolean,
  options?: UseShareGameOptions
) {
  const { onSuccess, onError, detailed = false } = options || {};
  const { copyToClipboard } = useClipboard();
  const [shareStatus, setShareStatus] = useState<ShareStatus>('idle');
  
  // Generate both compact and detailed share text
  const compactShareText = generateShareText(guesses, targetYear, false);
  const detailedShareText = generateShareText(guesses, targetYear, true);
  const emojiBarcode = generateEmojiTimeline(guesses, targetYear);
  
  // Reset status after delay
  useEffect(() => {
    if (shareStatus === 'success' || shareStatus === 'error') {
      const timer = setTimeout(() => {
        setShareStatus('idle');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [shareStatus]);
  
  const shareGame = useCallback(async (useDetailed?: boolean) => {
    setShareStatus('copying');
    
    const textToShare = useDetailed || detailed ? detailedShareText : compactShareText;
    const success = await copyToClipboard(textToShare);
    
    if (success) {
      setShareStatus('success');
      onSuccess?.();
      
      // Trigger celebration if won
      if (hasWon) {
        // Dispatch custom event for celebration
        window.dispatchEvent(new CustomEvent('chrondle:celebrate'));
      }
    } else {
      setShareStatus('error');
      onError?.();
    }
  }, [compactShareText, detailedShareText, copyToClipboard, hasWon, detailed, onSuccess, onError]);
  
  return {
    shareGame,
    shareStatus,
    compactShareText,
    detailedShareText,
    emojiBarcode
  };
}