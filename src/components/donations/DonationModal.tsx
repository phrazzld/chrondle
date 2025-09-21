"use client";

import { useState, useCallback, useEffect } from "react";
import { useMutation } from "convex/react";
import {
  Heart,
  Coffee,
  Pizza,
  Beer,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/Label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { api } from "convex/_generated/api";
import { PaymentQRCode } from "./PaymentQRCode";
import { PaymentProgress } from "./PaymentProgress";
import { AmountSelector } from "./AmountSelector";
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
  { value: 1, label: "$1", icon: Coffee, description: "Tiny tip", shortcut: "1" },
  { value: 5, label: "$5", icon: Coffee, description: "Buy me a coffee", shortcut: "2" },
  { value: 10, label: "$10", icon: Pizza, description: "Buy me lunch", shortcut: "3" },
  { value: 25, label: "$25", icon: Beer, description: "Buy me dinner", shortcut: "4" },
  { value: 50, label: "$50", icon: Heart, description: "Show extra love", shortcut: "5" },
  { value: 100, label: "$100", icon: Heart, description: "Super generous!", shortcut: "6" },
] as const;

const MIN_AMOUNT = 0.5;
const MAX_AMOUNT = 10000;

export function DonationModal({ open, onOpenChange }: DonationModalProps) {
  const [step, setStep] = useState<"amount" | "payment" | "success">("amount");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"LN" | "BOTH">("LN");
  const [note, setNote] = useState("");
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const createDonation = useMutation(api.donations.createDonation);

  // Real-time donation status tracking
  const { isExpired, isPending, isPaid, timeRemaining } = useDonationStatus({
    donationId: paymentDetails?.donationId || null,
    onPaymentConfirmed: () => {
      setShowSuccessAnimation(true);

      // Trigger confetti animation
      const end = Date.now() + 3000;
      const colors = ["#FFD700", "#FFA500", "#FF8C00"];

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();

      // Delay the step change to show animation
      setTimeout(() => {
        setStep("success");
        setErrorMessage(null);
      }, 1000);
    },
    onPaymentFailed: () => {
      setErrorMessage("Payment failed. Please try again.");
      setStep("amount");
      setPaymentDetails(null);
    },
    onPaymentExpired: () => {
      // Don't reset to amount step automatically, let user refresh
      setErrorMessage("Payment request expired. Click refresh to generate a new one.");
    },
  });

  // Get final amount (preset or custom)
  const finalAmount = selectedAmount || (customAmount ? parseFloat(customAmount) : null);

  // Validate custom amount input
  const parsedCustomAmount = parseFloat(customAmount);
  const isValidCustomAmount =
    customAmount === "" ||
    (!isNaN(parsedCustomAmount) &&
      parsedCustomAmount >= MIN_AMOUNT &&
      parsedCustomAmount <= MAX_AMOUNT);

  // Check if we can proceed to payment
  const canProceed =
    finalAmount && finalAmount >= MIN_AMOUNT && finalAmount <= MAX_AMOUNT && isValidCustomAmount;

  // Reset modal state when closed
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        setStep("amount");
        setSelectedAmount(null);
        setCustomAmount("");
        setPaymentMethod("LN");
        setNote("");
        setPaymentDetails(null);
        setIsRefreshing(false);
        setShowSuccessAnimation(false);
      }
      onOpenChange(newOpen);
    },
    [onOpenChange],
  );

  // Handle amount selection
  const handleAmountSelect = useCallback((amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount(""); // Clear custom amount when preset is selected
  }, []);

  // Handle custom amount input with formatting
  const handleCustomAmountChange = useCallback((value: string) => {
    // Allow decimal point and numbers only
    const sanitized = value.replace(/[^0-9.]/g, "");

    // Prevent multiple decimal points
    const parts = sanitized.split(".");
    if (parts.length > 2) return;

    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
      setCustomAmount(`${parts[0]}.${parts[1].slice(0, 2)}`);
    } else {
      setCustomAmount(sanitized);
    }

    setSelectedAmount(null); // Clear preset when custom is entered
  }, []);

  // Format amount for display
  const formatAmount = useCallback((amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }, []);

  // Handle keyboard shortcuts for quick selection
  useEffect(() => {
    if (step !== "amount" || !open) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key;
      const preset = PRESET_AMOUNTS.find((p) => p.shortcut === key);
      if (preset) {
        e.preventDefault();
        handleAmountSelect(preset.value);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [step, open, handleAmountSelect]);

  // Create donation and advance to payment step with retry logic
  const handleCreateDonation = useCallback(async () => {
    if (!canProceed) return;

    setErrorMessage(null);

    // Exponential backoff for retries
    const attemptDonation = async (attemptNumber = 0): Promise<void> => {
      try {
        const result = await createDonation({
          amount: finalAmount,
          currency: "USD",
          railPreference: paymentMethod,
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
        setErrorMessage(null);
        setRetryCount(0); // Reset retry count on success
      } catch (error) {
        console.error(`Failed to create donation (attempt ${attemptNumber + 1}):`, error);

        // Check if we should retry
        if (attemptNumber < MAX_RETRIES - 1) {
          // Check if error is retryable
          if (
            error instanceof Error &&
            (error.message.includes("rate limit") ||
              error.message.includes("unavailable") ||
              error.message.includes("network"))
          ) {
            // Wait with exponential backoff
            const delay = Math.min(1000 * Math.pow(2, attemptNumber), 5000);
            await new Promise((resolve) => setTimeout(resolve, delay));
            setRetryCount(attemptNumber + 1);
            return attemptDonation(attemptNumber + 1);
          }
        }

        // Show user-friendly error message after all retries
        if (error instanceof Error) {
          if (error.message.includes("rate limit")) {
            setErrorMessage("Too many requests. Please wait a moment and try again.");
          } else if (error.message.includes("unavailable")) {
            setErrorMessage("Payment service temporarily unavailable. Please try again later.");
          } else {
            setErrorMessage("Failed to create donation. Please try again.");
          }
        } else {
          setErrorMessage("An unexpected error occurred. Please try again.");
        }

        // Re-throw for error boundary to catch if it's a critical error
        if (
          attemptNumber >= MAX_RETRIES - 1 &&
          error instanceof Error &&
          !error.message.includes("rate limit")
        ) {
          throw error;
        }
      }
    };

    await attemptDonation();
  }, [canProceed, finalAmount, paymentMethod, note, createDonation]);

  // Handle payment expiration or refresh
  const handlePaymentExpired = useCallback(() => {
    // Show error message but stay on payment screen
    // Let user click refresh to generate new payment
    setErrorMessage("Payment request expired. Click refresh to generate a new one.");
  }, []);

  // Refresh payment details
  const handleRefreshPayment = useCallback(async () => {
    if (!finalAmount) return;

    setIsRefreshing(true);
    setErrorMessage(null);
    try {
      const result = await createDonation({
        amount: finalAmount,
        currency: "USD",
        railPreference: paymentMethod,
        note: note.trim() || undefined,
      });

      setPaymentDetails({
        donationId: result.donationId,
        lnInvoice: result.lnInvoice,
        btcAddress: result.btcAddress,
        expiresAt: result.expiresAt,
        correlationId: result.correlationId,
      });

      // Clear any previous errors
      setErrorMessage(null);
    } catch (error) {
      console.error("Failed to refresh payment:", error);

      // Show user-friendly error message
      if (error instanceof Error) {
        if (error.message.includes("rate limit")) {
          setErrorMessage("Too many requests. Please wait a moment and try again.");
        } else if (error.message.includes("unavailable")) {
          setErrorMessage("Payment service temporarily unavailable. Please try again later.");
        } else {
          setErrorMessage("Failed to generate payment request. Please try again.");
        }
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [finalAmount, paymentMethod, note, createDonation]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Support Chrondle
          </DialogTitle>
          <DialogDescription>
            {step === "amount" && "Choose an amount to support the development of Chrondle"}
            {step === "payment" && "Scan the QR code with your Bitcoin wallet"}
            {step === "success" && "Thank you for your support!"}
          </DialogDescription>
        </DialogHeader>

        {/* Payment progress indicator */}
        <PaymentProgress currentStep={step} isPending={isPending} className="mb-4 px-2" />

        {step === "amount" && (
          <div className="space-y-6">
            {/* Preset amounts */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Quick amounts</Label>
                <span className="text-muted-foreground text-xs">Press 1-6 for quick selection</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_AMOUNTS.map((preset) => {
                  const Icon = preset.icon;
                  return (
                    <Button
                      key={preset.value}
                      variant={selectedAmount === preset.value ? "default" : "outline"}
                      onClick={() => handleAmountSelect(preset.value)}
                      className="group relative flex h-auto flex-col items-center gap-1 p-3 transition-all hover:scale-105"
                    >
                      {/* Keyboard shortcut badge */}
                      <span className="bg-muted absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded text-[10px] font-semibold opacity-50 group-hover:opacity-100">
                        {preset.shortcut}
                      </span>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="font-bold">{preset.label}</span>
                      </div>
                      <span className="text-muted-foreground text-xs">{preset.description}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Custom amount */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="custom-amount">Custom amount</Label>
                <span className="text-muted-foreground text-xs">
                  Min: ${MIN_AMOUNT} • Max: {formatAmount(MAX_AMOUNT)}
                </span>
              </div>
              <div className="relative">
                <DollarSign className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                <Input
                  id="custom-amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  className={cn(
                    "pl-10 font-mono",
                    !isValidCustomAmount && customAmount !== "" && "border-red-500",
                    selectedAmount === null && customAmount !== "" && "ring-primary ring-2",
                  )}
                  aria-invalid={!isValidCustomAmount && customAmount !== ""}
                  aria-describedby="amount-error"
                />
              </div>
              {!isValidCustomAmount && customAmount !== "" && (
                <p id="amount-error" className="text-sm text-red-500">
                  {parsedCustomAmount < MIN_AMOUNT
                    ? `Minimum amount is $${MIN_AMOUNT}`
                    : parsedCustomAmount > MAX_AMOUNT
                      ? `Maximum amount is ${formatAmount(MAX_AMOUNT)}`
                      : "Please enter a valid amount"}
                </p>
              )}
            </div>

            {/* Payment method */}
            <div className="space-y-3">
              <Label>Payment method</Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value as "LN" | "BOTH")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="LN" id="lightning" />
                  <Label htmlFor="lightning" className="flex items-center gap-2">
                    <span className="text-yellow-500">⚡</span>
                    Lightning Network (recommended)
                    <Badge variant="secondary" className="text-xs">
                      Fast & cheap
                    </Badge>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="BOTH" id="both" />
                  <Label htmlFor="both" className="flex items-center gap-2">
                    <span className="text-orange-500">₿</span>
                    Lightning + On-chain backup
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Popular amounts section */}
            <AmountSelector onSelectAmount={handleAmountSelect} selectedAmount={selectedAmount} />

            {/* Optional note */}
            <div className="space-y-2">
              <Label htmlFor="note">Message (optional)</Label>
              <Textarea
                id="note"
                placeholder="Leave a nice message..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                maxLength={200}
              />
              <div className="text-muted-foreground text-right text-xs">{note.length}/200</div>
            </div>

            {/* Error message */}
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>{errorMessage}</p>
              </div>
            )}

            {/* Retry indicator */}
            {retryCount > 0 && (
              <div className="text-muted-foreground text-center text-xs">
                Retrying... (Attempt {retryCount + 1}/{MAX_RETRIES})
              </div>
            )}

            {/* Proceed button */}
            <Button
              onClick={handleCreateDonation}
              disabled={!canProceed || retryCount > 0}
              className="w-full"
              size="lg"
            >
              {retryCount > 0
                ? "Processing..."
                : finalAmount
                  ? `Donate ${formatAmount(finalAmount)}`
                  : "Choose an amount"}
            </Button>
          </div>
        )}

        {step === "payment" && paymentDetails && (
          <div className="space-y-4">
            {/* Error message */}
            {errorMessage && !isExpired && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>{errorMessage}</p>
              </div>
            )}

            {/* Payment status indicator */}
            {isPending && (
              <div className="flex items-center justify-center gap-2 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing payment...</span>
              </div>
            )}

            {showSuccessAnimation && (
              <div className="flex items-center justify-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Payment confirmed! Redirecting...</span>
              </div>
            )}

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2 text-center">
                  <div className="text-3xl font-bold">{formatAmount(finalAmount || 0)}</div>
                  <div className="text-muted-foreground text-sm">
                    Via {paymentMethod === "LN" ? "Lightning Network" : "Lightning + On-chain"}
                  </div>
                  {note && (
                    <div className="text-muted-foreground border-muted mt-3 border-l-2 pl-3 text-sm italic">
                      &ldquo;{note}&rdquo;
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Only show QR code if not processing/confirmed */}
            {!isPending && !showSuccessAnimation && (
              <PaymentQRCode
                lnInvoice={paymentDetails.lnInvoice}
                btcAddress={paymentDetails.btcAddress}
                expiresAt={paymentDetails.expiresAt}
                onExpired={handlePaymentExpired}
                onRefresh={handleRefreshPayment}
                isRefreshing={isRefreshing}
              />
            )}

            <Button variant="outline" onClick={() => setStep("amount")} className="w-full">
              Change Amount
            </Button>
          </div>
        )}

        {step === "success" && (
          <div className="space-y-6 py-4 text-center">
            <div className="flex justify-center">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
                style={{
                  animation: "scale-in 0.5s ease-out",
                }}
              >
                <CheckCircle
                  className="h-8 w-8 text-green-600"
                  style={{
                    animation: "pulse 2s ease-in-out infinite",
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Payment Received!</h3>
              <p className="text-muted-foreground">
                Thank you for supporting Chrondle with {formatAmount(finalAmount || 0)}
              </p>
              {note && (
                <div className="text-muted-foreground mt-3 border-l-2 border-green-200 pl-3 text-sm italic">
                  &ldquo;{note}&rdquo;
                </div>
              )}
            </div>

            <div className="space-y-2 rounded-lg bg-green-50 p-4">
              <p className="text-sm text-green-800">
                🎉 Your support helps keep Chrondle free and ad-free for everyone!
              </p>
              <p className="text-xs text-green-600">
                Transaction ID: {paymentDetails?.correlationId.slice(-8)}
              </p>
            </div>

            <Button onClick={() => handleOpenChange(false)} className="w-full" size="lg">
              Continue Playing
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
