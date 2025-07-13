"use client";

import { useState, useCallback } from "react";
import { getShareStrategy, type ShareStrategy } from "@/lib/platformDetection";

export interface UseWebShareReturn {
  share: (text: string) => Promise<boolean>;
  isSharing: boolean;
  canShare: boolean;
  lastShareSuccess: boolean | null;
  shareMethod: "webshare" | "clipboard" | "fallback" | null;
  shareStrategy: ShareStrategy;
}

export function useWebShare(): UseWebShareReturn {
  const [isSharing, setIsSharing] = useState(false);
  const [lastShareSuccess, setLastShareSuccess] = useState<boolean | null>(
    null,
  );
  const [shareMethod, setShareMethod] = useState<
    "webshare" | "clipboard" | "fallback" | null
  >(null);

  // Get platform-appropriate sharing strategy
  const shareStrategy = getShareStrategy();
  const canShare = shareStrategy !== "fallback";

  const share = useCallback(
    async (text: string): Promise<boolean> => {
      setIsSharing(true);

      try {
        // Use platform-appropriate sharing strategy
        if (shareStrategy === "native") {
          // Use Web Share API only on mobile devices
          if (navigator.share) {
            try {
              await navigator.share({
                text: text,
                title: "Chrondle",
              });
              setShareMethod("webshare");
              setLastShareSuccess(true);
              return true;
            } catch (shareError) {
              // User cancelled or share failed, fall back to clipboard
              console.warn(
                "Web Share cancelled or failed, falling back to clipboard:",
                shareError,
              );
              // Fall through to clipboard fallback
            }
          }
        }

        // Use clipboard for desktop or Web Share fallback
        if (shareStrategy === "clipboard" || shareStrategy === "native") {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            setShareMethod("clipboard");
            setLastShareSuccess(true);
            return true;
          }
        }

        // Legacy clipboard fallback for older browsers
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

        setShareMethod("fallback");
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
    [shareStrategy], // Include shareStrategy dependency
  );

  return {
    share,
    isSharing,
    canShare,
    lastShareSuccess,
    shareMethod,
    shareStrategy,
  };
}
