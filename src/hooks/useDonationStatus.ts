import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

interface UseDonationStatusProps {
  donationId: Id<"donations"> | null;
  onPaymentConfirmed?: () => void;
  onPaymentFailed?: () => void;
  onPaymentExpired?: () => void;
}

export function useDonationStatus({
  donationId,
  onPaymentConfirmed,
  onPaymentFailed,
  onPaymentExpired,
}: UseDonationStatusProps) {
  const [previousState, setPreviousState] = useState<string | null>(null);

  // Reactive query - automatically updates when donation state changes
  const donation = useQuery(api.donations.getDonation, donationId ? { donationId } : "skip");

  // Track state changes and trigger callbacks
  useEffect(() => {
    if (!donation) return;

    const currentState = donation.state;

    // Only trigger callbacks on state transitions, not initial load
    if (previousState !== null && previousState !== currentState) {
      switch (currentState) {
        case "PAID":
          onPaymentConfirmed?.();
          break;
        case "FAILED":
          onPaymentFailed?.();
          break;
        case "EXPIRED":
          onPaymentExpired?.();
          break;
      }
    }

    setPreviousState(currentState);
  }, [donation, previousState, onPaymentConfirmed, onPaymentFailed, onPaymentExpired]);

  // Check for expiration based on client-side time
  useEffect(() => {
    if (!donation || donation.state !== "CREATED") return;

    const timeUntilExpiry = donation.expiresAt - Date.now();
    if (timeUntilExpiry <= 0) {
      onPaymentExpired?.();
      return;
    }

    // Set timeout for expiration
    const timeout = setTimeout(() => {
      onPaymentExpired?.();
    }, timeUntilExpiry);

    return () => clearTimeout(timeout);
  }, [donation, onPaymentExpired]);

  return {
    donation,
    isLoading: donation === undefined && donationId !== null,
    isPaid: donation?.state === "PAID",
    isPending: donation?.state === "PENDING",
    isFailed: donation?.state === "FAILED",
    isExpired:
      donation?.state === "EXPIRED" ||
      (donation?.expiresAt ? donation.expiresAt < Date.now() : false),
    timeRemaining: donation?.expiresAt ? Math.max(0, donation.expiresAt - Date.now()) : 0,
  };
}
