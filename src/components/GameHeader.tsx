'use client';

import React from 'react';

interface GameHeaderProps {
  className?: string;
}

export const GameHeader: React.FC<GameHeaderProps> = ({ className = '' }) => {
  return (
    <header className={`text-center mb-4 sm:mb-6 ${className}`}>
      <h1 className="text-4xl sm:text-5xl font-bold tracking-wider font-[family-name:var(--font-playfair-display)]">
        Chrondle
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mt-1 font-[family-name:var(--font-inter)]">
        Guess the year of the historical event.
      </p>
    </header>
  );
};