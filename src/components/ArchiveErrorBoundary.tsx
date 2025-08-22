"use client";

import React from "react";
import { ErrorBoundary } from "./ErrorBoundary";
import { Archive, Home, RotateCw } from "lucide-react";
import Link from "next/link";

interface ArchiveErrorBoundaryProps {
  children: React.ReactNode;
  year?: string | number;
}

/**
 * Specialized error boundary for archive routes with custom fallback UI
 */
export function ArchiveErrorBoundary({
  children,
  year,
}: ArchiveErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md w-full mx-4 p-6 bg-card rounded-lg border shadow-lg">
            <div className="text-center">
              <div className="text-4xl mb-4">🚨</div>
              <h1 className="text-xl font-bold text-foreground mb-2">
                Archive Error
              </h1>
              <p className="text-muted-foreground mb-6">
                {year
                  ? `Unable to load the puzzle for year ${year}.`
                  : "Unable to load the puzzle archive."}
                {" This has been logged for investigation."}
              </p>

              <div className="space-y-3">
                <Link href="/archive" className="block">
                  <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                    <Archive className="w-4 h-4" />
                    Return to Archive
                  </button>
                </Link>

                <Link href="/" className="block">
                  <button className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2">
                    <Home className="w-4 h-4" />
                    Go to Today&apos;s Puzzle
                  </button>
                </Link>

                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/90 transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCw className="w-4 h-4" />
                  Try Again
                </button>
              </div>

              {/* Development error details */}
              {process.env.NODE_ENV === "development" && (
                <div className="mt-6 text-left">
                  <p className="text-xs text-muted-foreground">
                    Check console for detailed error information
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      }
      onError={(error) => {
        // Log archive-specific error context
        console.error("Archive Error:", {
          error: error.message,
          year,
          path: window.location.pathname,
          timestamp: new Date().toISOString(),
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
