"use client";

import { useState, useEffect, useCallback } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Copy, Clock, RefreshCw, Wallet, Bitcoin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface PaymentQRCodeProps {
  lnInvoice?: string;
  btcAddress?: string;
  expiresAt: number;
  onExpired: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  className?: string;
}

export function PaymentQRCode({
  lnInvoice,
  btcAddress,
  expiresAt,
  onExpired,
  onRefresh,
  isRefreshing = false,
  className,
}: PaymentQRCodeProps) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [activeTab, setActiveTab] = useState<"lightning" | "onchain">(
    lnInvoice ? "lightning" : "onchain",
  );
  const [copied, setCopied] = useState(false);
  const [isWarning, setIsWarning] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);

  // Countdown timer with warning states
  useEffect(() => {
    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);

      // Set warning states for visual feedback
      setIsWarning(remaining <= 300 && remaining > 60); // 5 minutes to 1 minute
      setIsUrgent(remaining <= 60 && remaining > 0); // Last minute

      if (remaining === 0) {
        onExpired();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpired]);

  // Format time remaining
  const formatTime = useCallback((seconds: number): string => {
    if (seconds <= 0) return "Expired";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Copy to clipboard
  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  }, []);

  // Open in wallet app
  const handleOpenWallet = useCallback((uri: string) => {
    window.open(uri, "_blank");
  }, []);

  if (timeLeft <= 0) {
    return (
      <Card className={cn("mx-auto w-full max-w-md", className)}>
        <CardContent className="py-8 text-center">
          <Clock className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <h3 className="mb-2 text-lg font-semibold">Payment Expired</h3>
          <p className="text-muted-foreground mb-4">
            {isRefreshing
              ? "Generating a new payment request..."
              : "This payment request has expired. Generate a new one to continue."}
          </p>
          <Button onClick={onRefresh} disabled={isRefreshing} className="w-full">
            {isRefreshing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate New Payment
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentPayment = activeTab === "lightning" ? lnInvoice : btcAddress;
  const currentLabel = activeTab === "lightning" ? "Lightning Invoice" : "Bitcoin Address";
  const currentURI =
    activeTab === "lightning" && lnInvoice
      ? `lightning:${lnInvoice}`
      : activeTab === "onchain" && btcAddress
        ? `bitcoin:${btcAddress}`
        : "";

  return (
    <Card className={cn("mx-auto w-full max-w-md", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Scan to Pay</span>
          <Badge
            variant={isUrgent ? "destructive" : isWarning ? "warning" : "secondary"}
            className={cn("transition-colors", isUrgent && "animate-pulse")}
          >
            <Clock className="mr-1 h-3 w-3" />
            {formatTime(timeLeft)}
          </Badge>
        </CardTitle>

        {/* Tab selector for Lightning vs On-chain */}
        {lnInvoice && btcAddress && (
          <div className="bg-muted flex space-x-1 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("lightning")}
              className={cn(
                "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                "flex items-center justify-center gap-2",
                activeTab === "lightning"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="text-yellow-500">⚡</span>
              Lightning
            </button>
            <button
              onClick={() => setActiveTab("onchain")}
              className={cn(
                "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                "flex items-center justify-center gap-2",
                activeTab === "onchain"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Bitcoin className="h-4 w-4" />
              On-chain
            </button>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* QR Code */}
        {currentPayment && (
          <div className="flex justify-center">
            <div className="rounded-lg bg-white p-4">
              <QRCodeCanvas value={currentPayment} size={200} level="M" includeMargin={true} />
            </div>
          </div>
        )}

        {/* Payment string with copy button */}
        {currentPayment && (
          <div className="space-y-2">
            <div className="text-muted-foreground text-sm font-medium">{currentLabel}</div>
            <div className="flex items-center space-x-2">
              <div className="bg-muted flex-1 rounded-md px-3 py-2">
                <code className="text-xs break-all">
                  {currentPayment.slice(0, 20)}...{currentPayment.slice(-20)}
                </code>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(currentPayment)}
                className="shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-2">
          {currentURI && (
            <Button
              onClick={() => handleOpenWallet(currentURI)}
              className="w-full"
              variant="default"
            >
              <Wallet className="mr-2 h-4 w-4" />
              Open in Wallet
            </Button>
          )}

          <Button variant="outline" onClick={onRefresh} disabled={isRefreshing} className="w-full">
            {isRefreshing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Payment
              </>
            )}
          </Button>
        </div>

        {/* Copy confirmation */}
        {copied && (
          <div className="text-center">
            <Badge variant="secondary" className="text-green-600">
              Copied to clipboard!
            </Badge>
          </div>
        )}

        {/* Expiration warning message */}
        {(isWarning || isUrgent) && (
          <div
            className={cn(
              "rounded-lg p-3 text-sm",
              isUrgent
                ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                : "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
            )}
          >
            <p className="font-medium">
              {isUrgent
                ? "⚠️ Payment request expires soon!"
                : "⏰ Payment request expiring in less than 5 minutes"}
            </p>
            <p className="mt-1 text-xs opacity-90">
              Complete payment now or refresh to generate a new request.
            </p>
          </div>
        )}

        {/* Payment instructions */}
        <div className="text-muted-foreground space-y-1 text-xs">
          {activeTab === "lightning" ? (
            <>
              <p>• Scan with any Lightning wallet</p>
              <p>• Payment will be instant</p>
              <p>• Lower fees than on-chain</p>
            </>
          ) : (
            <>
              <p>• Send Bitcoin to this address</p>
              <p>• Confirmations may take 10-60 minutes</p>
              <p>• Higher fees than Lightning</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
