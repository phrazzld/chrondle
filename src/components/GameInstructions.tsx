'use client';

import React from 'react';

interface GameInstructionsProps {
  className?: string;
}

export const GameInstructions: React.FC<GameInstructionsProps> = ({
  className = ''
}) => {
  return (
    <div className={`text-left mb-6 ${className}`}>
      <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
        Guess the Year
      </h2>
      <p className="text-lg text-muted-foreground leading-7">
        All of these events happened in the same year. Can you guess the year?
      </p>
    </div>
  );
};
