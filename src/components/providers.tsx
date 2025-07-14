"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { SessionThemeProvider } from "@/components/SessionThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Fail fast if environment variables are not configured
if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error(
    "Missing NEXT_PUBLIC_CONVEX_URL environment variable. " +
      "Please set it in your .env.local file.",
  );
}

if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
  throw new Error(
    "Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable. " +
      "Please set it in your .env.local file.",
  );
}

// Initialize Convex client at module level (singleton pattern)
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ClerkProvider
        publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
        dynamic
      >
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <SessionThemeProvider>{children}</SessionThemeProvider>
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </ErrorBoundary>
  );
}
