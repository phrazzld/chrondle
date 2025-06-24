'use client';

import React from 'react';
import { BaseModal } from './BaseModal';
import { useTheme } from '@/components/theme-provider';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ToggleProps {
  enabled: boolean;
  onChange: () => void;
  label: string;
}

const Toggle: React.FC<ToggleProps> = ({ enabled, onChange, label }) => {
  return (
    <div className="flex items-center justify-between">
      <label 
        className="font-semibold font-[family-name:var(--font-inter)]"
        style={{ color: 'var(--foreground)' }}
      >
        {label}
      </label>
      <button
        onClick={onChange}
        className="toggle-switch touch-optimized"
        style={{
          background: enabled ? 'var(--primary)' : 'var(--border)'
        }}
        aria-checked={enabled}
        role="switch"
        aria-describedby={`${label.toLowerCase().replace(/\s+/g, '-')}-description`}
      >
        <span
          className={`
            inline-block w-4 h-4 transform rounded-full transition-transform
            ${enabled ? 'translate-x-5' : 'translate-x-1'}
          `}
          style={{ background: 'var(--surface)' }}
        />
      </button>
    </div>
  );
};

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { darkMode, colorBlindMode, toggleDarkMode, toggleColorBlindMode } = useTheme();

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-[family-name:var(--font-playfair-display)]">Settings</h2>
        <button 
          onClick={onClose}
          className="modal-close-btn touch-optimized"
          style={{ color: 'var(--muted-foreground)' }}
          title="Close settings dialog"
          aria-label="Close settings dialog"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="space-y-6">
        <div>
          <Toggle
            enabled={darkMode}
            onChange={toggleDarkMode}
            label="Dark Mode"
          />
          <p id="dark-mode-description" className="text-sm text-muted-foreground mt-1 ml-0">
            Switch between light and dark themes for comfortable viewing
          </p>
        </div>
        <div>
          <Toggle
            enabled={colorBlindMode}
            onChange={toggleColorBlindMode}
            label="Color-Blind Mode"
          />
          <p id="color-blind-mode-description" className="text-sm text-muted-foreground mt-1 ml-0">
            Enhanced color contrast for improved accessibility
          </p>
        </div>
      </div>
    </BaseModal>
  );
};