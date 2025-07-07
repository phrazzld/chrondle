"use client";

import { useState, useCallback, useEffect } from "react";
import { generateShareText, generateEmojiTimeline } from "@/lib/utils";
import { useWebShare } from "@/hooks/useWebShare";

export type ShareStatus = "idle" | "success" | "error";

interface UseShareGameOptions {
  onSuccess?: () => void;
  onError?: () => void;
  detailed?: boolean;
}

export function useShareGame(
  guesses: number[],
  targetYear: number,
  hasWon: boolean,
  puzzleEvents?: string[],
  options?: UseShareGameOptions,
) {
  const { onSuccess, onError, detailed = false } = options || {};
  const { share, canShare, shareMethod } = useWebShare();
  const [shareStatus, setShareStatus] = useState<ShareStatus>("idle");

  // Generate both compact and detailed share text
  const compactShareText = generateShareText(
    guesses,
    targetYear,
    hasWon,
    puzzleEvents,
  );
  const detailedShareText = generateShareText(
    guesses,
    targetYear,
    hasWon,
    puzzleEvents,
  );
  const emojiBarcode = generateEmojiTimeline(guesses, targetYear);

  // Reset status after delay
  useEffect(() => {
    if (shareStatus === "success" || shareStatus === "error") {
      const timer = setTimeout(() => {
        setShareStatus("idle");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [shareStatus]);

  const shareGame = useCallback(
    async (useDetailed?: boolean) => {
      const textToShare =
        useDetailed || detailed ? detailedShareText : compactShareText;

      // Use Web Share API if available, otherwise fallback to clipboard
      const success = await share(
        textToShare,
        "Chrondle Results",
        undefined, // Don't include URL in share data to avoid encoding issues
      );

      if (success) {
        setShareStatus("success");
        onSuccess?.();

        // Trigger celebration if won
        if (hasWon) {
          // Dispatch custom event for celebration
          window.dispatchEvent(new CustomEvent("chrondle:celebrate"));
        }
      } else {
        setShareStatus("error");
        onError?.();
      }
    },
    [
      compactShareText,
      detailedShareText,
      share,
      hasWon,
      detailed,
      onSuccess,
      onError,
    ],
  );

  return {
    shareGame,
    shareStatus,
    compactShareText,
    detailedShareText,
    emojiBarcode,
    canShare,
    shareMethod,
  };
}
