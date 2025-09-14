// Service Worker registration and management for Chrondle
// Handles background notifications and progressive web app features

import { logger } from "./logger";

export interface ServiceWorkerRegistrationResult {
  success: boolean;
  registration?: ServiceWorkerRegistration;
  error?: Error;
}

/**
 * Register the service worker if supported
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistrationResult> {
  // Only register in production or when explicitly enabled
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return { success: false, error: new Error("Service Worker not supported") };
  }

  // Skip in test environment
  if (process.env.NODE_ENV === "test") {
    return {
      success: false,
      error: new Error("Service Worker disabled in test"),
    };
  }

  try {
    // Register the service worker
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });

    logger.info("✅ Service Worker registered successfully", {
      scope: registration.scope,
      active: registration.active?.state,
      installing: registration.installing?.state,
      waiting: registration.waiting?.state,
    });

    // Handle updates
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener("statechange", () => {
        if (
          newWorker.state === "installed" &&
          navigator.serviceWorker.controller
        ) {
          logger.info("🔄 New Service Worker available, reload to update");
          // Could show a notification to user about update
        }
      });
    });

    return { success: true, registration };
  } catch (error) {
    logger.error("❌ Service Worker registration failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
}

/**
 * Unregister all service workers
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return false;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();

    await Promise.all(
      registrations.map((registration) => registration.unregister()),
    );

    logger.info("✅ Service Worker(s) unregistered successfully");
    return true;
  } catch (error) {
    logger.error("❌ Failed to unregister Service Worker:", error);
    return false;
  }
}

/**
 * Check if a service worker is currently active
 */
export function isServiceWorkerActive(): boolean {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return false;
  }

  return navigator.serviceWorker.controller !== null;
}

/**
 * Get the current service worker registration
 */
export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    return registrations[0] || null;
  } catch {
    return null;
  }
}

/**
 * Send a message to the service worker
 */
export async function sendMessageToServiceWorker(
  message: unknown,
): Promise<unknown> {
  if (!isServiceWorkerActive()) {
    throw new Error("No active service worker");
  }

  return new Promise((resolve, reject) => {
    const messageChannel = new MessageChannel();

    messageChannel.port1.onmessage = (event) => {
      if (event.data && event.data.type === "SW_RESPONSE") {
        resolve(event.data);
      } else {
        reject(new Error("Invalid response from service worker"));
      }
    };

    navigator.serviceWorker.controller?.postMessage(message, [
      messageChannel.port2,
    ]);
  });
}

/**
 * Test if push notifications are supported by the service worker
 */
export async function testPushNotificationSupport(): Promise<boolean> {
  const registration = await getServiceWorkerRegistration();

  if (!registration) {
    return false;
  }

  // Check if push manager is available
  if (!("pushManager" in registration)) {
    return false;
  }

  try {
    // Check current subscription
    const subscription = await registration.pushManager.getSubscription();
    logger.info("Push notification support:", {
      supported: true,
      hasSubscription: subscription !== null,
    });

    return true;
  } catch (error) {
    logger.error("Push notification check failed:", error);
    return false;
  }
}

/**
 * Request push notification permission through service worker
 */
export async function requestPushPermission(): Promise<NotificationPermission> {
  const registration = await getServiceWorkerRegistration();

  if (!registration) {
    return "denied";
  }

  try {
    // First request notification permission
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      return permission;
    }

    // For future: Could subscribe to push notifications here
    // const subscription = await registration.pushManager.subscribe({
    //   userVisibleOnly: true,
    //   applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    // });

    logger.info("✅ Push notification permission granted");
    return permission;
  } catch (error) {
    logger.error("Failed to request push permission:", error);
    return "denied";
  }
}

/**
 * Show a test notification through the service worker
 */
export async function showTestNotification(): Promise<boolean> {
  const registration = await getServiceWorkerRegistration();

  if (!registration || Notification.permission !== "granted") {
    return false;
  }

  try {
    // Use type assertion for service worker specific notification options
    const notificationOptions = {
      body: "Service Worker notifications are working! 🎉",
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: "test-notification",
      requireInteraction: false,
    } as NotificationOptions;

    await registration.showNotification(
      "Chrondle Test Notification",
      notificationOptions,
    );

    logger.info("✅ Test notification shown through Service Worker");
    return true;
  } catch (error) {
    logger.error("Failed to show test notification:", error);
    return false;
  }
}
