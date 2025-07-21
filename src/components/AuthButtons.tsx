"use client";

import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

export function AuthButtons() {
  const { isLoaded, isSignedIn } = useUser();

  // Always show the same structure initially to prevent hydration mismatch
  // The button will be disabled and slightly transparent while loading
  const isLoading = !isLoaded;

  // User is signed in - show user button
  if (isLoaded && isSignedIn) {
    return (
      <div className="flex items-center justify-center w-10 h-10">
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "w-8 h-8",
              userButtonPopoverCard: "shadow-lg",
              userButtonTrigger:
                "focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full",
            },
          }}
        />
      </div>
    );
  }

  // Show sign in button (disabled while loading to prevent hydration mismatch)
  return (
    <SignInButton mode="modal">
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-10 w-10 rounded-full", isLoading && "opacity-50")}
        disabled={isLoading}
        title={
          isLoading
            ? "Loading..."
            : "Sign in to save progress and access archive"
        }
        aria-label={isLoading ? "Sign in - loading" : "Sign in to your account"}
      >
        <LogIn className="h-5 w-5" />
      </Button>
    </SignInButton>
  );
}
