"use client";

import { cn } from "@/lib/utils";

interface AuthSkeletonProps {
  className?: string;
}

export function AuthSkeleton({ className }: AuthSkeletonProps) {
  return (
    <div
      className={cn("flex items-center justify-center w-10 h-10", className)}
      role="status"
      aria-label="Loading authentication status"
    >
      <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
      <span className="sr-only">Loading authentication status</span>
    </div>
  );
}
