"use client";

import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { AuthSkeleton } from "@/components/skeletons/AuthSkeleton";
import { isMobileDevice } from "@/lib/platformDetection";
import { useEffect, useState } from "react";

export function AuthButtons() {
  const { isLoaded, isSignedIn } = useUser();
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device after mount to avoid hydration mismatch
  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  // Show skeleton while auth is loading to prevent flash
  if (!isLoaded) {
    return <AuthSkeleton />;
  }

  // User is signed in - show user button
  if (isSignedIn) {
    return (
      <div className="flex h-11 w-11 items-center justify-center sm:h-10 sm:w-10">
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "w-8 h-8",
              userButtonPopoverCard: "shadow-lg",
              userButtonTrigger: "focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full",
            },
          }}
        />
      </div>
    );
  }

  // Show sign in button with conditional mode based on device
  return (
    <SignInButton mode={isMobile ? "redirect" : "modal"}>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        title="Sign in to save progress and access archive"
        aria-label="Sign in to your account"
      >
        <LogIn className="h-5 w-5" />
      </Button>
    </SignInButton>
  );
}
