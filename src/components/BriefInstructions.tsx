'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';

interface BriefInstructionsProps {
  className?: string;
}

export const BriefInstructions: React.FC<BriefInstructionsProps> = ({ 
  className = '' 
}) => {
  return (
    <Card className={`bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 ${className}`}>
      <div className="p-4">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          How to Play
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Guess the year when all these historical events occurred. Each wrong guess reveals a new event from the target year to help you narrow down your answer.
        </p>
      </div>
    </Card>
  );
};