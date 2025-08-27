"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useHistoricalContext } from "@/hooks/useHistoricalContext";
import { formatYear } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";
import { Skeleton } from "@/components/ui/Skeleton";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface HistoricalContextCardProps {
  year?: number;
  events?: string[];
  className?: string;
  defaultExpanded?: boolean;
}

export const HistoricalContextCard: React.FC<HistoricalContextCardProps> = ({
  year,
  events = [],
  className = "",
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const aiContext = useHistoricalContext(year, events);

  // Debug mode check (only in development)
  const isDebugMode =
    process.env.NODE_ENV === "development" &&
    typeof window !== "undefined" &&
    window.location.search.includes("debug=true");

  // Add comprehensive logging for component mount
  useEffect(() => {
    // Component mounted with year and events
  }, []);

  // Removed auto-expansion - user must manually expand to view content

  // Save expansion preference and interaction state to sessionStorage
  useEffect(() => {
    if (year && hasUserInteracted) {
      sessionStorage.setItem(
        `chrondle-context-expanded-${year}`,
        String(isExpanded),
      );
      sessionStorage.setItem(`chrondle-context-interacted-${year}`, "true");
      if (isDebugMode) {
        logger.debug(
          `[HistoricalContextCard] Saved state - expanded: ${isExpanded}, interacted: true`,
        );
      }
    }
  }, [isExpanded, year, hasUserInteracted, isDebugMode]);

  // Load expansion preference and interaction state from sessionStorage
  useEffect(() => {
    if (year) {
      const savedExpanded = sessionStorage.getItem(
        `chrondle-context-expanded-${year}`,
      );
      const savedInteracted = sessionStorage.getItem(
        `chrondle-context-interacted-${year}`,
      );

      if (savedInteracted === "true") {
        setHasUserInteracted(true);
        if (savedExpanded !== null) {
          setIsExpanded(savedExpanded === "true");
          if (isDebugMode) {
            logger.debug(
              `[HistoricalContextCard] Restored state - expanded: ${savedExpanded}, interacted: true`,
            );
          }
        }
      }
    }
  }, [year, isDebugMode]);

  const handleToggle = () => {
    // Button clicked, checking current state

    if (isDebugMode) {
      logger.debug(
        `[HistoricalContextCard] Button clicked - current state: expanded=${isExpanded}, hasData=${!!aiContext.data}, error=${!!aiContext.error}, loading=${aiContext.loading}`,
      );
    }

    // Mark that user has interacted with the component
    setHasUserInteracted(true);

    if (aiContext.error) {
      // Retrying due to error
      if (isDebugMode)
        logger.debug(
          "[HistoricalContextCard] Retrying generation due to error",
        );
      aiContext.actions.retryGeneration();
    } else if (
      !aiContext.data &&
      !aiContext.loading &&
      year &&
      events.length > 0
    ) {
      // First-time generation starting

      if (isDebugMode)
        logger.debug(
          "[HistoricalContextCard] Generating context for first time",
        );
      setIsExpanded(true); // Expand immediately to show loading state
      aiContext.actions.generateContext(year, events);
    } else if (aiContext.data) {
      // Data exists - toggle between expanded/collapsed
      const newState = !isExpanded;
      // Data exists, toggling expansion

      if (isDebugMode)
        logger.debug(
          `[HistoricalContextCard] Toggling expansion: ${isExpanded} -> ${newState}`,
        );
      setIsExpanded(newState);
    } else {
      // Unexpected state - no action taken
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Single Container - Header and expandable content */}
      <div className="w-full bg-gradient-to-br from-blue-500/5 to-blue-600/10 border border-blue-500/20 rounded-xl overflow-hidden">
        {/* Header Row - Same structure as other cards */}
        <div className="flex items-center gap-4 px-6 py-4">
          {/* Left Side - Label Only */}
          <div className="flex flex-col items-start flex-1">
            <div className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wide font-medium">
              Historical Context
            </div>
          </div>

          {/* Right Side - Action Button */}
          <div className="flex gap-3">
            {aiContext.loading ? (
              <LoadingSpinner size="sm" className="text-blue-500" />
            ) : aiContext.error ? (
              <Button
                onClick={handleToggle}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full hover:bg-orange-100 dark:hover:bg-orange-900"
                aria-label="Retry generating historical context"
              >
                <svg
                  className="w-5 h-5 text-orange-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </Button>
            ) : (
              <Button
                onClick={handleToggle}
                disabled={aiContext.loading && !aiContext.data}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900"
                aria-expanded={isExpanded}
                aria-controls="historical-context-content"
                aria-label={
                  aiContext.data
                    ? `${isExpanded ? "Hide" : "Show"} historical context about ${year ? formatYear(year) : "this year"}`
                    : `Learn more about ${year ? formatYear(year) : "this year"}`
                }
              >
                <svg
                  className={`w-5 h-5 text-blue-500 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Button>
            )}
          </div>
        </div>

        {/* Expandable Content - Inside the same container */}
        <AnimatePresence>
          {isExpanded &&
            (aiContext.data || aiContext.loading || aiContext.error) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
                id="historical-context-content"
              >
                <div className="px-6 pt-1 pb-6">
                  {/* Loading State */}
                  {aiContext.loading && !aiContext.data && (
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-4/5" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  )}

                  {/* Error State */}
                  {aiContext.error && !aiContext.data && (
                    <div className="text-center py-4">
                      <p className="text-red-600 dark:text-red-400 mb-4">
                        We couldn&apos;t generate historical context for this
                        year. This might be due to a temporary service issue.
                      </p>
                      <Button
                        onClick={() => aiContext.actions.retryGeneration()}
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        Try Again
                      </Button>
                    </div>
                  )}

                  {/* Content State */}
                  {aiContext.data && (
                    <div className="prose prose-sm max-w-none dark:prose-invert text-left">
                      <div className="text-foreground leading-relaxed">
                        {aiContext.data.context
                          .split("\n\n")
                          .map((paragraph, index) => (
                            <p key={index} className="mb-3 last:mb-0 text-left">
                              {paragraph}
                            </p>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};
