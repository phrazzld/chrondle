"use client";

import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { Heart, Loader2, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/Badge";
import { api } from "convex/_generated/api";
import { PaymentQRCode } from "./PaymentQRCode";
import { useDonationStatus } from "@/hooks/useDonationStatus";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import type { Id } from "convex/_generated/dataModel";

interface DonationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PaymentDetails {
  donationId: Id<"donations">;
  lnInvoice?: string;
  btcAddress?: string;
  expiresAt: number;
  correlationId: string;
}

const PRESET_AMOUNTS = [
  { value: 5, label: "$5" },
  { value: 15, label: "$15" },
  { value: 25, label: "$25" },
] as const;

const MIN_AMOUNT = 1;
const MAX_AMOUNT = 1000;

export function DonationModal({ open, onOpenChange }: DonationModalProps) {
  const [step, setStep] = useState<"select" | "payment" | "success">("select");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [note, setNote] = useState("");
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const createDonation = useMutation(api.donations.createDonation);

  const finalAmount = selectedAmount ?? (customAmount ? parseFloat(customAmount) : null);

  const isCustomAmountValid =
    customAmount === "" ||
    (!Number.isNaN(finalAmount) &&
      finalAmount !== null &&
      finalAmount >= MIN_AMOUNT &&
      finalAmount <= MAX_AMOUNT);

  const canProceed =
    finalAmount !== null &&
    !Number.isNaN(finalAmount) &&
    finalAmount >= MIN_AMOUNT &&
    finalAmount <= MAX_AMOUNT &&
    !isSubmitting;

  const resetState = useCallback(() => {
    setStep("select");
    setSelectedAmount(null);
    setCustomAmount("");
    setNote("");
    setPaymentDetails(null);
    setIsRefreshing(false);
    setIsSubmitting(false);
    setErrorMessage(null);
    setShowSuccessAnimation(false);
  }, []);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        resetState();
      }
      onOpenChange(newOpen);
    },
    [onOpenChange, resetState],
  );

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    const sanitized = value.replace(/[^0-9.]/g, "");
    const parts = sanitized.split(".");

    if (parts.length > 2) {
      return;
    }

    if (parts[1] && parts[1].length > 2) {
      setCustomAmount(`${parts[0]}.${parts[1].slice(0, 2)}`);
    } else {
      setCustomAmount(sanitized);
    }

    setSelectedAmount(null);
  };

  const formatAmount = useCallback((amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }, []);

  const { isPending } = useDonationStatus({
    donationId: paymentDetails?.donationId ?? null,
    onPaymentConfirmed: () => {
      setShowSuccessAnimation(true);

      const duration = 1800;
      const colors = ["#FFD700", "#FFA500", "#FF8C00"];
      const end = Date.now() + duration;

      const renderFrame = () => {
        confetti({
          particleCount: 5,
          startVelocity: 20,
          scalar: 0.9,
          ticks: 60,
          spread: 70,
          origin: { x: 0.2, y: 0.2 },
          colors,
        });
        confetti({
          particleCount: 5,
          startVelocity: 20,
          scalar: 0.9,
          ticks: 60,
          spread: 70,
          origin: { x: 0.8, y: 0.2 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(renderFrame);
        }
      };

      renderFrame();

      setTimeout(() => {
        setStep("success");
        setErrorMessage(null);
      }, 600);
    },
    onPaymentFailed: () => {
      setErrorMessage("Payment failed. Try again.");
      setStep("select");
      setPaymentDetails(null);
    },
    onPaymentExpired: () => {
      setErrorMessage("Payment expired. Refresh for a new invoice.");
    },
  });

  const handleCreateDonation = useCallback(async () => {
    if (!canProceed || finalAmount === null || Number.isNaN(finalAmount)) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await createDonation({
        amount: finalAmount,
        currency: "USD",
        railPreference: "BOTH",
        note: note.trim() || undefined,
      });

      setPaymentDetails({
        donationId: result.donationId,
        lnInvoice: result.lnInvoice,
        btcAddress: result.btcAddress,
        expiresAt: result.expiresAt,
        correlationId: result.correlationId,
      });

      setStep("payment");
    } catch (error) {
      console.error("Failed to create donation:", error);

      if (error instanceof Error) {
        if (error.message.includes("rate limit")) {
          setErrorMessage("Too many requests right now. Try again shortly.");
        } else if (error.message.includes("unavailable")) {
          setErrorMessage("Strike is unavailable. Please try again soon.");
        } else {
          setErrorMessage(error.message || "Unable to create donation. Try again.");
        }
      } else {
        setErrorMessage("Unable to create donation. Try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [canProceed, createDonation, finalAmount, note]);

  const handleRefreshPayment = useCallback(async () => {
    if (!finalAmount) return;

    setIsRefreshing(true);
    setErrorMessage(null);

    try {
      const result = await createDonation({
        amount: finalAmount,
        currency: "USD",
        railPreference: "BOTH",
        note: note.trim() || undefined,
      });

      setPaymentDetails({
        donationId: result.donationId,
        lnInvoice: result.lnInvoice,
        btcAddress: result.btcAddress,
        expiresAt: result.expiresAt,
        correlationId: result.correlationId,
      });
    } catch (error) {
      console.error("Failed to refresh payment:", error);

      if (error instanceof Error) {
        if (error.message.includes("rate limit")) {
          setErrorMessage("Too many requests right now. Try again shortly.");
        } else if (error.message.includes("unavailable")) {
          setErrorMessage("Strike is unavailable. Please try again soon.");
        } else {
          setErrorMessage("Unable to refresh the payment link.");
        }
      } else {
        setErrorMessage("Unable to refresh the payment link.");
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [createDonation, finalAmount, note]);

  const handlePaymentExpired = () => {
    setErrorMessage("Payment expired. Refresh for a new invoice.");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Heart className="h-5 w-5 text-red-500" />
            Support Chrondle
          </DialogTitle>
        </DialogHeader>

        {step === "select" && (
          <div className="space-y-5">
            <section className="space-y-2">
              <p className="text-foreground text-sm font-medium">Pick an amount</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {PRESET_AMOUNTS.map((preset) => (
                  <Button
                    key={preset.value}
                    variant={selectedAmount === preset.value ? "default" : "outline"}
                    className={cn(
                      "h-12 min-w-[96px] flex-1 justify-center px-4 text-sm font-medium",
                      selectedAmount === preset.value && "shadow-md",
                    )}
                    onClick={() => handleAmountSelect(preset.value)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </section>

            <section className="space-y-2">
              <Label htmlFor="custom-amount" className="text-sm font-medium">
                Or enter your own
              </Label>
              <div className="relative">
                <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm">
                  $
                </span>
                <Input
                  id="custom-amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="15"
                  value={customAmount}
                  onChange={(event) => handleCustomAmountChange(event.target.value)}
                  className={cn(
                    "pl-7 text-sm font-medium",
                    customAmount && !isCustomAmountValid && "border-red-500",
                  )}
                  aria-invalid={!isCustomAmountValid}
                />
              </div>
              {!isCustomAmountValid && (
                <p className="text-xs text-red-500">
                  Enter a number between {MIN_AMOUNT} and {MAX_AMOUNT}.
                </p>
              )}
            </section>

            <section className="space-y-2">
              <Label htmlFor="note" className="text-sm font-medium">
                Message (optional)
              </Label>
              <Textarea
                id="note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={2}
                maxLength={200}
                placeholder="Say thanks, share a vibe, anything you like."
              />
              <p className="text-muted-foreground text-right text-xs">{note.length}/200</p>
            </section>

            {errorMessage && (
              <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>{errorMessage}</span>
              </div>
            )}

            <Button
              className="w-full"
              size="lg"
              onClick={handleCreateDonation}
              disabled={!canProceed}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating payment link
                </>
              ) : finalAmount ? (
                <>Continue with {formatAmount(finalAmount)}</>
              ) : (
                <>Continue</>
              )}
            </Button>
          </div>
        )}

        {step === "payment" && paymentDetails && (
          <div className="space-y-5">
            <div className="text-center">
              <Badge variant="secondary" className="px-3 py-1 text-xs tracking-wide uppercase">
                {showSuccessAnimation ? "Paid" : isPending ? "Processing" : "Awaiting payment"}
              </Badge>
              <p className="mt-2 text-3xl font-semibold">
                {finalAmount ? formatAmount(finalAmount) : ""}
              </p>
              <p className="text-muted-foreground text-sm">
                {paymentDetails?.btcAddress ? "Lightning + BTC fallback" : "Lightning"}
              </p>
              {note && <p className="text-muted-foreground mt-3 text-sm italic">“{note}”</p>}
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>{errorMessage}</span>
              </div>
            )}

            {showSuccessAnimation && (
              <div className="flex items-center justify-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Payment detected!</span>
              </div>
            )}

            <PaymentQRCode
              lnInvoice={paymentDetails.lnInvoice}
              btcAddress={paymentDetails.btcAddress}
              expiresAt={paymentDetails.expiresAt}
              onExpired={handlePaymentExpired}
              onRefresh={handleRefreshPayment}
              isRefreshing={isRefreshing}
              className="shadow-sm"
            />

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                className="flex-1"
                variant="outline"
                onClick={handleRefreshPayment}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Refreshing
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    New invoice
                  </>
                )}
              </Button>
              <Button variant="ghost" className="flex-1" onClick={() => setStep("select")}>
                Pick a different amount
              </Button>
            </div>
          </div>
        )}

        {step === "success" && paymentDetails && (
          <div className="space-y-6 py-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-7 w-7 text-green-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Thank you!</h3>
              <p className="text-muted-foreground text-sm">
                {formatAmount(finalAmount ?? 0)} keeps Chrondle healthy and humming.
              </p>
              {note && <p className="text-muted-foreground text-sm italic">“{note}”</p>}
            </div>
            <p className="text-muted-foreground text-xs">
              Receipt code: {paymentDetails.correlationId.slice(-8)}
            </p>
            <Button size="lg" className="w-full" onClick={() => handleOpenChange(false)}>
              Back to the game
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
