"use client";

import { useState, useCallback } from "react";

export interface UseWebShareReturn {
  share: (text: string) => Promise<boolean>;
  isSharing: boolean;
  canShare: boolean;
  lastShareSuccess: boolean | null;
  shareMethod: "webshare" | "clipboard" | null;
}

export function useWebShare(): UseWebShareReturn {
  const [isSharing, setIsSharing] = useState(false);
  const [lastShareSuccess, setLastShareSuccess] = useState<boolean | null>(
    null,
  );
  const [shareMethod, setShareMethod] = useState<
    "webshare" | "clipboard" | null
  >(null);

  // Check if Web Share API is available
  const canShare =
    typeof navigator !== "undefined" &&
    "share" in navigator &&
    typeof navigator.share === "function";

  const share = useCallback(
    async (text: string): Promise<boolean> => {
      setIsSharing(true);

      try {
        // Skip Web Share API and use clipboard directly for consistent UX

        // Use clipboard for consistent UX
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
          setShareMethod("clipboard");
          setLastShareSuccess(true);
          return true;
        }

        // Legacy clipboard fallback
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        textarea.style.top = "-9999px";
        document.body.appendChild(textarea);

        textarea.focus();
        textarea.select();

        const success = document.execCommand("copy");
        document.body.removeChild(textarea);

        setShareMethod("clipboard");
        setLastShareSuccess(success);
        return success;
      } catch (error) {
        console.error("Failed to share:", error);
        setLastShareSuccess(false);
        return false;
      } finally {
        setIsSharing(false);
      }
    },
    [], // No dependencies needed since we're using clipboard directly
  );

  return {
    share,
    isSharing,
    canShare,
    lastShareSuccess,
    shareMethod,
  };
}
