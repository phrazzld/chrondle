"use client";

import { useEffect } from "react";
import { runMigrationOnInit } from "@/lib/localStorageMigration";

/**
 * Provider component that handles localStorage migration on app initialization
 * This ensures that legacy data from before the Convex migration is cleaned up
 */
export function MigrationProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Run migration only on client-side and only once per session
    runMigrationOnInit();
  }, []); // Empty dependency array ensures this runs only once on mount

  // This provider doesn't render anything extra, just passes children through
  return <>{children}</>;
}
