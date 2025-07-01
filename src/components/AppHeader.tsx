'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Settings, Flame } from 'lucide-react';
import { getStreakColorClasses } from '@/lib/utils';

interface AppHeaderProps {
  onShowSettings: () => void;
  currentStreak?: number;
  isDebugMode?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onShowSettings,
  currentStreak,
  isDebugMode = false
}) => {
  const streakColors = currentStreak ? getStreakColorClasses(currentStreak) : null;
  return (
    <header className="w-full border-b border-border bg-card py-4">
      <div className="max-w-2xl mx-auto px-6 sm:px-0">
        <div className="flex items-center justify-between min-h-[40px]">
          {/* Logo/Brand - Clean and uncluttered */}
          <div className="flex items-center h-10">
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-primary m-0 flex items-center">
              <span className="sm:hidden flex items-center justify-center w-10 h-10">C</span>
              <span className="hidden sm:inline">CHRONDLE</span>
              {isDebugMode && (
                <span 
                  className="ml-2 w-2 h-2 rounded-full bg-orange-600 opacity-75"
                  title="Debug mode active"
                  aria-label="Debug mode indicator"
                />
              )}
            </h1>
          </div>

          {/* Action Buttons with Streak Counter */}
          <div className="flex items-center gap-3 h-10">
            {/* Streak Counter - Horizontal Badge */}
            {currentStreak !== undefined && currentStreak > 0 && streakColors && (
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-full border ${streakColors.borderColor} shadow-sm h-10`}
                title={streakColors.milestone || `${currentStreak} day streak`}
                aria-label={`Current streak: ${currentStreak} day streak`}
              >
                <Flame className={`w-4 h-4 ${streakColors.textColor}`} />
                <span className={`text-sm font-accent font-bold ${streakColors.textColor} whitespace-nowrap`}>
                  {currentStreak} day streak
                </span>
              </div>
            )}
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            <Button
              onClick={onShowSettings}
              variant="ghost"
              size="icon"
              title="Settings - Adjust theme and accessibility options"
              aria-label="Show settings for theme and accessibility"
              className="h-10 w-10 rounded-full"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
