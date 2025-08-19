"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../convex/_generated/api";
import { useMutationWithRetry } from "@/hooks/useMutationWithRetry";

interface AuthState {
  hasClerkUser: boolean;
  hasConvexUser: boolean;
  completedCount: number;
  totalCount: number;
  environment: string;
  timestamp: string;
}

interface UserCreationHandlerProps {
  authState: AuthState;
  children: React.ReactNode;
}

/**
 * Client-side component that handles JIT user creation for server components
 * Detects when user is signed in via Clerk but has no Convex user record
 * and triggers user creation with appropriate loading state
 */
export function UserCreationHandler({
  authState,
  children,
}: UserCreationHandlerProps) {
  const { isSignedIn } = useUser();
  const getOrCreateUser = useMutationWithRetry(
    api.users.getOrCreateCurrentUser,
    {
      maxRetries: 3,
      baseDelayMs: 1000,
      onRetry: (attempt, error) => {
        console.error(
          `[UserCreationHandler] Retrying user creation (attempt ${attempt}/3):`,
          error.message,
        );
      },
    },
  );

  const [userCreationLoading, setUserCreationLoading] = useState(false);
  const [userCreationCompleted, setUserCreationCompleted] = useState(false);
  const [shouldRefresh, setShouldRefresh] = useState(false);

  // Detect if user creation is needed
  const needsUserCreation =
    isSignedIn &&
    authState.hasClerkUser &&
    !authState.hasConvexUser &&
    !userCreationCompleted;

  useEffect(() => {
    async function handleUserCreation() {
      if (needsUserCreation && !userCreationLoading) {
        // Debug: Triggering JIT user creation

        try {
          setUserCreationLoading(true);
          await getOrCreateUser({});

          // console.log("[UserCreationHandler] User creation completed successfully");
          setUserCreationCompleted(true);

          // Trigger page refresh to get updated completion data
          setShouldRefresh(true);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          console.error("[UserCreationHandler] User creation failed:", {
            error: errorMessage,
            timestamp: new Date().toISOString(),
          });
          // Don't block the UI if user creation fails
        } finally {
          setUserCreationLoading(false);
        }
      }
    }

    handleUserCreation();
  }, [
    needsUserCreation,
    userCreationLoading,
    userCreationCompleted,
    getOrCreateUser,
    authState.hasClerkUser,
    authState.hasConvexUser,
    isSignedIn,
  ]);

  // Handle page refresh after successful user creation
  useEffect(() => {
    if (shouldRefresh && !userCreationLoading) {
      // console.log("[UserCreationHandler] Refreshing page to show updated completion data");
      // Small delay to ensure mutation is fully processed
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  }, [shouldRefresh, userCreationLoading]);

  // Show loading state during user creation
  if (userCreationLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-pulse text-muted-foreground mb-2">
              Setting up your account...
            </div>
            <div className="text-sm text-muted-foreground">
              This will only take a moment
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal rendering
  return <>{children}</>;
}
