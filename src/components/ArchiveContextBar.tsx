import React from "react";
import Link from "next/link";

export function ArchiveContextBar() {
  return (
    <div className="w-full h-10 border-y border-border bg-card">
      <div className="max-w-2xl mx-auto px-6 sm:px-0 h-full">
        <Link
          href="/archive"
          className="flex items-center justify-center h-full hover:bg-muted/50 transition-colors"
        >
          Today&apos;s Puzzle | Archive (298 puzzles)
        </Link>
      </div>
    </div>
  );
}
