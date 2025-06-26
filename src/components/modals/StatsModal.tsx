'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { StreakData } from '@/lib/storage';
import { STREAK_CONFIG } from '@/lib/constants';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakData: StreakData;
}

interface GameInsights {
  recentActivity: number; // Days played in last 7
  nextAchievement: { name: string; emoji: string; threshold: number } | null;
  progressToNext: number; // 0-1 progress to next achievement
  daysActive: number; // Total days with games played
}

function calculate7DayStickiness(playedDates: string[]): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let daysPlayed = 0;
  
  // Check each of the last 7 days
  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateString = checkDate.toISOString().slice(0, 10);
    
    if (playedDates.includes(dateString)) {
      daysPlayed++;
    }
  }
  
  return daysPlayed;
}

function findNextAchievement(currentStreak: number) {
  return STREAK_CONFIG.ACHIEVEMENTS.find(
    achievement => achievement.threshold > currentStreak
  ) || null;
}

function deriveInsights(streakData: StreakData): GameInsights {
  const recentActivity = calculate7DayStickiness(streakData.playedDates);
  const nextAchievement = findNextAchievement(streakData.currentStreak);
  const progressToNext = nextAchievement 
    ? Math.min(streakData.currentStreak / nextAchievement.threshold, 1.0)
    : 1.0;
  const daysActive = streakData.playedDates.length;

  return {
    recentActivity,
    nextAchievement,
    progressToNext,
    daysActive
  };
}

interface StatCardProps {
  value: string | number;
  label: string;
  emoji?: string;
  isHighlight?: boolean;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  value, 
  label, 
  emoji, 
  isHighlight = false,
  className = '' 
}) => {
  const [hasAnimated, setHasAnimated] = useState(false);
  
  useEffect(() => {
    if (isHighlight && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [isHighlight, hasAnimated]);

  return (
    <div 
      className={`flex flex-col items-center p-4 rounded-lg border bg-card text-card-foreground shadow-sm ${isHighlight ? 'border-primary bg-primary/5' : ''} ${className}`}
      style={{
        transform: isHighlight && !hasAnimated ? 'scale(1.02)' : 'scale(1)',
        transition: 'transform 0.3s ease-out'
      }}
    >
      {emoji && (
        <div className="text-2xl mb-2" aria-hidden="true">
          {emoji}
        </div>
      )}
      <div className="text-2xl font-bold text-foreground">
        {value}
      </div>
      <div className="text-sm text-muted-foreground text-center">
        {label}
      </div>
    </div>
  );
};

export const StatsModal: React.FC<StatsModalProps> = ({ 
  isOpen, 
  onClose, 
  streakData 
}) => {
  const insights = useMemo(() => deriveInsights(streakData), [streakData]);
  
  // Check if current streak is a new personal best for highlight animation
  const isNewBest = streakData.currentStreak > 0 && 
                   streakData.currentStreak === streakData.longestStreak;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-serif">
            Your Statistics
          </DialogTitle>
        </DialogHeader>
        
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Current Streak */}
        <StatCard
          value={streakData.currentStreak}
          label="Current Streak"
          emoji="🔥"
          isHighlight={isNewBest}
        />
        
        {/* Best Streak */}
        <StatCard
          value={streakData.longestStreak}
          label="Best Streak"
          emoji="🏆"
        />
        
        {/* Recent Activity */}
        <StatCard
          value={`${insights.recentActivity}/7`}
          label="Recent Days"
          emoji="📊"
        />
        
        {/* Total Games */}
        <StatCard
          value={streakData.totalGamesPlayed}
          label="Total Games"
          emoji="🎯"
        />
        
        {/* Days Active */}
        <StatCard
          value={insights.daysActive}
          label="Days Played"
          emoji="📅"
        />
        
        {/* Next Achievement */}
        {insights.nextAchievement && (
          <StatCard
            value={`${streakData.currentStreak}/${insights.nextAchievement.threshold}`}
            label={insights.nextAchievement.name}
            emoji={insights.nextAchievement.emoji}
          />
        )}
      </div>

        {/* Achievement Progress Bar */}
        {insights.nextAchievement && insights.progressToNext < 1 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-foreground">
                Progress to {insights.nextAchievement.name}
              </span>
              <span className="text-sm text-muted-foreground">
                {streakData.currentStreak} / {insights.nextAchievement.threshold}
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2 border">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${insights.progressToNext * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Recent Achievements */}
        {streakData.achievements.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3 text-foreground">
              Achievements Unlocked
            </h3>
            <div className="space-y-3">
              {streakData.achievements.map((achievementName, index) => {
                const achievement = STREAK_CONFIG.ACHIEVEMENTS.find(a => a.name === achievementName);
                return achievement ? (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                    <span className="text-lg" aria-hidden="true">
                      {achievement.emoji}
                    </span>
                    <div className="flex-1">
                      <span className="font-medium text-foreground">
                        {achievement.name}
                      </span>
                      <div className="text-sm text-muted-foreground">
                        {achievement.description}
                      </div>
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}
        
        {/* Motivational Message */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {insights.recentActivity >= 5 
              ? "🌟 Great consistency! Keep up the momentum!"
              : insights.recentActivity >= 3
              ? "💪 You're building a strong habit!"
              : streakData.currentStreak > 0
              ? "🚀 Every day counts - keep your streak alive!"
              : "🎯 Start your journey through history today!"
            }
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};