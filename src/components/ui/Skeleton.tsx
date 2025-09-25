"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.ComponentProps<"div"> {
  variant?: "text" | "card" | "button" | "input" | "circular";
  shimmer?: boolean;
}

function Skeleton({ className, variant = "text", shimmer = true, ...props }: SkeletonProps) {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setShouldReduceMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setShouldReduceMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);
  const variantStyles = {
    text: "h-4 w-full rounded",
    card: "h-24 w-full rounded-lg",
    button: "h-10 w-24 rounded-md",
    input: "h-12 w-full rounded-md",
    circular: "h-12 w-12 rounded-full",
  };

  return (
    <div
      data-slot="skeleton"
      className={cn(
        shouldReduceMotion ? "" : "animate-pulse",
        shimmer && !shouldReduceMotion
          ? "from-muted/50 via-muted/60 to-muted/50 bg-gradient-to-r bg-[length:200%_100%]"
          : "bg-muted/50",
        variantStyles[variant],
        className,
      )}
      {...props}
      style={
        shimmer && !shouldReduceMotion
          ? {
              ...props.style,
              backgroundSize: "200% 100%",
              animation:
                "shimmer 1.5s ease-in-out infinite, pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            }
          : props.style
      }
    />
  );
}

// Skeleton container for multiple skeleton items
const SkeletonContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return <div className={cn("space-y-2", className)}>{children}</div>;
};

// Pre-built skeleton for hint card loading state
const SkeletonHintCard: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("border-border/70 bg-muted/30 rounded-lg border px-4 py-3", className)}>
      <div className="mb-2 flex items-center justify-between">
        {/* Header skeleton */}
        <Skeleton variant="text" className="h-3 w-24" />
        {/* Progress dots skeleton */}
        <div className="flex items-center gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="circular" className="h-2.5 w-2.5" />
          ))}
        </div>
      </div>
      {/* Content skeleton */}
      <SkeletonContainer>
        <Skeleton variant="text" className="h-4 w-full" />
        <Skeleton variant="text" className="h-4 w-3/4" />
      </SkeletonContainer>
    </div>
  );
};

export { Skeleton, SkeletonContainer, SkeletonHintCard };
