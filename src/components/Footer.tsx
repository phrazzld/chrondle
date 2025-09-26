"use client";

import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-background border-border w-full border-t py-4">
      <div className="mx-auto max-w-2xl px-6 sm:px-0">
        <div className="text-muted-foreground flex items-center justify-center text-sm">
          <a
            href="https://github.com/phrazzld/chrondle"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
            aria-label="View Chrondle source code on GitHub"
          >
            GitHub
          </a>
          <span className="mx-2">·</span>
          <a
            href="mailto:phaedrus.raznikov@pm.me"
            className="hover:text-foreground transition-colors"
            aria-label="Send feedback about Chrondle"
          >
            Feedback
          </a>
          <span className="mx-2">·</span>
          <span>© 2025 Chrondle</span>
        </div>
      </div>
    </footer>
  );
};
