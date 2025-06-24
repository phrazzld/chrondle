'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { loadStreakData, recordGamePlayed, type StreakData } from '@/lib/storage';
import { STREAK_CONFIG } from '@/lib/constants';

interface UseStreakReturn {
  streakData: StreakData;
  updateStreak: (hasWon: boolean) => StreakData;
  hasNewAchievement: boolean;
  newAchievement: string | null;
  clearNewAchievement: () => void;
}

export function useStreak(): UseStreakReturn {
  const [streakData, setStreakData] = useState<StreakData>(() => loadStreakData());
  const [hasNewAchievement, setHasNewAchievement] = useState(false);
  const [newAchievement, setNewAchievement] = useState<string | null>(null);

  // Load streak data on mount
  useEffect(() => {
    const data = loadStreakData();
    setStreakData(data);
  }, []);

  const updateStreak = useCallback((hasWon: boolean): StreakData => {
    const oldStreak = streakData.currentStreak;
    const newStreakData = recordGamePlayed(hasWon);
    
    // Check for new achievements if won and streak increased
    if (hasWon && newStreakData.currentStreak > oldStreak) {
      const achievement = STREAK_CONFIG.ACHIEVEMENTS.find(
        a => a.threshold === newStreakData.currentStreak && 
             !newStreakData.achievements.includes(a.name)
      );
      
      if (achievement) {
        // Add achievement to the data
        newStreakData.achievements.push(achievement.name);
        setNewAchievement(`${achievement.emoji} ${achievement.description}`);
        setHasNewAchievement(true);
      }
    }
    
    setStreakData(newStreakData);
    return newStreakData;
  }, [streakData.currentStreak]);

  const clearNewAchievement = useCallback(() => {
    setHasNewAchievement(false);
    setNewAchievement(null);
  }, []);

  return useMemo(() => ({
    streakData,
    updateStreak,
    hasNewAchievement,
    newAchievement,
    clearNewAchievement
  }), [streakData, updateStreak, hasNewAchievement, newAchievement, clearNewAchievement]);
}