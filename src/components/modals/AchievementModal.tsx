'use client';

import React, { useEffect } from 'react';
import { BaseModal } from './BaseModal';
import { Celebration } from '@/components/ui/Celebration';

interface AchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievement: string;
}

export const AchievementModal: React.FC<AchievementModalProps> = ({
  isOpen,
  onClose,
  achievement
}) => {
  // Auto-close after 4 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  // Trigger celebration when modal opens
  useEffect(() => {
    if (isOpen) {
      window.dispatchEvent(new CustomEvent('chrondle:celebrate'));
    }
  }, [isOpen]);

  return (
    <>
      <Celebration />
      <BaseModal isOpen={isOpen} onClose={onClose} className="max-w-md">
        <div className="text-center space-y-6 p-4">
          <div className="text-6xl animate-bounce mb-4">
            🏆
          </div>
          <h2 
            className="text-2xl font-bold mb-2"
            style={{ color: 'var(--foreground)' }}
          >
            Achievement Unlocked!
          </h2>
          <p 
            className="text-lg font-medium mb-6"
            style={{ color: 'var(--primary)' }}
          >
            {achievement}
          </p>
          <button
            onClick={onClose}
            className="btn-primary px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
            autoFocus
          >
            Awesome! 🎉
          </button>
        </div>
      </BaseModal>
    </>
  );
};