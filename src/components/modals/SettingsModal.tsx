'use client';

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/components/theme-provider';
import { TimePicker } from '@/components/ui/TimePicker';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}


export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const theme = useTheme();
  const { notifications } = theme;
  
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-11/12 sm:max-w-md md:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Settings
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
        {/* Daily Reminders Section */}
        {notifications.isSupported && (
          <div>
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <label className="font-semibold">
                  Daily Reminders
                </label>
                <Switch
                  checked={notifications.isEnabled}
                  onCheckedChange={handleNotificationToggle}
                  disabled={isTogglingNotifications || notifications.isLoading}
                  aria-describedby="daily-reminders-description"
                />
              </div>
              <p id="daily-reminders-description" className="text-sm text-muted-foreground mt-1 ml-0">
                Get a daily notification to maintain your Chrondle streak
              </p>
              
              {/* Permission Status */}
              {notifications.permissionStatus === 'denied' && (
                <div className="mt-2 p-2 rounded text-xs bg-destructive text-destructive-foreground">
                  ⚠️ Notifications blocked. Enable in your browser settings.
                </div>
              )}
              
            </div>

            {/* Reminder Time Picker */}
            {notifications.isEnabled && (
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">
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
      </DialogContent>
    </Dialog>
  );
};