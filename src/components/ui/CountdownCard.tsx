'use client';

import React from 'react';

interface CountdownCardProps {
  timeString: string;
}

export const CountdownCard: React.FC<CountdownCardProps> = ({
  timeString
}) => {
  return (
    <div className="bg-gradient-to-br from-primary/10 via-blue-50/50 to-purple-50/50 dark:from-primary/5 dark:via-blue-950/20 dark:to-purple-950/20 rounded-2xl p-4 border border-primary/20 shadow-lg">
      <div className="text-center space-y-2">
        
        {/* Header */}
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            Next Historical Mystery
          </h3>
          <p className="text-sm text-muted-foreground">
            A new puzzle awaits
          </p>
        </div>

        {/* Countdown */}
        <div className="bg-background/60 rounded-xl p-4 border border-border/30">
          <div className="text-3xl font-mono font-bold text-primary mb-1">
            {timeString}
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Hours : Minutes : Seconds
          </p>
        </div>

        {/* Encouragement */}
        <p className="text-xs text-muted-foreground">
          Ready for tomorrow&apos;s challenge?
        </p>
      </div>
    </div>
  );
};