"use client";

import React from "react";
import { Github } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-background border-border w-full border-t py-4">
      <div className="mx-auto max-w-2xl px-6 sm:px-0">
        <div className="text-muted-foreground flex flex-col items-center justify-center gap-3 text-sm sm:flex-row sm:gap-4">
          {/* Copyright */}
          <span>© 2025 Chrondle</span>

          {/* Separator - hidden on mobile */}
          <span className="hidden sm:inline">•</span>

          {/* Built by */}
          <a
            href="https://phaedrus.io"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground underline-offset-4 transition-colors hover:underline"
          >
            Built by phaedrus.io
          </a>

          {/* Separator - hidden on mobile */}
          <span className="hidden sm:inline">•</span>

          {/* Feedback */}
          <a
            href="mailto:phaedrus.raznikov@pm.me"
            className="hover:text-foreground underline-offset-4 transition-colors hover:underline"
          >
            Feedback
          </a>

          {/* Separator - hidden on mobile */}
          <span className="hidden sm:inline">•</span>

          {/* GitHub */}
          <a
            href="https://github.com/phrazzld/chrondle"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground inline-flex items-center gap-1 underline-offset-4 transition-colors hover:underline"
            aria-label="View Chrondle source code on GitHub"
            title="View on GitHub"
          >
            <Github className="h-4 w-4" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  );
};
