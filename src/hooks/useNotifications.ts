// React hook for managing daily reminder notifications in Chrondle

import { useState, useEffect, useCallback } from 'react';
import { 
  enableDailyReminders, 
  disableDailyReminders, 
  updateReminderTime,
  isNotificationSupported,
  getNotificationPermissionStatus,
  initializeNotifications
} from '@/lib/notifications';
import { 
  loadNotificationSettings, 
  saveNotificationSettings, 
  shouldShowPermissionReminder,
  NotificationSettings 
} from '@/lib/storage';
import { NOTIFICATION_CONFIG } from '@/lib/constants';

export interface UseNotificationsReturn {
  // State
  settings: NotificationSettings;
  isSupported: boolean;
  isEnabled: boolean;
  reminderTime: string;
  permissionStatus: NotificationPermission;
  isLoading: boolean;
  
  // Actions
  toggleReminders: () => Promise<boolean>;
  updateTime: (time: string) => Promise<boolean>;
  requestPermission: () => Promise<NotificationPermission>;
  
  // Helpers
  shouldShowPermissionPrompt: boolean;
  availableTimes: Array<{ label: string; value: string }>;
  formatTime: (time: string) => string;
}

export function useNotifications(): UseNotificationsReturn {
  const [settings, setSettings] = useState<NotificationSettings>(() => 
    loadNotificationSettings()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported] = useState(() => isNotificationSupported());

  // Load settings on mount and sync with current browser permission
  useEffect(() => {
    const syncSettings = async () => {
      const currentSettings = loadNotificationSettings();
      const browserPermission = getNotificationPermissionStatus();
      
      // Update our settings if browser permission has changed
      if (currentSettings.permission !== browserPermission) {
        currentSettings.permission = browserPermission;
        
        // If permission was revoked, disable reminders
        if (browserPermission !== 'granted' && currentSettings.enabled) {
          currentSettings.enabled = false;
          await disableDailyReminders();
        }
        
        saveNotificationSettings(currentSettings);
      }
      
      setSettings(currentSettings);
      
      // Initialize notifications if they should be enabled
      if (currentSettings.enabled && browserPermission === 'granted') {
        await initializeNotifications();
      }
    };

    syncSettings();
  }, []);

  const toggleReminders = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      if (settings.enabled) {
        // Disable reminders
        await disableDailyReminders();
        const newSettings = { ...settings, enabled: false };
        setSettings(newSettings);
        return true;
      } else {
        // Enable reminders
        const success = await enableDailyReminders(settings.time);
        if (success) {
          const newSettings = loadNotificationSettings(); // Reload to get updated permission
          setSettings(newSettings);
        }
        return success;
      }
    } catch (error) {
      console.error('Error toggling reminders:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [settings]);

  const updateTime = useCallback(async (time: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const success = await updateReminderTime(time);
      if (success) {
        const newSettings = { ...settings, time };
        setSettings(newSettings);
        saveNotificationSettings(newSettings);
      }
      return success;
    } catch (error) {
      console.error('Error updating reminder time:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [settings]);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) return 'denied';
    
    setIsLoading(true);
    
    try {
      // Use the notification service to request permission
      await enableDailyReminders(settings.time);
      const newSettings = loadNotificationSettings(); // Reload to get updated permission
      setSettings(newSettings);
      return newSettings.permission as NotificationPermission;
    } catch (error) {
      console.error('Error requesting permission:', error);
      return 'denied';
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, settings.time]);

  const shouldShowPermissionPrompt = isSupported && 
    settings.permission === 'default' && 
    shouldShowPermissionReminder();

  const formatTime = useCallback((time: string): string => {
    const timeOption = NOTIFICATION_CONFIG.TIME_OPTIONS.find(option => option.value === time);
    return timeOption?.label || time;
  }, []);

  return {
    // State
    settings,
    isSupported,
    isEnabled: settings.enabled,
    reminderTime: settings.time,
    permissionStatus: settings.permission as NotificationPermission,
    isLoading,
    
    // Actions
    toggleReminders,
    updateTime,
    requestPermission,
    
    // Helpers
    shouldShowPermissionPrompt,
    availableTimes: [...NOTIFICATION_CONFIG.TIME_OPTIONS],
    formatTime
  };
}