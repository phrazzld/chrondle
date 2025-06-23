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
    <BaseModal isOpen={isOpen} onClose={onClose} className="max-w-5xl max-h-[90vh] overflow-y-auto">
      <div className="space-y-8">
        
        {/* Header Row */}
        <div className="text-center">
          <h2 
            className="text-3xl font-bold mb-3"
            style={{ color: 'var(--foreground)' }}
          >
            {hasWon ? "You got it!" : "So close!"}
          </h2>
          <p 
            className="text-lg"
            style={{ color: 'var(--foreground)' }}
          >
            The correct year was <strong>{formatYear(targetYear)}</strong>.
          </p>
        </div>

        {/* Content Row - Events & Share */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Events Section */}
          <div className="space-y-3">
            <h3 
              className="text-lg font-semibold"
              style={{ color: 'var(--foreground)' }}
            >
              Events from this year:
            </h3>
            <div 
              className="p-4 rounded-lg"
              style={{ 
                background: 'var(--input)', 
                border: '1px solid var(--border)'
              }}
            >
              <ul className="space-y-2">
                {events.map((event, index) => (
                  <li 
                    key={index} 
                    className="flex items-start gap-2 text-sm leading-relaxed"
                    style={{ color: 'var(--foreground)' }}
                  >
                    <span 
                      className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                      style={{ background: 'var(--primary)' }}
                    />
                    {event}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Share Section */}
          <div className="space-y-3">
            <h3 
              className="text-lg font-semibold"
              style={{ color: 'var(--foreground)' }}
            >
              Share Your Results
            </h3>
            
            {/* Share Preview */}
            <div 
              className="p-4 rounded-lg"
              style={{ 
                background: 'var(--input)', 
                border: '1px solid var(--border)' 
              }}
            >
              <pre 
                className="font-mono whitespace-pre-wrap text-sm leading-relaxed"
                style={{ color: 'var(--foreground)' }}
              >
                {shareText}
              </pre>
            </div>
          </div>
        </div>

        {/* Action Row - Full Width */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Next Game Countdown */}
          <div 
            className="p-4 rounded-lg text-center"
            style={{ 
              background: 'var(--surface)', 
              border: '1px solid var(--border)' 
            }}
          >
            <p 
              className="text-sm font-medium mb-1"
              style={{ color: 'var(--muted-foreground)' }}
            >
              NEXT CHRONDLE
            </p>
            <p 
              className="text-xl font-bold font-mono"
              style={{ color: 'var(--primary)' }}
            >
              {timeString}
            </p>
          </div>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 hover:shadow-lg"
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
            Copy to Clipboard
          </button>
        </div>
        
        {/* Feedback Message */}
        {feedbackMessage && (
          <p 
            className="text-sm text-center font-medium"
            style={{ color: 'var(--success)' }}
          >
            {feedbackMessage}
          </p>
        )}
      </div>
    </BaseModal>
  );
};