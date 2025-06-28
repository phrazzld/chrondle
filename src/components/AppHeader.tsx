'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Flame } from 'lucide-react';
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
          {/* Logo/Brand - Clean and uncluttered */}
          <div className="flex items-center">
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-primary m-0">
              <span className="sm:hidden">C</span>
              <span className="hidden sm:inline">CHRONDLE</span>
            </h1>
          </div>

          {/* Action Buttons with Streak Counter */}
          <div className="flex items-center gap-3">
            {/* Streak Counter - Horizontal Badge */}
            {currentStreak !== undefined && currentStreak > 0 && streakColors && (
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-full ${streakColors.backgroundColor} border border-white/20 shadow-sm`}
                title={streakColors.milestone || `${currentStreak} day streak`}
                aria-label={`Current streak: ${currentStreak} day streak`}
              >
                <Flame className={`w-4 h-4 ${streakColors.textColor}`} />
                <span className={`text-sm font-accent font-bold ${streakColors.textColor} whitespace-nowrap`}>
                  {currentStreak} day streak
                </span>
              </div>
            )}
            
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
