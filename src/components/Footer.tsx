"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-background border-border w-full border-t py-4">
      <div className="mx-auto max-w-2xl px-6 sm:px-0">
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-muted-foreground hover:text-foreground h-auto gap-2 py-2"
          >
            <a
              href="https://github.com/phrazzld/chrondle"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View Chrondle source code on GitHub"
              title="View on GitHub"
            >
              <Github className="h-4 w-4" />
              <span className="hidden text-sm sm:inline">View on GitHub</span>
            </a>
          </Button>
        </div>
      </div>
    </footer>
  );
};
