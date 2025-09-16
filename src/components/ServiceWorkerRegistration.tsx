"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/serviceWorker";
import { logger } from "@/lib/logger";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Only register in production or when explicitly enabled
    const shouldRegister =
      process.env.NODE_ENV === "production" ||
      process.env.NEXT_PUBLIC_ENABLE_SERVICE_WORKER === "true";

    if (!shouldRegister) {
      logger.info("⏭️ Service Worker registration skipped (development mode)");
      return;
    }

    // Register service worker after page load to not block initial render
    if (
      typeof window === "undefined" ||
      typeof document === "undefined" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    let hasAttemptedRegistration = false;

    const attemptRegistration = async () => {
      if (hasAttemptedRegistration) return;
      hasAttemptedRegistration = true;

      const result = await registerServiceWorker();

      if (result.success) {
        logger.info("🎯 Service Worker ready for notifications");
      } else {
        logger.warn(
          "Service Worker registration failed:",
          result.error?.message,
        );
      }
    };

    const handleLoad = () => {
      void attemptRegistration();
    };

    if (document.readyState === "complete") {
      void attemptRegistration();
      return () => undefined;
    }

    window.addEventListener("load", handleLoad);

    return () => {
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  // This component doesn't render anything
  return null;
}
