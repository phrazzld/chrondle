"use client";

import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export function AuthButtons() {
  const { isLoaded, isSignedIn } = useUser();

  // Show sign in button even while loading
  if (!isLoaded) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-full opacity-50"
        disabled
        title="Sign in to save progress"
        aria-label="Sign in - loading"
      >
        <LogIn className="h-5 w-5" />
      </Button>
    );
  }

  // User is signed in - show user button
  if (isSignedIn) {
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

  // User is not signed in - show sign in button
  return (
    <SignInButton mode="modal">
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-full"
        title="Sign in to save progress and access archive"
        aria-label="Sign in to your account"
      >
        <LogIn className="h-5 w-5" />
      </Button>
    </SignInButton>
  );
}
