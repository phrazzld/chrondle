"use client";

import React from "react";
import { RippleButton } from "@/components/magicui/ripple-button";
import type { ShareStatus } from "@/hooks/useShareGame";
import type { RangeGuess } from "@/types/range";
import { SCORING_CONSTANTS } from "@/lib/scoring";
import { GAME_CONFIG } from "@/lib/constants";
import { formatYear } from "@/lib/displayFormatting";
import { cn } from "@/lib/utils";

interface ShareCardProps {
  ranges: RangeGuess[];
  totalScore: number;
  onShare: () => void;
  shareStatus: ShareStatus;
  hasWon: boolean;
  isSharing?: boolean;
  maxAttempts?: number;
  containedCount?: number;
}

export const ShareCard: React.FC<ShareCardProps> = ({
  ranges,
  totalScore,
  onShare,
  shareStatus,
  hasWon,
  isSharing = false,
  maxAttempts = GAME_CONFIG.MAX_GUESSES,
  containedCount,
}) => {
  const resolvedContained = containedCount ?? ranges.filter((range) => range.score > 0).length;

  const getShareButtonLabel = () => {
    switch (shareStatus) {
      case "success":
        return "Copied!";
      case "error":
        return "Try again";
      default:
        return "Share results";
    }
  };

  const getButtonStyles = () => {
    const base = "w-full py-3 px-4 font-semibold text-sm rounded-lg transition-all duration-300";
    switch (shareStatus) {
      case "success":
        return `${base} bg-green-500 text-white hover:bg-green-600`;
      case "error":
        return `${base} bg-red-500 text-white hover:bg-red-600`;
      default:
        return `${base} bg-primary text-primary-foreground hover:bg-primary/90`;
    }
  };

  const statusIcon = () => {
    switch (shareStatus) {
      case "success":
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case "error":
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
      default:
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
            />
          </svg>
        );
    }
  };

  return (
    <div className="border-border/40 bg-background/80 rounded-2xl border p-4 shadow-inner">
      <div className="mb-4 text-center">
        <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          Share Card
        </p>
        <p className="text-foreground text-lg font-bold">
          {hasWon ? "Precision pays off" : "Range lessons learned"}
        </p>
        <p className="text-muted-foreground text-sm">
          {resolvedContained}/{maxAttempts} ranges contained • {totalScore.toLocaleString()} pts
        </p>
      </div>

      <div className="mb-4 space-y-3" data-testid="share-card-range-list">
        {ranges.length === 0 ? (
          <p className="text-muted-foreground text-sm">No ranges recorded.</p>
        ) : (
          ranges.map((range, index) => {
            const widthYears = range.end - range.start + 1;
            const widthPercent = Math.min(1, widthYears / SCORING_CONSTANTS.W_MAX) * 100;
            const contained = range.score > 0;

            return (
              <div key={`${range.start}-${range.end}-${index}`}>
                <div className="text-muted-foreground mb-1 flex items-center justify-between text-xs">
                  <span>
                    Attempt {index + 1} • H{range.hintsUsed}
                  </span>
                  <span className="text-foreground font-semibold">{range.score} pts</span>
                </div>
                <div className="mb-1 flex items-center gap-2">
                  <div className="bg-muted relative h-2 flex-1 overflow-hidden rounded-full">
                    <div
                      className={cn(
                        "absolute top-0 left-0 h-full",
                        contained ? "bg-green-500" : "bg-muted-foreground/60",
                      )}
                      style={{ width: `${Math.max(8, widthPercent)}%` }}
                    />
                  </div>
                  {contained && (
                    <span className="text-[0.6rem] font-semibold text-green-600 uppercase">OK</span>
                  )}
                </div>
                <p className="text-muted-foreground text-[0.65rem] tracking-wide uppercase">
                  {formatYear(range.start)} – {formatYear(range.end)} ({widthYears} yr
                  {widthYears === 1 ? "" : "s"})
                </p>
              </div>
            );
          })
        )}
      </div>

      <RippleButton
        onClick={onShare}
        disabled={isSharing}
        aria-label="Share your results"
        className={cn(getButtonStyles(), isSharing && "opacity-70")}
        rippleColor="rgba(255,255,255,0.25)"
      >
        <span className="flex items-center justify-center gap-2 text-sm font-semibold">
          {statusIcon()} {getShareButtonLabel()}
        </span>
      </RippleButton>
    </div>
  );
};
