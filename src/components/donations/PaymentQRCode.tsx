"use client";

import { useState, useEffect, useCallback } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Copy, Clock, RefreshCw, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [timeLeft, setTimeLeft] = useState(() =>
    Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)),
  );
  const [activeRail, setActiveRail] = useState<"lightning" | "onchain">(
    lnInvoice ? "lightning" : "onchain",
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const tick = () => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) {
        onExpired();
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpired]);

  const formatTime = useCallback((seconds: number) => {
    if (seconds <= 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const handleCopy = useCallback(async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  }, []);

  const currentValue = activeRail === "lightning" ? lnInvoice : btcAddress;
  const currentLabel = activeRail === "lightning" ? "Lightning invoice" : "On-chain address";
  const currentURI =
    activeRail === "lightning" && lnInvoice
      ? `lightning:${lnInvoice}`
      : activeRail === "onchain" && btcAddress
        ? `bitcoin:${btcAddress}`
        : "";

  const isExpired = timeLeft <= 0;

  if (isExpired) {
    return (
      <div
        className={cn(
          "flex flex-col items-center gap-3 rounded-2xl border border-dashed border-red-200 bg-red-50 p-6 text-center",
          className,
        )}
      >
        <Clock className="h-8 w-8 text-red-500" />
        <div className="space-y-1">
          <p className="text-base font-medium text-red-600">This invoice expired</p>
          <p className="text-sm text-red-500">Generate a fresh one to keep going.</p>
        </div>
        <Button onClick={onRefresh} disabled={isRefreshing} className="mt-2">
          {isRefreshing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Refreshing
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              New invoice
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("border-border bg-card rounded-2xl border p-5 shadow-sm", className)}>
      <div className="text-muted-foreground flex items-center justify-between text-xs font-medium tracking-wide uppercase">
        <span>{currentLabel}</span>
        <span className="text-foreground flex items-center gap-1 font-mono text-sm">
          <Clock className="h-3.5 w-3.5" />
          {formatTime(timeLeft)}
        </span>
      </div>

      {lnInvoice && btcAddress && (
        <div className="bg-muted mt-3 flex gap-1 rounded-full p-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveRail("lightning")}
            className={cn(
              "flex-1 rounded-full px-3 py-1 font-medium transition",
              activeRail === "lightning"
                ? "bg-background text-foreground shadow"
                : "text-muted-foreground",
            )}
          >
            ⚡ Lightning
          </button>
          <button
            type="button"
            onClick={() => setActiveRail("onchain")}
            className={cn(
              "flex-1 rounded-full px-3 py-1 font-medium transition",
              activeRail === "onchain"
                ? "bg-background text-foreground shadow"
                : "text-muted-foreground",
            )}
          >
            ₿ On-chain
          </button>
        </div>
      )}

      {currentValue && (
        <div className="mt-5 flex justify-center">
          <div className="rounded-xl bg-white p-4 shadow">
            <QRCodeCanvas value={currentValue} size={200} level="M" includeMargin />
          </div>
        </div>
      )}

      {currentValue && (
        <div className="mt-5 space-y-3">
          <div className="bg-muted/60 text-muted-foreground rounded-md px-3 py-2 font-mono text-[11px] leading-relaxed">
            {currentValue}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => handleCopy(currentValue)}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
            {currentURI && (
              <Button
                type="button"
                className="flex-1"
                onClick={() => window.open(currentURI, "_blank")}
              >
                <Wallet className="mr-2 h-4 w-4" />
                Open wallet
              </Button>
            )}
          </div>
        </div>
      )}

      {copied && <div className="mt-3 text-center text-xs text-green-600">Copied to clipboard</div>}
    </div>
  );
}
