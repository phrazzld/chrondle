"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-4 bg-background border-t border-border">
      <div className="max-w-2xl mx-auto px-6 sm:px-0">
        <div className="flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-muted-foreground hover:text-foreground gap-2 h-auto py-2"
          >
            <a
              href="https://github.com/phrazzld/chrondle"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View Chrondle source code on GitHub"
              title="View on GitHub"
            >
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">View on GitHub</span>
            </a>
          </Button>
        </div>
      </div>
    </footer>
  );
};
