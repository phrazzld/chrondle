'use client';

import React, { useState } from 'react';
import { BaseModal } from './BaseModal';
import { useTheme } from '@/components/theme-provider';
import { getThemeModeDisplayName, getThemeModeIcon, type ThemeMode } from '@/lib/enhancedTheme';

// Type guard for enhanced theme context
interface EnhancedThemeContext {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  smoothTransitions: boolean;
  toggleSmoothTransitions: () => void;
}

function hasEnhancedThemeFeatures(theme: unknown): theme is EnhancedThemeContext {
  return typeof theme === 'object' && theme !== null && 'themeMode' in theme;
}
import { TimePicker } from '@/components/ui/TimePicker';

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

interface ThemeSelectorProps {
  currentMode: ThemeMode;
  onModeChange: (mode: ThemeMode) => void;
  label: string;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentMode, onModeChange, label }) => {
  const modes: ThemeMode[] = ['light', 'dark', 'system'];

  return (
    <div className="space-y-3">
      <label 
        className="font-semibold font-[family-name:var(--font-inter)] block"
        style={{ color: 'var(--foreground)' }}
      >
        {label}
      </label>
      <div className="grid grid-cols-3 gap-2">
        {modes.map((mode) => (
          <button
            key={mode}
            onClick={() => onModeChange(mode)}
            className={`
              flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all
              touch-optimized
              ${currentMode === mode 
                ? 'border-primary bg-primary/10' 
                : 'border-border hover:border-primary/50'
              }
            `}
            aria-pressed={currentMode === mode}
            style={{
              background: currentMode === mode 
                ? 'var(--primary-light)20' 
                : 'var(--surface)',
              borderColor: currentMode === mode 
                ? 'var(--primary)' 
                : 'var(--border)'
            }}
          >
            <span className="text-lg mb-1" role="img" aria-hidden="true">
              {getThemeModeIcon(mode)}
            </span>
            <span 
              className="text-xs font-medium capitalize"
              style={{ color: 'var(--foreground)' }}
            >
              {getThemeModeDisplayName(mode)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const theme = useTheme();
  const { darkMode, colorBlindMode, toggleDarkMode, toggleColorBlindMode, notifications } = theme;
  
  // Enhanced theme features (optional)
  const enhancedTheme = hasEnhancedThemeFeatures(theme) ? theme : null;
  const themeMode = enhancedTheme?.themeMode ?? (darkMode ? 'dark' : 'light');
  const setThemeMode = enhancedTheme?.setThemeMode;
  const smoothTransitions = enhancedTheme?.smoothTransitions ?? true;
  const toggleSmoothTransitions = enhancedTheme?.toggleSmoothTransitions;
  const hasEnhancedTheme = enhancedTheme !== null;
  
  const [isTogglingNotifications, setIsTogglingNotifications] = useState(false);

  const handleNotificationToggle = async () => {
    setIsTogglingNotifications(true);
    try {
      await notifications.toggleReminders();
    } catch (error) {
      console.error('Failed to toggle notifications:', error);
    } finally {
      setIsTogglingNotifications(false);
    }
  };

  const handleTimeChange = async (time: string) => {
    try {
      await notifications.updateTime(time);
    } catch (error) {
      console.error('Failed to update reminder time:', error);
    }
  };

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
        {/* Theme Settings */}
        <div>
          {hasEnhancedTheme && setThemeMode ? (
            <div>
              <ThemeSelector
                currentMode={themeMode as ThemeMode}
                onModeChange={setThemeMode}
                label="Theme"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Choose your preferred theme or follow your system setting
              </p>
            </div>
          ) : (
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
          )}
        </div>

        {/* Smooth Transitions (Enhanced Theme Only) */}
        {hasEnhancedTheme && toggleSmoothTransitions && (
          <div>
            <Toggle
              enabled={smoothTransitions}
              onChange={toggleSmoothTransitions}
              label="Smooth Transitions"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Add smooth animations when switching between themes
            </p>
          </div>
        )}
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

        {/* Daily Reminders Section */}
        {notifications.isSupported && (
          <div className="border-t pt-6" style={{ borderColor: 'var(--border)' }}>
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <label 
                  className="font-semibold font-[family-name:var(--font-inter)]"
                  style={{ color: 'var(--foreground)' }}
                >
                  Daily Reminders
                </label>
                <button
                  onClick={handleNotificationToggle}
                  disabled={isTogglingNotifications || notifications.isLoading}
                  className="toggle-switch touch-optimized"
                  style={{
                    background: notifications.isEnabled ? 'var(--primary)' : 'var(--border)',
                    opacity: isTogglingNotifications || notifications.isLoading ? 0.6 : 1,
                    cursor: isTogglingNotifications || notifications.isLoading ? 'wait' : 'pointer'
                  }}
                  aria-checked={notifications.isEnabled}
                  role="switch"
                  aria-describedby="daily-reminders-description"
                >
                  <span
                    className={`
                      inline-block w-4 h-4 transform rounded-full transition-transform
                      ${notifications.isEnabled ? 'translate-x-5' : 'translate-x-1'}
                    `}
                    style={{ background: 'var(--surface)' }}
                  />
                </button>
              </div>
              <p id="daily-reminders-description" className="text-sm text-muted-foreground mt-1 ml-0">
                Get a daily notification to maintain your Chrondle streak
              </p>
              
              {/* Permission Status */}
              {notifications.permissionStatus === 'denied' && (
                <div 
                  className="mt-2 p-2 rounded text-xs"
                  style={{ 
                    background: 'var(--status-error)', 
                    color: 'white' 
                  }}
                >
                  ⚠️ Notifications blocked. Enable in your browser settings.
                </div>
              )}
              
              {notifications.permissionStatus === 'default' && notifications.shouldShowPermissionPrompt && (
                <div 
                  className="mt-2 p-2 rounded text-xs"
                  style={{ 
                    background: 'var(--status-info)', 
                    color: 'white' 
                  }}
                >
                  📱 Click the toggle to enable daily reminders!
                </div>
              )}
            </div>

            {/* Reminder Time Picker */}
            {notifications.isEnabled && (
              <div className="mt-4">
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--foreground)' }}
                >
                  Reminder Time
                </label>
                <TimePicker
                  value={notifications.reminderTime}
                  onChange={handleTimeChange}
                  options={notifications.availableTimes}
                  disabled={notifications.isLoading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  You&apos;ll receive a notification at {notifications.formatTime(notifications.reminderTime)} daily
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </BaseModal>
  );
};