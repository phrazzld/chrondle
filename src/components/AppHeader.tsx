'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3, HelpCircle, Settings } from 'lucide-react';

interface AppHeaderProps {
  onShowHelp: () => void;
  onShowSettings: () => void;
  onShowStats: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ 
  onShowHelp, 
  onShowSettings,
  onShowStats
}) => {
  return (
    <header className="w-full border-b border-border bg-card py-4">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo/Brand - Responsive sizing */}
          <div className="flex items-center gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-primary m-0">
              <span className="sm:hidden">C</span>
              <span className="hidden sm:inline">CHRONDLE</span>
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <Button
              onClick={onShowStats}
              variant="ghost"
              size="icon"
              title="Stats - View your game statistics"
              aria-label="Show game statistics and achievements"
            >
              <BarChart3 className="h-5 w-5" />
            </Button>
            <Button
              onClick={onShowHelp}
              variant="ghost"
              size="icon"
              title="Help - Learn how to play Chrondle"
              aria-label="Show help and game instructions"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
            <Button
              onClick={onShowSettings}
              variant="ghost"
              size="icon"
              title="Settings - Adjust theme and accessibility options"
              aria-label="Show settings for theme and accessibility"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};