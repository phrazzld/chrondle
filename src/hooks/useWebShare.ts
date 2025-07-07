"use client";

import { useState, useCallback } from "react";

export interface UseWebShareReturn {
  share: (text: string, title?: string, url?: string) => Promise<boolean>;
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
    async (
      text: string,
      title: string = "Chrondle Results",
      url?: string,
    ): Promise<boolean> => {
      setIsSharing(true);

      try {
        // Try Web Share API first if available
        if (canShare) {
          try {
            // Prepare share data
            const shareData: ShareData = {
              title,
              text,
            };

            // Only add URL if provided
            if (url) {
              shareData.url = url;
            }

            await navigator.share(shareData);
            setShareMethod("webshare");
            setLastShareSuccess(true);
            return true;
          } catch (error) {
            // User cancelled or share failed
            if (error instanceof Error && error.name === "AbortError") {
              // User cancelled - this is not really a failure
              setShareMethod("webshare");
              setLastShareSuccess(true);
              return true;
            }
            // Fall through to clipboard fallback
            console.warn(
              "Web Share API failed, falling back to clipboard:",
              error,
            );
          }
        }

        // Fallback to clipboard
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
    [canShare],
  );

  return {
    share,
    isSharing,
    canShare,
    lastShareSuccess,
    shareMethod,
  };
}
