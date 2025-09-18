"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  registerServiceWorker,
  unregisterServiceWorker,
  isServiceWorkerActive,
  getServiceWorkerRegistration,
  testPushNotificationSupport,
  showTestNotification,
  requestPushPermission,
} from "@/lib/serviceWorker";
import {
  enableDailyReminders,
  disableDailyReminders,
  getNotificationPermissionStatus,
} from "@/lib/notifications";
import { Bell, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";

export default function ServiceWorkerTestPage() {
  const [status, setStatus] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [swActive, setSwActive] = useState(isServiceWorkerActive());
  const [permission, setPermission] = useState<
    NotificationPermission | "unknown"
  >("unknown");

  const addStatus = (message: string) => {
    setStatus((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const checkStatus = async () => {
    setIsLoading(true);
    try {
      // Check service worker
      const active = isServiceWorkerActive();
      setSwActive(active);
      addStatus(`Service Worker Active: ${active}`);

      // Check registration
      const registration = await getServiceWorkerRegistration();
      addStatus(`Service Worker Registered: ${registration !== null}`);

      if (registration) {
        addStatus(`  Scope: ${registration.scope}`);
        addStatus(
          `  State: ${registration.active?.state || registration.installing?.state || registration.waiting?.state || "unknown"}`,
        );
      }

      // Check notification permission
      const perm = getNotificationPermissionStatus();
      setPermission(perm);
      addStatus(`Notification Permission: ${perm}`);

      // Check push support
      const pushSupported = await testPushNotificationSupport();
      addStatus(`Push Notifications Supported: ${pushSupported}`);
    } catch (error) {
      addStatus(`Error checking status: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      const result = await registerServiceWorker();
      if (result.success) {
        addStatus("✅ Service Worker registered successfully");
        setSwActive(true);
      } else {
        addStatus(`❌ Registration failed: ${result.error?.message}`);
      }
    } catch (error) {
      addStatus(`❌ Registration error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnregister = async () => {
    setIsLoading(true);
    try {
      const success = await unregisterServiceWorker();
      if (success) {
        addStatus("✅ Service Worker unregistered");
        setSwActive(false);
      } else {
        addStatus("❌ Failed to unregister");
      }
    } catch (error) {
      addStatus(`❌ Unregister error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestPermission = async () => {
    setIsLoading(true);
    try {
      const perm = await requestPushPermission();
      setPermission(perm);
      addStatus(`Permission result: ${perm}`);
    } catch (error) {
      addStatus(`❌ Permission request error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setIsLoading(true);
    try {
      const success = await showTestNotification();
      if (success) {
        addStatus("✅ Test notification sent");
      } else {
        addStatus("❌ Failed to send test notification");
      }
    } catch (error) {
      addStatus(`❌ Notification error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnableDaily = async () => {
    setIsLoading(true);
    try {
      const success = await enableDailyReminders("09:00");
      if (success) {
        addStatus("✅ Daily reminders enabled for 9:00 AM");
      } else {
        addStatus("❌ Failed to enable daily reminders");
      }
    } catch (error) {
      addStatus(`❌ Enable daily error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableDaily = async () => {
    setIsLoading(true);
    try {
      await disableDailyReminders();
      addStatus("✅ Daily reminders disabled");
    } catch (error) {
      addStatus(`❌ Disable daily error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearStatus = () => {
    setStatus([]);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Service Worker & Notification Test
          </CardTitle>
          <CardDescription>
            Test service worker registration and notification functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Display */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {swActive ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span>Service Worker: {swActive ? "Active" : "Inactive"}</span>
            </div>
            <div className="flex items-center gap-2">
              {permission === "granted" ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : permission === "denied" ? (
                <XCircle className="h-5 w-5 text-red-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              <span>Notifications: {permission}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={checkStatus}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Check Status
            </Button>

            <Button
              onClick={handleRegister}
              disabled={isLoading || swActive}
              variant="default"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Register SW
            </Button>

            <Button
              onClick={handleUnregister}
              disabled={isLoading || !swActive}
              variant="destructive"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Unregister SW
            </Button>

            <Button
              onClick={handleRequestPermission}
              disabled={isLoading || permission === "granted"}
              variant="default"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Request Permission
            </Button>

            <Button
              onClick={handleTestNotification}
              disabled={isLoading || !swActive || permission !== "granted"}
              variant="secondary"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Test Notification
            </Button>

            <Button
              onClick={handleEnableDaily}
              disabled={isLoading || permission !== "granted"}
              variant="default"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enable Daily
            </Button>

            <Button
              onClick={handleDisableDaily}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Disable Daily
            </Button>

            <Button
              onClick={clearStatus}
              disabled={isLoading || status.length === 0}
              variant="outline"
            >
              Clear Log
            </Button>
          </div>

          {/* Status Log */}
          <div className="space-y-2">
            <h3 className="font-semibold">Status Log:</h3>
            <div className="bg-muted rounded-lg p-4 max-h-64 overflow-y-auto font-mono text-sm">
              {status.length === 0 ? (
                <p className="text-muted-foreground">
                  No status messages yet...
                </p>
              ) : (
                status.map((msg, idx) => (
                  <div key={idx} className="py-1">
                    {msg}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Test Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Click &quot;Check Status&quot; to see current state</li>
              <li>
                Click &quot;Register SW&quot; to register the service worker
              </li>
              <li>
                Click &quot;Request Permission&quot; to enable notifications
              </li>
              <li>
                Click &quot;Test Notification&quot; to send a test notification
                via SW
              </li>
              <li>
                Test &quot;Enable Daily&quot; and &quot;Disable Daily&quot; for
                scheduled notifications
              </li>
              <li>
                Use &quot;Unregister SW&quot; to clean up when done testing
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
