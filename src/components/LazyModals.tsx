"use client";

import { lazy, Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// Lazy load heavy modal components
export const SettingsModal = lazy(() =>
  import("@/components/modals/SettingsModal").then((m) => ({
    default: m.SettingsModal,
  })),
);

export const AchievementModal = lazy(() =>
  import("@/components/modals/AchievementModal").then((m) => ({
    default: m.AchievementModal,
  })),
);

// Modal wrapper with Suspense boundary
export function LazyModalWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
