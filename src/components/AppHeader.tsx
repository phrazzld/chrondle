'use client';

import React from 'react';

interface AppHeaderProps {
  onShowHelp: () => void;
  onShowSettings: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ 
  onShowHelp, 
  onShowSettings 
}) => {
  return (
    <header className="w-full border-b header-responsive" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <div className="max-w-6xl mx-auto px-6 header-content">
        <div className="flex items-center justify-between">
          {/* Logo/Brand - Responsive sizing */}
          <div className="flex items-center">
            <h1 className="font-bold m-0 header-logo" style={{ color: 'var(--primary)' }}>
              <span className="logo-icon">C</span>
              <span className="logo-wordmark">HRONDLE</span>
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button 
              onClick={onShowHelp}
              className="icon-btn touch-optimized"
              style={{ color: 'var(--muted-foreground)' }}
              title="Help - Learn how to play Chrondle"
              aria-label="Show help and game instructions"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button 
              onClick={onShowSettings}
              className="icon-btn touch-optimized"
              style={{ color: 'var(--muted-foreground)' }}
              title="Settings - Adjust theme and accessibility options"
              aria-label="Show settings for theme and accessibility"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};