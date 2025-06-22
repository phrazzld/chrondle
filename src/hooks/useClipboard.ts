'use client';

import { useState, useCallback } from 'react';

export interface UseClipboardReturn {
  copyToClipboard: (text: string) => Promise<boolean>;
  isCopying: boolean;
  lastCopySuccess: boolean | null;
}

export function useClipboard(): UseClipboardReturn {
  const [isCopying, setIsCopying] = useState(false);
  const [lastCopySuccess, setLastCopySuccess] = useState<boolean | null>(null);

  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    setIsCopying(true);
    
    try {
      // Modern clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        setLastCopySuccess(true);
        return true;
      } 
      
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '-9999px';
      document.body.appendChild(textarea);
      
      textarea.focus();
      textarea.select();
      
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      
      setLastCopySuccess(success);
      return success;
      
    } catch (error) {
      console.error('Failed to copy text:', error);
      setLastCopySuccess(false);
      return false;
    } finally {
      setIsCopying(false);
    }
  }, []);

  return {
    copyToClipboard,
    isCopying,
    lastCopySuccess
  };
}