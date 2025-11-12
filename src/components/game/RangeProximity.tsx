"use client";

import React from "react";
import { computeProximityScale } from "@/lib/proximityScale";
import { formatYear } from "@/lib/displayFormatting";

interface RangeProximityProps {
  rangeStart: number;
  rangeEnd: number;
  targetYear?: number;
  summary: string;
  subtext?: string;
  children?: React.ReactNode;
}

export function RangeProximity({
  rangeStart,
  rangeEnd,
  targetYear,
  summary,
  subtext,
  children,
}: RangeProximityProps) {
  const scale = computeProximityScale({ rangeStart, rangeEnd, targetYear });
  const hasTarget = typeof targetYear === "number";

  return (
    <div className="border-border/40 bg-background/70 rounded-xl border p-4 shadow-inner">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Proximity
          </p>
          <p className="text-foreground text-sm font-semibold">{summary}</p>
          {subtext && <p className="text-muted-foreground text-xs">{subtext}</p>}
        </div>
        {hasTarget && (
          <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Target {formatYear(targetYear as number)}
          </span>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-[0.65rem] font-semibold tracking-wide uppercase">
          <span className="flex items-center gap-1">
            <span className="bg-primary h-2 w-2 rounded-full" aria-hidden="true" />
            Your range
          </span>
          {hasTarget && (
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-rose-500" aria-hidden="true" />
              Target
            </span>
          )}
        </div>

        <div className="bg-muted/70 relative h-3 rounded-full">
          <div
            className="bg-primary/35 absolute inset-y-0 rounded-full"
            style={{
              left: `${scale.rangeStartPct}%`,
              width: `${Math.max(2, scale.rangeEndPct - scale.rangeStartPct)}%`,
            }}
            aria-label={`Range ${formatYear(rangeStart)} – ${formatYear(rangeEnd)}`}
          />

          {hasTarget && scale.targetPct !== null && (
            <div
              className="absolute top-1/2 flex -translate-y-1/2 flex-col items-center gap-1"
              style={{ left: `calc(${scale.targetPct}% - 8px)` }}
            >
              <span className="border-background flex h-4 w-4 items-center justify-center rounded-full border-2 bg-rose-500 text-[0.55rem] font-bold text-white" />
            </div>
          )}
        </div>

        <div className="text-muted-foreground flex justify-between text-[0.65rem] tracking-wide uppercase">
          <span>{formatYear(scale.axisStart)}</span>
          <span>{formatYear(scale.axisEnd)}</span>
        </div>
      </div>

      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
