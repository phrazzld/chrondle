"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Github, Bitcoin } from "lucide-react";
import BitcoinModal from "@/components/BitcoinModal";

export const Footer: React.FC = () => {
  const [showBitcoin, setShowBitcoin] = useState(false);

  return (
    <footer className="w-full py-4 bg-background border-t border-border">
      <div className="max-w-2xl mx-auto px-6 sm:px-0">
        <div className="flex items-center justify-center gap-2">
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

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowBitcoin(true)}
            className="text-muted-foreground hover:text-foreground gap-2 h-auto py-2 cursor-pointer hover:scale-105 transition-transform"
            aria-label="Support Chrondle with Bitcoin tips"
            title="Tip jar"
          >
            <Bitcoin className="h-4 w-4" />
            <span className="hidden sm:inline text-sm">Tip jar</span>
          </Button>
        </div>
      </div>

      <BitcoinModal open={showBitcoin} onOpenChange={setShowBitcoin} />
    </footer>
  );
};
