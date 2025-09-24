"use client";

import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-background border-border w-full border-t py-4">
      <div className="mx-auto max-w-2xl px-6 sm:px-0">
        <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 text-sm sm:flex-row sm:gap-3">
          {/* Copyright */}
          <span className="text-xs opacity-75 sm:text-sm">© 2025 Chrondle</span>

          {/* Separator */}
          <span className="hidden opacity-50 sm:inline">·</span>

          {/* GitHub */}
          <a
            href="https://github.com/phrazzld/chrondle"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground underline-offset-4 transition-colors duration-200 hover:underline"
            aria-label="View Chrondle source code on GitHub"
          >
            GitHub
          </a>

          {/* Separator */}
          <span className="hidden opacity-50 sm:inline">·</span>

          {/* Feedback */}
          <a
            href="mailto:phaedrus.raznikov@pm.me"
            className="hover:text-foreground underline-offset-4 transition-colors duration-200 hover:underline"
          >
            Feedback
          </a>
        </div>
      </div>
    </footer>
  );
};
