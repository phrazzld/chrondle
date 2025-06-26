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
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center font-serif">
            How to Play
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>Guess the year of the historical event in 6 tries. Years can be BC or AD.</p>
          <p>After each guess, you&apos;ll receive two hints:</p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>A directional hint: <span className="font-bold">▲ LATER</span> or <span className="font-bold">▼ EARLIER</span>.</li>
            <li>A new historical event that happened in the <span className="font-bold">same target year</span>.</li>
          </ul>
          <p>Use the clues to narrow down your next guess and find the correct year!</p>
          <div className="text-sm p-3 rounded-lg border-l-4 bg-muted border-info">
            <span className="font-semibold">Daily Puzzle:</span> Everyone gets the same puzzle each day, so you can compare your results with friends!
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            Got it!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};