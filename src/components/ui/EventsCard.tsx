"use client";

import React from "react";
import { formatYear } from "@/lib/displayFormatting";

interface EventsCardProps {
  events: string[];
  targetYear: number;
}

export const EventsCard: React.FC<EventsCardProps> = ({
  events,
  targetYear,
}) => {
  return (
    <div className="bg-gradient-to-br from-card via-card to-muted/50 rounded-2xl p-4 border border-border/50 shadow-lg">
      <div className="space-y-3">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-foreground mb-1">
            Events from {formatYear(targetYear)}
          </h3>
          <p className="text-sm text-muted-foreground">
            Here&apos;s what was happening in history
          </p>
        </div>

        {/* Events List */}
        <div className="space-y-3">
          {events.map((event, index) => (
            <div
              key={index}
              className="group bg-background/60 rounded-lg p-4 border border-border/30 hover:bg-background/80 transition-all duration-200 hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                {/* Timeline dot */}
                <div className="flex-shrink-0 mt-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-blue-600 group-hover:scale-125 transition-transform duration-200" />
                </div>

                {/* Event text */}
                <p className="text-sm leading-relaxed text-foreground group-hover:text-foreground/90 transition-colors duration-200">
                  {event}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
