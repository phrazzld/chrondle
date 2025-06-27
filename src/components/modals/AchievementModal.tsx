'use client';

import React, { useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-11/12 sm:max-w-md md:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Achievement Unlocked</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-6 p-4">
            <div className="text-6xl animate-bounce mb-4">
              🏆
            </div>
            <h2 className="text-2xl font-bold mb-2 text-foreground">
              Achievement Unlocked!
            </h2>
            <p className="text-lg font-medium mb-6 text-primary">
              {achievement}
            </p>
            <Button
              onClick={onClose}
              className="px-6 py-3 font-medium transition-all duration-200 hover:scale-105"
              autoFocus
            >
              Awesome! 🎉
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};