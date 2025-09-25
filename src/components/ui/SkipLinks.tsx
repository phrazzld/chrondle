"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SkipLink {
  id: string;
  label: string;
}

const skipLinks: SkipLink[] = [
  { id: "main-content", label: "Skip to main game" },
  { id: "game-controls", label: "Skip to game controls" },
  { id: "navigation", label: "Skip to navigation" },
  { id: "footer", label: "Skip to footer" },
];

/**
 * Accessibility skip links for screen reader users and keyboard navigation
 * Hidden by default, visible when focused
 */
export const SkipLinks: React.FC = () => {
  const handleSkipClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div
      className="sr-only focus-within:not-sr-only focus-within:fixed focus-within:top-0 focus-within:left-0 focus-within:z-[100]"
      aria-label="Skip navigation links"
    >
      <nav className="bg-background border-border flex flex-col border-b p-2 shadow-lg">
        <span className="text-muted-foreground mb-2 px-4 text-xs font-semibold uppercase">
          Quick Navigation
        </span>
        {skipLinks.map((link) => (
          <a
            key={link.id}
            href={`#${link.id}`}
            onClick={(e) => handleSkipClick(e, link.id)}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "focus:bg-accent focus:text-accent-foreground focus:outline-none",
              "focus:ring-ring focus:ring-2 focus:ring-offset-2",
            )}
          >
            {link.label}
          </a>
        ))}
      </nav>
    </div>
  );
};
