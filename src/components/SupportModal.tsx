"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Network, validate } from "bitcoin-address-validation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, Heart } from "lucide-react";

// Constants
const COPY_FEEDBACK_DURATION_MS = 2000;

interface SupportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const resolvedAddress = (() => {
  const value = process.env.NEXT_PUBLIC_BITCOIN_ADDRESS;

  if (!value) {
    throw new Error("NEXT_PUBLIC_BITCOIN_ADDRESS must be defined");
  }

  if (!validate(value, Network.mainnet)) {
    throw new Error("NEXT_PUBLIC_BITCOIN_ADDRESS must be a valid mainnet address");
  }

  return value;
})();

export default function SupportModal({ open, onOpenChange }: SupportModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const address = resolvedAddress;

  useEffect(() => {
    if (open) {
      QRCode.toDataURL(`bitcoin:${address}`, {
        width: 200,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })
        .then(setQrDataUrl)
        .catch(() => {
          // Silently fail - QR code is nice to have but not critical
          setQrDataUrl("");
        });
    }
  }, [address, open]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION_MS);
    } catch {
      // Clipboard API not available or permission denied
      // Could show a toast here if we had a toast system
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-500" />
            Keep Chrondle Free
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your support helps us keep Chrondle completely free and ad-free while we continue adding
            fresh historical puzzles. Thank you for being part of our community of history lovers!
          </p>

          <div className="bg-muted/30 rounded-lg p-4">
            <p className="text-muted-foreground mb-3 text-center text-xs">Support via Bitcoin</p>

            {qrDataUrl && (
              <div className="mb-4 flex justify-center">
                <img src={qrDataUrl} alt="Bitcoin QR code" className="h-48 w-48 rounded-lg" />
              </div>
            )}

            <div className="space-y-2">
              <p className="text-muted-foreground text-xs">Bitcoin Address</p>
              <div className="flex items-center gap-2">
                <code className="bg-background flex-1 rounded border p-3 text-xs break-all">
                  {address}
                </code>
                <Button size="sm" variant="outline" onClick={handleCopy} className="shrink-0">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <p className="text-muted-foreground text-center text-xs italic">
            Every bit helps keep history alive. Thank you!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
