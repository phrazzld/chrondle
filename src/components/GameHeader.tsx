'use client';

import React from 'react';

interface GameHeaderProps {
  className?: string;
}

export const GameHeader: React.FC<GameHeaderProps> = ({ className = '' }) => {
  return (
    <header className={`text-center mb-6 sm:mb-8 ${className}`}>
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold tracking-tight text-foreground">
        Chrondle
      </h1>
      <p className="text-muted-foreground mt-2 text-base sm:text-lg font-body">
        Guess the year of the historical event.
      </p>
    </header>
  );
};