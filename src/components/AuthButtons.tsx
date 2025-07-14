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
        size="sm"
        className="gap-2 h-8 opacity-50"
        disabled
      >
        <LogIn className="h-4 w-4" />
        <span>Sign In</span>
      </Button>
    );
  }

  // User is signed in - show user button
  if (isSignedIn) {
    return (
      <UserButton
        afterSignOutUrl="/"
        appearance={{
          elements: {
            avatarBox: "w-8 h-8",
            userButtonPopoverCard: "shadow-lg",
          },
        }}
      />
    );
  }

  // User is not signed in - show sign in button
  return (
    <SignInButton mode="modal">
      <Button variant="ghost" size="sm" className="gap-2 h-8">
        <LogIn className="h-4 w-4" />
        <span className="hidden sm:inline">Sign In</span>
        <span className="sm:hidden">Sign In</span>
      </Button>
    </SignInButton>
  );
}
