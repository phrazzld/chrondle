"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/SessionThemeProvider";
import { TimePicker } from "@/components/ui/TimePicker";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PermissionStep = "none" | "explanation" | "requesting" | "complete";

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const theme = useTheme();
  const { notifications } = theme;

  const [isTogglingNotifications, setIsTogglingNotifications] = useState(false);
  const [permissionStep, setPermissionStep] = useState<PermissionStep>("none");
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const completionTimeoutRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  const clearCompletionTimeout = () => {
    if (completionTimeoutRef.current !== null) {
      window.clearTimeout(completionTimeoutRef.current);
      completionTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      clearCompletionTimeout();
    };
  }, []);

  useEffect(() => {
    if (permissionStep !== "complete") {
      clearCompletionTimeout();
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (isMountedRef.current) {
        setPermissionStep("none");
      }
      completionTimeoutRef.current = null;
    }, 2000);

    completionTimeoutRef.current = timeoutId;

    return () => {
      clearCompletionTimeout();
    };
  }, [permissionStep]);

  const handleNotificationToggle = async () => {
    // If trying to enable and permission not granted, show explanation first
    if (
      !notifications.isEnabled &&
      notifications.permissionStatus !== "granted"
    ) {
      setPermissionStep("explanation");
      return;
    }

    // Otherwise toggle normally
    setIsTogglingNotifications(true);
    try {
      await notifications.toggleReminders();
    } catch (error) {
      console.error("Failed to toggle notifications:", error);
    } finally {
      if (isMountedRef.current) {
        setIsTogglingNotifications(false);
      }
    }
  };

  const handleRequestPermission = async () => {
    setIsRequestingPermission(true);
    setPermissionStep("requesting");

    try {
      const permission = await notifications.requestPermission();

      if (!isMountedRef.current) {
        return;
      }

      if (permission === "granted") {
        // Permission granted, now enable reminders
        await notifications.toggleReminders();

        if (!isMountedRef.current) {
          return;
        }

        setPermissionStep("complete");
      } else if (permission === "denied") {
        // Permission denied, show appropriate message
        setPermissionStep("none");
      } else {
        // Default/dismissed, just close the flow
        setPermissionStep("none");
      }
    } catch (error) {
      console.error("Failed to request permission:", error);
      if (isMountedRef.current) {
        setPermissionStep("none");
      }
    } finally {
      if (isMountedRef.current) {
        setIsRequestingPermission(false);
      }
    }
  };

  const handleClosePermissionFlow = () => {
    setPermissionStep("none");
  };

  const handleTimeChange = async (time: string) => {
    try {
      await notifications.updateTime(time);
    } catch (error) {
      console.error("Failed to update reminder time:", error);
    }
  };

  // Show permission explanation step
  if (permissionStep === "explanation") {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-11/12 sm:max-w-md md:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enable Daily Reminders</DialogTitle>
            <DialogDescription>
              Stay on top of your Chrondle streak with gentle daily reminders
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📅</span>
                  <div>
                    <p className="font-medium">Never miss a puzzle</p>
                    <p className="text-sm text-muted-foreground">
                      Get a friendly notification at your preferred time
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔥</span>
                  <div>
                    <p className="font-medium">Maintain your streak</p>
                    <p className="text-sm text-muted-foreground">
                      Build consistency with daily puzzle solving
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClosePermissionFlow}>
              Maybe Later
            </Button>
            <Button onClick={() => setPermissionStep("requesting")}>
              Enable Notifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Show permission request step
  if (permissionStep === "requesting") {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-11/12 sm:max-w-md md:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Grant Permission</DialogTitle>
          </DialogHeader>

          <div className="text-center space-y-4 py-6">
            <div className="text-4xl mb-4">🔔</div>
            <p>Click &quot;Allow&quot; when your browser asks for permission</p>
            {isRequestingPermission && (
              <div className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" />
                <span className="text-sm text-muted-foreground">
                  Requesting permission...
                </span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleClosePermissionFlow}
              disabled={isRequestingPermission}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRequestPermission}
              disabled={isRequestingPermission}
            >
              {isRequestingPermission ? "Requesting..." : "Request Permission"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Show success state briefly
  if (permissionStep === "complete") {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-11/12 sm:max-w-md md:max-w-lg max-h-[85vh] overflow-y-auto">
          <div
            className="text-center space-y-4 py-8"
            role="status"
            aria-live="polite"
          >
            <div className="text-5xl mb-4" aria-hidden="true">
              ✅
            </div>
            <DialogTitle>Notifications Enabled!</DialogTitle>
            <p className="text-muted-foreground">
              You&apos;ll receive daily reminders at{" "}
              {notifications.formatTime(notifications.reminderTime)}
            </p>
            <span className="sr-only">
              Success! Daily reminders have been enabled for{" "}
              {notifications.formatTime(notifications.reminderTime)}
            </span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Default notification settings view
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-11/12 sm:max-w-md md:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Notifications
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Daily Reminders Section */}
          {notifications.isSupported && (
            <div>
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <label className="font-semibold">Daily Reminders</label>
                  <Switch
                    checked={notifications.isEnabled}
                    onCheckedChange={handleNotificationToggle}
                    disabled={
                      isTogglingNotifications || notifications.isLoading
                    }
                    aria-describedby="daily-reminders-description"
                  />
                </div>
                <p
                  id="daily-reminders-description"
                  className="text-sm text-muted-foreground mt-1 ml-0"
                >
                  Get a daily notification to maintain your Chrondle streak
                </p>

                {/* Permission Status */}
                {notifications.permissionStatus === "denied" && (
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
                    You&apos;ll receive a notification at{" "}
                    {notifications.formatTime(notifications.reminderTime)} daily
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
