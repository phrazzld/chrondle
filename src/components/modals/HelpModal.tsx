'use client';

import React from 'react';
import { BaseModal } from './BaseModal';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-2xl font-bold mb-4 text-center font-[family-name:var(--font-playfair-display)]">
        How to Play
      </h2>
      <div className="space-y-4 text-gray-600 dark:text-gray-300 font-[family-name:var(--font-inter)]">
        <p>Guess the year of the historical event in 6 tries. Years can be BC or AD.</p>
        <p>After each guess, you&apos;ll receive two hints:</p>
        <ul className="list-disc list-inside space-y-2 pl-2">
          <li>A directional hint: <span className="font-bold">▲ LATER</span> or <span className="font-bold">▼ EARLIER</span>.</li>
          <li>A new historical event that happened in the <span className="font-bold">same target year</span>.</li>
        </ul>
        <p>Use the clues to narrow down your next guess and find the correct year!</p>
        <p className="text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border-l-4 border-blue-400">
          <span className="font-semibold">Daily Puzzle:</span> Everyone gets the same puzzle each day, so you can compare your results with friends!
        </p>
      </div>
      <button 
        onClick={onClose}
        className="mt-6 w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition"
      >
        Got it!
      </button>
    </BaseModal>
  );
};