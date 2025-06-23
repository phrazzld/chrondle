'use client';

import React, { useEffect, useState } from 'react';
import { BaseModal } from './BaseModal';
import { formatYear, generateShareText } from '@/lib/utils';
import { useCountdown } from '@/hooks/useCountdown';
import { useClipboard } from '@/hooks/useClipboard';

interface GameOverModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasWon: boolean;
  targetYear: number;
  guesses: number[];
  events: string[];
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  onClose,
  hasWon,
  targetYear,
  guesses,
  events
}) => {
  const { timeString } = useCountdown();
  const { copyToClipboard } = useClipboard();
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Generate share text
  const shareText = generateShareText(guesses, targetYear);

  // Handle share button click
  const handleShare = async () => {
    const success = await copyToClipboard(shareText);
    setFeedbackMessage(success ? 'Copied to clipboard!' : 'Failed to copy!');
  };

  // Clear feedback message after delay
  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => setFeedbackMessage(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div className="text-center">
        <h2 
          className="text-3xl font-bold mb-2 font-[family-name:var(--font-playfair-display)]"
          style={{ color: 'var(--foreground)' }}
        >
          {hasWon ? "You got it!" : "So close!"}
        </h2>
        <p 
          className="text-lg mb-4 font-[family-name:var(--font-inter)]"
          style={{ color: 'var(--foreground)' }}
        >
          The correct year was <strong>{formatYear(targetYear)}</strong>.
        </p>

        <div 
          className="text-left p-4 rounded-lg mb-4 max-h-48 overflow-y-auto"
          style={{ 
            background: 'var(--input)', 
            border: '1px solid var(--border)',
            color: 'var(--foreground)'
          }}
        >
          <h3 className="font-bold mb-2 font-[family-name:var(--font-inter)]">Events from this year:</h3>
          <ul className="list-disc list-inside space-y-1 font-[family-name:var(--font-inter)]">
            {events.map((event, index) => (
              <li key={index} className="text-sm">{event}</li>
            ))}
          </ul>
        </div>

        <div 
          className="p-3 rounded-lg mb-4"
          style={{ 
            background: 'var(--input)', 
            border: '1px solid var(--border)' 
          }}
        >
          <pre 
            className="font-mono text-center whitespace-pre-wrap text-sm"
            style={{ color: 'var(--foreground)' }}
          >
            {shareText}
          </pre>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 text-center">
            <p 
              className="text-sm font-[family-name:var(--font-inter)]"
              style={{ color: 'var(--muted-foreground)' }}
            >
              NEXT CHRONDLE
            </p>
            <p 
              className="text-2xl font-bold font-mono"
              style={{ color: 'var(--foreground)' }}
            >
              {timeString}
            </p>
          </div>
          <button
            onClick={handleShare}
            className="flex-1 font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 font-[family-name:var(--font-inter)]"
            style={{
              background: 'var(--success)',
              color: 'white'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--success)';
            }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" 
              />
            </svg>
            Share
          </button>
        </div>
        
        <p 
          className="text-sm h-5 mt-2 font-[family-name:var(--font-inter)]"
          style={{ color: 'var(--success)' }}
        >
          {feedbackMessage}
        </p>
      </div>
    </BaseModal>
  );
};