"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { AuthButtons } from "@/components/AuthButtons";
import { DonationModalWithErrorBoundary } from "@/components/donations/DonationModalWithErrorBoundary";
import { Bell, Flame, Archive, Heart } from "lucide-react";
import { getStreakColorClasses, cn } from "@/lib/utils";
import { formatPuzzleNumber } from "@/lib/puzzleUtils";
import { useTheme } from "@/components/SessionThemeProvider";
import type { UseNotificationsReturn } from "@/hooks/useNotifications";

interface AppHeaderProps {
  onShowSettings?: () => void;
  currentStreak?: number;
  isDebugMode?: boolean;
  puzzleNumber?: number;
  isArchive?: boolean;
}

// Helper function to get notification status classes
function getNotificationStatusClasses(notifications: UseNotificationsReturn | undefined) {
  if (!notifications?.isSupported) {
    return ""; // No indicator if not supported
  }

  if (notifications.permissionStatus === "denied") {
    return "bg-status-error"; // Red - denied
  }

  if (notifications.permissionStatus === "default") {
    return "bg-status-warning animate-pulse"; // Orange pulsing - pending
  }

  if (notifications.isEnabled) {
    return "bg-feedback-correct"; // Green - enabled
  }

  return "bg-muted-foreground opacity-75"; // Gray - disabled
}

// Helper function to get notification status title
function getNotificationStatusTitle(notifications: UseNotificationsReturn | undefined) {
  if (!notifications?.isSupported) {
    return "Notifications not supported in this browser";
  }

  if (notifications.permissionStatus === "denied") {
    return "Notifications blocked - enable in browser settings";
  }

  if (notifications.permissionStatus === "default") {
    return "Notification permission pending";
  }

  if (notifications.isEnabled) {
    return "Notifications enabled";
  }

  return "Notifications disabled";
}

// Helper function to get comprehensive ARIA label
function getNotificationAriaLabel(notifications: UseNotificationsReturn | undefined) {
  if (!notifications?.isSupported) {
    return "Open notification settings. Notifications are not supported in this browser";
  }

  if (notifications.permissionStatus === "denied") {
    return "Open notification settings. Notifications are currently blocked. Enable them in your browser settings";
  }

  if (notifications.permissionStatus === "default") {
    return "Open notification settings. Click to enable daily reminders. Permission not yet granted";
  }

  if (notifications.isEnabled) {
    return "Open notification settings. Daily reminders are enabled";
  }

  return "Open notification settings. Daily reminders are disabled. Click to enable";
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onShowSettings,
  currentStreak,
  isDebugMode = false,
  puzzleNumber,
  isArchive = false,
}) => {
  const theme = useTheme();
  const { notifications } = theme;
  const streakColors = currentStreak ? getStreakColorClasses(currentStreak) : null;
  return (
    <header className="border-border bg-card w-full border-b py-4">
      <div className="mx-auto max-w-2xl px-6 sm:px-0">
        <div className="flex min-h-[40px] items-center justify-between">
          {/* Logo/Brand - Clean and uncluttered */}
          <Link href="/" className="flex h-10 items-baseline">
            <h1 className="font-heading text-primary m-0 flex cursor-pointer items-baseline text-2xl font-bold transition-opacity hover:opacity-80 md:text-3xl">
              <span className="flex h-10 w-10 items-center justify-center sm:hidden">C</span>
              <span className="hidden sm:inline">CHRONDLE</span>
              {puzzleNumber && (
                <span
                  className={cn(
                    "ml-2 font-mono text-xs",
                    isArchive ? "text-muted-foreground italic" : "text-foreground/70",
                  )}
                >
                  {formatPuzzleNumber(puzzleNumber)}
                </span>
              )}
              {isDebugMode && (
                <span
                  className="mb-1 ml-2 h-2 w-2 rounded-full bg-orange-600 opacity-75"
                  title="Debug mode active"
                  aria-label="Debug mode indicator"
                />
              )}
            </h1>
          </Link>

          {/* Action Buttons with Streak Counter */}
          <div className="flex h-10 items-center gap-3">
            {/* Streak Counter - Horizontal Badge */}
            {currentStreak !== undefined && currentStreak > 0 && streakColors && (
              <div
                className={`flex items-center gap-2 rounded-full border px-3 py-2 ${streakColors.borderColor} h-10 shadow-sm`}
                title={streakColors.milestone || `${currentStreak} day streak`}
                aria-label={`Current streak: ${currentStreak} day streak`}
              >
                <Flame className={`h-4 w-4 ${streakColors.textColor}`} />
                <span
                  className={`font-accent text-sm font-bold ${streakColors.textColor} whitespace-nowrap`}
                >
                  <span className="hidden sm:inline">{currentStreak} day streak</span>
                  <span className="sm:hidden">{currentStreak}</span>
                </span>
              </div>
            )}

            {/* Archive Button */}
            <Button
              variant="ghost"
              size="icon"
              asChild
              title="Browse puzzle archive"
              aria-label="Browse puzzle archive"
              className="h-10 w-10 rounded-full"
            >
              <Link href="/archive">
                <Archive className="h-5 w-5" />
              </Link>
            </Button>

            {/* Donation Button */}
            <DonationModalWithErrorBoundary
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  title="Support Chrondle with donations"
                  aria-label="Support Chrondle with donations"
                  className="h-10 w-10 rounded-full transition-transform hover:scale-105"
                >
                  <Heart className="h-5 w-5 text-red-500" />
                </Button>
              }
            />

            {/* Theme Toggle */}
            <ThemeToggle />

            {onShowSettings && (
              <Button
                onClick={onShowSettings}
                variant="ghost"
                size="icon"
                title={getNotificationStatusTitle(notifications)}
                aria-label={getNotificationAriaLabel(notifications)}
                aria-describedby="notification-status"
                className="relative h-10 w-10 rounded-full"
              >
                <Bell className="h-5 w-5" aria-hidden="true" />
                {notifications?.isSupported && (
                  <span
                    className={cn(
                      "absolute top-1 right-1 h-2 w-2 rounded-full",
                      getNotificationStatusClasses(notifications),
                    )}
                    aria-hidden="true"
                  />
                )}
                <span id="notification-status" className="sr-only">
                  {getNotificationStatusTitle(notifications)}
                </span>
              </Button>
            )}

            {/* Auth Buttons - Rightmost */}
            <AuthButtons />
          </div>
        </div>
      </div>
    </header>
  );
};
