"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";

interface HistoricalContextCardProps {
  context?: string;
  className?: string;
  defaultExpanded?: boolean;
}

export const HistoricalContextCard: React.FC<HistoricalContextCardProps> = ({
  context,
  className = "",
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  // Don't render if no context is provided
  if (!context) {
    return null;
  }

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
            <Button
              onClick={handleToggle}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900"
              aria-expanded={isExpanded}
              aria-controls="historical-context-content"
              aria-label={
                isExpanded
                  ? "Hide historical context"
                  : "Show historical context"
              }
            >
              <svg
                className={`w-4 h-4 text-blue-500 transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
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
          </div>
        </div>

        {/* Expandable Content - Inside the same container */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
              id="historical-context-content"
            >
              <div className="px-6 pt-1 pb-6">
                {/* Content */}
                <div className="prose prose-sm max-w-none dark:prose-invert text-left">
                  <div className="text-foreground leading-relaxed">
                    {context.split("\n\n").map((paragraph, index) => (
                      <p key={index} className="mb-3 last:mb-0 text-left">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
