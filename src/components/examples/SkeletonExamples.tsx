"use client";

import React from "react";
import { Skeleton, SkeletonContainer, SkeletonHintCard } from "@/components/ui/Skeleton";

/**
 * Example usage of Skeleton components for different loading states
 */
export const SkeletonExamples: React.FC = () => {
  return (
    <div className="space-y-8 p-4">
      {/* Hint Card Loading State */}
      <div>
        <h3 className="text-muted-foreground mb-2 text-sm font-medium">Hint Card Loading</h3>
        <SkeletonHintCard />
      </div>

      {/* Timeline Loading State */}
      <div>
        <h3 className="text-muted-foreground mb-2 text-sm font-medium">Timeline Loading</h3>
        <div className="flex items-center justify-between gap-2">
          <Skeleton variant="text" className="h-4 w-16" />
          <Skeleton className="h-1 flex-1" />
          <Skeleton variant="text" className="h-4 w-16" />
        </div>
      </div>

      {/* Button Loading State */}
      <div>
        <h3 className="text-muted-foreground mb-2 text-sm font-medium">Button Loading</h3>
        <Skeleton variant="button" className="h-12 w-32" />
      </div>

      {/* Input Loading State */}
      <div>
        <h3 className="text-muted-foreground mb-2 text-sm font-medium">Input Loading</h3>
        <Skeleton variant="input" />
      </div>

      {/* General Card Loading State */}
      <div>
        <h3 className="text-muted-foreground mb-2 text-sm font-medium">Card Loading</h3>
        <div className="border-border/70 bg-muted/30 rounded-lg border p-4">
          <SkeletonContainer>
            <Skeleton variant="text" className="h-6 w-1/3" />
            <Skeleton variant="text" className="h-4 w-full" />
            <Skeleton variant="text" className="h-4 w-4/5" />
            <div className="mt-4 flex gap-2">
              <Skeleton variant="button" />
              <Skeleton variant="button" />
            </div>
          </SkeletonContainer>
        </div>
      </div>

      {/* Multi-item List Loading State */}
      <div>
        <h3 className="text-muted-foreground mb-2 text-sm font-medium">List Loading</h3>
        <SkeletonContainer>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton variant="circular" className="h-10 w-10" />
              <div className="flex-1 space-y-1">
                <Skeleton variant="text" className="h-4 w-2/3" />
                <Skeleton variant="text" className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </SkeletonContainer>
      </div>
    </div>
  );
};
