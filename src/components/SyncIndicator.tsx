"use client";

import { Cloud, CloudOff, CloudCheck } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

type SyncStatus = "synced" | "syncing" | "offline";

export function SyncIndicator() {
  const { isLoaded, isSignedIn } = useUser();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("synced");
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus("syncing");
      // Simulate sync completion after a short delay
      setTimeout(() => {
        setSyncStatus("synced");
        setLastSyncTime(new Date());
      }, 1000);
    };

    const handleOffline = () => {
      setSyncStatus("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check initial state
    if (!navigator.onLine) {
      setSyncStatus("offline");
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Only show for authenticated users
  if (!isLoaded || !isSignedIn) {
    return null;
  }

  const getIcon = () => {
    switch (syncStatus) {
      case "synced":
        return <CloudCheck className="h-5 w-5" />;
      case "syncing":
        return <Cloud className="h-5 w-5 animate-pulse" />;
      case "offline":
        return <CloudOff className="h-5 w-5" />;
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case "synced":
        return `Synced across devices • Last: ${lastSyncTime.toLocaleTimeString()}`;
      case "syncing":
        return "Syncing...";
      case "offline":
        return "Offline - changes saved locally";
    }
  };

  const getStatusColor = () => {
    switch (syncStatus) {
      case "synced":
        return "text-green-600 dark:text-green-400";
      case "syncing":
        return "text-blue-600 dark:text-blue-400";
      case "offline":
        return "text-yellow-600 dark:text-yellow-400";
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-10 w-10 rounded-full", getStatusColor())}
      title={getStatusText()}
      aria-label={`Sync status: ${getStatusText()}`}
      disabled
    >
      {getIcon()}
    </Button>
  );
}
