'use client';

import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-11/12 sm:max-w-md md:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            How to Play
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          {/* Game Rules Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Game Rules</h3>
            <div className="space-y-2 text-muted-foreground">
              <p>• You have <span className="font-semibold text-foreground">6 guesses</span> to find the correct year</p>
              <p>• All events shown happened in the <span className="font-semibold text-foreground">same target year</span></p>
              <p>• Years can be BC (negative) or AD (positive)</p>
              <p>• The first hint is visible immediately when you start</p>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">How It Works</h3>
            <div className="space-y-2 text-muted-foreground">
              <p>After each guess, you get:</p>
              <div className="ml-4 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-orange-600 dark:text-orange-400 font-semibold">▲ EARLY</span>
                  <span>if your guess was too early</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">▼ LATE</span>
                  <span>if your guess was too late</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 dark:text-green-400 font-semibold">✓ CORRECT!</span>
                  <span>if you found the right year!</span>
                </div>
              </div>
              <p className="pt-1">Plus, a <span className="font-semibold text-foreground">new historical event</span> is revealed to help guide your next guess.</p>
            </div>
          </div>

          {/* Daily Puzzle Section */}
          <div className="text-sm p-3 rounded-lg border-l-4 bg-muted border-primary/30">
            <div className="flex items-start gap-2">
              <span className="text-primary font-semibold">📅</span>
              <div>
                <span className="font-semibold text-foreground">Daily Puzzle:</span>
                <span className="text-muted-foreground ml-1">Everyone gets the same puzzle each day. Compare your results with friends!</span>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-center">
          <Button onClick={onClose} className="px-8">
            Start Playing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};