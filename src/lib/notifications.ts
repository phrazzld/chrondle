// Daily reminder notification system for Chrondle
// Uses Web Notifications API for local scheduled reminders

import { NOTIFICATION_CONFIG } from "./constants";
import { logger } from "./logger";
import {
  loadNotificationSettings,
  saveNotificationSettings,
  updateNotificationPermission,
} from "./storage";

export interface NotificationService {
  requestPermission(): Promise<NotificationPermission>;
  scheduleDaily(time: string): Promise<boolean>;
  cancelDaily(): Promise<boolean>;
  isSupported(): boolean;
  getPermissionStatus(): NotificationPermission;
}

class WebNotificationService implements NotificationService {
  private timeoutId: number | null = null;

  isSupported(): boolean {
    return typeof window !== "undefined" && "Notification" in window;
  }

  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) return "denied";
    return Notification.permission;
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      return "denied";
    }

    try {
      const permission = await Notification.requestPermission();
      updateNotificationPermission(permission);
      return permission;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      updateNotificationPermission("denied");
      return "denied";
    }
  }

  async scheduleDaily(time: string): Promise<boolean> {
    if (!this.isSupported() || this.getPermissionStatus() !== "granted") {
      return false;
    }

    // Cancel existing schedule first
    await this.cancelDaily();

    try {
      // Calculate milliseconds until next occurrence of the target time
      const targetTime = this.getNextNotificationTime(time);
      const now = new Date().getTime();
      const delay = targetTime - now;

      if (delay <= 0) {
        console.warn("Calculated notification delay is non-positive:", delay);
        return false;
      }

      // Schedule the notification
      this.timeoutId = window.setTimeout(() => {
        this.showDailyReminder();
        // Reschedule for tomorrow
        this.scheduleDaily(time);
      }, delay);

      logger.info(
        `📅 Daily reminder scheduled for ${new Date(targetTime).toLocaleString()}`,
      );
      return true;
    } catch (error) {
      console.error("Error scheduling daily notification:", error);
      return false;
    }
  }

  async cancelDaily(): Promise<boolean> {
    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
      logger.info("📅 Daily reminder cancelled");
    }
    return true;
  }

  private getNextNotificationTime(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    const now = new Date();
    const target = new Date();

    target.setHours(hours, minutes, 0, 0);

    // If target time has already passed today, schedule for tomorrow
    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1);
    }

    return target.getTime();
  }

  private showDailyReminder(): void {
    if (!this.isSupported() || this.getPermissionStatus() !== "granted") {
      return;
    }

    // Select a random message
    const messages = NOTIFICATION_CONFIG.MESSAGES;
    const message = messages[Math.floor(Math.random() * messages.length)];

    try {
      const notification = new Notification(
        "Chrondle - Daily History Challenge",
        {
          body: message,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          tag: "chrondle-daily-reminder",
          requireInteraction: false,
          silent: false,
          data: {
            url: window.location.origin,
            timestamp: Date.now(),
          },
        },
      );

      // Auto-close after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);

      // Handle click to focus/open the game
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      logger.info("📅 Daily reminder notification shown:", message);
    } catch (error) {
      console.error("Error showing notification:", error);
    }
  }
}

// Singleton instance
let notificationService: NotificationService | null = null;

export function getNotificationService(): NotificationService {
  if (!notificationService) {
    // Skip creating notification service in test environment to prevent long-running timers
    if (process.env.NODE_ENV === "test") {
      // Return a no-op implementation for tests
      notificationService = {
        requestPermission: async () => "denied" as NotificationPermission,
        scheduleDaily: async () => false,
        cancelDaily: async () => true,
        isSupported: () => false,
        getPermissionStatus: () => "denied" as NotificationPermission,
      };
    } else {
      notificationService = new WebNotificationService();
    }
  }
  return notificationService;
}

// TEST ONLY: Reset singleton for test cleanup
export function __resetNotificationServiceForTesting(): void {
  if (notificationService && "cancelDaily" in notificationService) {
    void notificationService.cancelDaily();
  }
  notificationService = null;
}

// Utility functions for components
export async function enableDailyReminders(
  time: string = NOTIFICATION_CONFIG.DEFAULT_TIME,
): Promise<boolean> {
  const service = getNotificationService();

  if (!service.isSupported()) {
    console.warn("Notifications not supported in this browser");
    return false;
  }

  // Request permission if needed
  const permission = await service.requestPermission();
  if (permission !== "granted") {
    console.warn("Notification permission not granted:", permission);
    return false;
  }

  // Schedule daily reminders
  const scheduled = await service.scheduleDaily(time);
  if (!scheduled) {
    console.error("Failed to schedule daily reminders");
    return false;
  }

  // Update settings
  const settings = loadNotificationSettings();
  settings.enabled = true;
  settings.time = time;
  settings.permission = permission;
  saveNotificationSettings(settings);

  return true;
}

export async function disableDailyReminders(): Promise<void> {
  const service = getNotificationService();
  await service.cancelDaily();

  // Update settings
  const settings = loadNotificationSettings();
  settings.enabled = false;
  saveNotificationSettings(settings);
}

export async function updateReminderTime(time: string): Promise<boolean> {
  const settings = loadNotificationSettings();

  if (!settings.enabled || settings.permission !== "granted") {
    // Just update the time preference, don't schedule
    settings.time = time;
    saveNotificationSettings(settings);
    return true;
  }

  // Reschedule with new time
  const service = getNotificationService();
  const scheduled = await service.scheduleDaily(time);

  if (scheduled) {
    settings.time = time;
    saveNotificationSettings(settings);
  }

  return scheduled;
}

export function isNotificationSupported(): boolean {
  return getNotificationService().isSupported();
}

export function getNotificationPermissionStatus(): NotificationPermission {
  return getNotificationService().getPermissionStatus();
}

// Initialize notifications when settings indicate they should be enabled
export async function initializeNotifications(): Promise<void> {
  if (typeof window === "undefined") return;

  // Skip initialization in test environment
  if (process.env.NODE_ENV === "test") return;

  const settings = loadNotificationSettings();

  if (settings.enabled && settings.permission === "granted") {
    // Verify permission is still granted (user might have changed it in browser settings)
    const currentPermission = getNotificationPermissionStatus();

    if (currentPermission === "granted") {
      const service = getNotificationService();
      await service.scheduleDaily(settings.time);
      logger.info("📅 Daily reminders initialized on app startup");
    } else {
      // Permission was revoked, update our records
      updateNotificationPermission(currentPermission);
      settings.enabled = false;
      saveNotificationSettings(settings);
      logger.info("📅 Notification permission revoked, disabled reminders");
    }
  }
}
