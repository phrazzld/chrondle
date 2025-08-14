"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";

interface UserCreationContextType {
  userCreated: boolean;
  userCreationLoading: boolean;
  userCreationError: string | null;
  currentUser: Doc<"users"> | null | undefined; // User from Convex query
  isUserReady: boolean; // True when user exists and creation is complete
}

const UserCreationContext = createContext<UserCreationContextType | undefined>(
  undefined,
);

export function useUserCreation() {
  const context = useContext(UserCreationContext);
  if (context === undefined) {
    throw new Error(
      "useUserCreation must be used within a UserCreationProvider",
    );
  }
  return context;
}

interface UserCreationProviderProps {
  children: ReactNode;
}

export function UserCreationProvider({ children }: UserCreationProviderProps) {
  const { isSignedIn } = useAuth();

  // Get current user for existence check
  const currentUser = useQuery(api.users.getCurrentUser);

  // JIT user creation mutation
  const getOrCreateUser = useMutation(api.users.getOrCreateCurrentUser);

  // Track user creation status
  const [userCreated, setUserCreated] = useState(false);
  const [userCreationLoading, setUserCreationLoading] = useState(false);
  const [userCreationError, setUserCreationError] = useState<string | null>(
    null,
  );

  // JIT user creation effect - trigger when signed in but no user exists
  useEffect(() => {
    async function ensureUserExists() {
      if (
        isSignedIn &&
        !currentUser &&
        !userCreated &&
        !userCreationLoading &&
        currentUser !== undefined // Ensure query has completed (not still loading)
      ) {
        // Debug: Triggering JIT user creation

        try {
          setUserCreationLoading(true);
          setUserCreationError(null);

          await getOrCreateUser();

          setUserCreated(true);
          // console.log("[UserCreationProvider] User creation completed successfully");
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          console.error("[UserCreationProvider] User creation failed:", {
            error: errorMessage,
            timestamp: new Date().toISOString(),
          });

          setUserCreationError(errorMessage);
          // Don't block the app if user creation fails - graceful degradation
        } finally {
          setUserCreationLoading(false);
        }
      }
    }

    ensureUserExists();
  }, [
    isSignedIn,
    currentUser,
    userCreated,
    userCreationLoading,
    getOrCreateUser,
  ]);

  // Reset user creation status when signing out
  useEffect(() => {
    if (!isSignedIn) {
      setUserCreated(false);
      setUserCreationLoading(false);
      setUserCreationError(null);
    }
  }, [isSignedIn]);

  // Determine if user is ready for operations
  const isUserReady = Boolean(
    isSignedIn && currentUser && !userCreationLoading,
  );

  const contextValue: UserCreationContextType = {
    userCreated,
    userCreationLoading,
    userCreationError,
    currentUser,
    isUserReady,
  };

  return (
    <UserCreationContext.Provider value={contextValue}>
      {children}
    </UserCreationContext.Provider>
  );
}
