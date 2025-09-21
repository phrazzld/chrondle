"use client";

import { useState } from "react";
import { DonationModal } from "./DonationModal";
import { DonationErrorBoundary } from "./DonationErrorBoundary";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DonationModalWithErrorBoundaryProps {
  trigger?: React.ReactNode;
}

/**
 * Wrapper component that provides error handling for the donation modal
 * Catches both React errors and async Strike API errors
 */
export function DonationModalWithErrorBoundary({ trigger }: DonationModalWithErrorBoundaryProps) {
  const [open, setOpen] = useState(false);

  // Default trigger button if none provided
  const defaultTrigger = (
    <Button onClick={() => setOpen(true)} variant="outline" className="flex items-center gap-2">
      <Heart className="h-4 w-4 text-red-500" />
      Support Chrondle
    </Button>
  );

  return (
    <>
      {trigger ? <div onClick={() => setOpen(true)}>{trigger}</div> : defaultTrigger}

      <DonationErrorBoundary>
        <DonationModal open={open} onOpenChange={setOpen} />
      </DonationErrorBoundary>
    </>
  );
}
