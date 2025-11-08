"use client";

import React from "react";
import { GAME_CONFIG } from "@/lib/constants";
import { formatYear } from "@/lib/displayFormatting";
import { SCORING_CONSTANTS } from "@/lib/scoring";
import { useShareGame } from "@/hooks/useShareGame";
import { ShareCard } from "@/components/ui/ShareCard";
import type { RangeGuess } from "@/types/range";
import { cn } from "@/lib/utils";

interface GameCompleteProps {
  ranges: RangeGuess[];
  totalScore: number;
  hasWon: boolean;
  puzzleNumber?: number;
  className?: string;
}

function RangeSummary({ range, index }: { range: RangeGuess; index: number }) {
  const widthYears = range.end - range.start + 1;
  const widthPercent = Math.min(1, widthYears / SCORING_CONSTANTS.W_MAX) * 100;
  const contained = range.score > 0;

  return (
    <div
      className={cn(
        "border-border/40 bg-background/80 rounded-xl border p-3",
        contained ? "shadow-sm ring-1 ring-green-500/30" : "",
      )}
    >
      <div className="text-muted-foreground mb-2 flex items-center justify-between text-xs font-medium tracking-wide uppercase">
        <span>
          Attempt {index + 1} • {formatYear(range.start)} – {formatYear(range.end)}
        </span>
        <span className={contained ? "text-green-600" : "text-muted-foreground"}>
          {contained ? "Contained" : "Missed"}
        </span>
      </div>

      <div className="mb-2 flex items-center gap-3">
        <div className="bg-muted relative h-2 flex-1 rounded-full">
          <div
            className={cn(
              "absolute top-0 left-0 h-full rounded-full",
              contained ? "bg-green-500" : "bg-muted-foreground/50",
            )}
            style={{ width: `${Math.max(8, widthPercent)}%` }}
          />
        </div>
        <span className="text-muted-foreground font-mono text-xs">H{range.hintsUsed}</span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-foreground font-semibold">{range.score} pts</span>
        <span className="text-muted-foreground">
          Width: {widthYears} yr{widthYears === 1 ? "" : "s"}
        </span>
      </div>
    </div>
  );
}

export function GameComplete({
  ranges,
  totalScore,
  hasWon,
  puzzleNumber,
  className,
}: GameCompleteProps) {
  const maxAttempts = GAME_CONFIG.MAX_GUESSES;
  const containedCount = ranges.filter((range) => range.score > 0).length;

  const { shareGame, shareStatus, isSharing } = useShareGame(
    ranges,
    totalScore,
    hasWon,
    puzzleNumber,
  );

  return (
    <section
      className={cn(
        "border-border/60 bg-card/80 rounded-2xl border p-5 shadow-lg backdrop-blur",
        className,
      )}
    >
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
            Game Summary
          </p>
          <h3 className="text-foreground text-2xl font-bold">
            {hasWon ? "Range contained!" : "Study the timeline"}
          </h3>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground text-sm">Total Score</p>
          <p className="text-primary text-3xl font-black">{totalScore.toLocaleString()} pts</p>
          <p className="text-muted-foreground text-xs">
            {containedCount}/{maxAttempts} ranges contained
          </p>
        </div>
      </div>

      <div className="mb-6 space-y-3">
        {ranges.length === 0 ? (
          <p className="text-muted-foreground text-sm">No ranges submitted yet.</p>
        ) : (
          ranges.map((range, index) => (
            <RangeSummary key={`${range.start}-${index}`} range={range} index={index} />
          ))
        )}
      </div>

      <ShareCard
        ranges={ranges}
        totalScore={totalScore}
        hasWon={hasWon}
        shareStatus={shareStatus}
        onShare={() => shareGame()}
        isSharing={isSharing}
        containedCount={containedCount}
        maxAttempts={maxAttempts}
      />
    </section>
  );
}
