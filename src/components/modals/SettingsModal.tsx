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
        className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors"
        style={{
          background: enabled ? 'var(--primary)' : 'var(--border)'
        }}
      >
        <span
          className={`
            inline-block w-4 h-4 transform rounded-full transition-transform
            ${enabled ? 'translate-x-6' : 'translate-x-1'}
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
          className="transition text-2xl leading-none hover:opacity-70"
          style={{ color: 'var(--muted-foreground)' }}
          aria-label="Close settings"
        >
          &times;
        </button>
      </div>
      
      <div className="space-y-4">
        <Toggle
          enabled={darkMode}
          onChange={toggleDarkMode}
          label="Dark Mode"
        />
        <Toggle
          enabled={colorBlindMode}
          onChange={toggleColorBlindMode}
          label="Color-Blind Mode"
        />
      </div>
    </BaseModal>
  );
};