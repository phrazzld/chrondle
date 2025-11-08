import React from "react";

import { cn } from "@/lib/utils";

interface RangePreviewProps {
  start: number;
  end: number;
  width: number;
  predictedScore: number;
  multiplier: number;
  className?: string;
}

export function RangePreview({
  start,
  end,
  width,
  predictedScore,
  multiplier,
  className,
}: RangePreviewProps): JSX.Element {
  return (
    <div className={cn("border-border bg-card rounded-lg border p-4 text-sm shadow-sm", className)}>
      <div className="text-muted-foreground flex justify-between">
        <span>Range</span>
        <span>
          {start} – {end}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-4 text-center text-base font-medium">
        <div>
          <div className="text-lg font-semibold">{width}</div>
          <div className="text-muted-foreground text-xs tracking-wide uppercase">years wide</div>
        </div>
        <div>
          <div className="text-lg font-semibold">{predictedScore}</div>
          <div className="text-muted-foreground text-xs tracking-wide uppercase">score</div>
        </div>
        <div>
          <div className="text-lg font-semibold">{Math.round(multiplier * 100)}%</div>
          <div className="text-muted-foreground text-xs tracking-wide uppercase">multiplier</div>
        </div>
      </div>
    </div>
  );
}
