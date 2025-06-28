'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { getStreakColorClasses } from '@/lib/utils';

interface AppHeaderProps {
  onShowSettings: () => void;
  currentStreak?: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onShowSettings,
  currentStreak
}) => {
  const streakColors = currentStreak ? getStreakColorClasses(currentStreak) : null;
  return (
    <header className="w-full border-b border-border bg-card py-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo/Brand - Responsive sizing */}
          <div className="flex items-center gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-primary m-0">
              <span className="sm:hidden">C</span>
              <span className="hidden sm:inline">CHRONDLE</span>
            </h1>
            {currentStreak !== undefined && currentStreak > 0 && streakColors && (
              <div
                className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors duration-300 ${streakColors.backgroundColor}`}
                title={streakColors.milestone || `${currentStreak} day streak`}
                aria-label={`Current streak: ${currentStreak} day${currentStreak === 1 ? '' : 's'}`}
              >
                <span className={`text-sm font-medium ${streakColors.textColor} opacity-80`}>
                  Streak
                </span>
                <span className={`text-sm font-bold ${streakColors.textColor}`}>
                  {currentStreak}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
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
