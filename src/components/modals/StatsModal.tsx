'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { BaseModal } from './BaseModal';
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
      className={`stat-card ${isHighlight ? 'stat-highlight' : ''} ${className}`}
      style={{
        transform: isHighlight && !hasAnimated ? 'scale(1.02)' : 'scale(1)',
        transition: 'transform 0.3s ease-out'
      }}
    >
      <div className="stat-content">
        {emoji && (
          <div className="stat-emoji" aria-hidden="true">
            {emoji}
          </div>
        )}
        <div className="stat-value">
          {value}
        </div>
        <div className="stat-label">
          {label}
        </div>
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
    <BaseModal isOpen={isOpen} onClose={onClose} className="max-w-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 
          className="text-2xl font-bold font-[family-name:var(--font-playfair-display)]"
          style={{ color: 'var(--foreground)' }}
        >
          Your Statistics
        </h2>
        <button 
          onClick={onClose}
          className="modal-close-btn touch-optimized"
          style={{ color: 'var(--muted-foreground)' }}
          title="Close statistics dialog"
          aria-label="Close statistics dialog"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Main Stats Grid */}
      <div className="stats-grid">
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
            <span 
              className="text-sm font-medium"
              style={{ color: 'var(--foreground)' }}
            >
              Progress to {insights.nextAchievement.name}
            </span>
            <span 
              className="text-sm"
              style={{ color: 'var(--muted-foreground)' }}
            >
              {streakData.currentStreak} / {insights.nextAchievement.threshold}
            </span>
          </div>
          <div 
            className="progress-bar-track"
            style={{ 
              background: 'var(--input)',
              border: '1px solid var(--border)'
            }}
          >
            <div 
              className="progress-bar-fill"
              style={{ 
                width: `${insights.progressToNext * 100}%`,
                background: 'var(--primary)'
              }}
            />
          </div>
        </div>
      )}

      {/* Recent Achievements */}
      {streakData.achievements.length > 0 && (
        <div className="mt-6">
          <h3 
            className="text-lg font-semibold mb-3"
            style={{ color: 'var(--foreground)' }}
          >
            Achievements Unlocked
          </h3>
          <div className="achievements-list">
            {streakData.achievements.map((achievementName, index) => {
              const achievement = STREAK_CONFIG.ACHIEVEMENTS.find(a => a.name === achievementName);
              return achievement ? (
                <div key={index} className="achievement-item">
                  <span className="achievement-emoji" aria-hidden="true">
                    {achievement.emoji}
                  </span>
                  <span 
                    className="achievement-name"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {achievement.name}
                  </span>
                  <span 
                    className="achievement-desc"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    {achievement.description}
                  </span>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}
      
      {/* Motivational Message */}
      <div className="mt-6 text-center">
        <p 
          className="text-sm"
          style={{ color: 'var(--muted-foreground)' }}
        >
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
    </BaseModal>
  );
};