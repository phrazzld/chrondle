"use client";

import React from "react";

interface GameHeaderProps {
  className?: string;
}

export const GameHeader: React.FC<GameHeaderProps> = ({ className = "" }) => {
  return (
    <header className={`mb-6 text-center sm:mb-8 ${className}`}>
      <h1 className="font-heading text-foreground text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
        Chrondle
      </h1>
      <p className="text-muted-foreground font-body mt-2 text-base sm:text-lg">
        Daily history puzzle
      </p>
    </header>
  );
};
