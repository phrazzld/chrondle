"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

interface BitcoinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BitcoinModal({
  open,
  onOpenChange,
}: BitcoinModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const address =
    process.env.NEXT_PUBLIC_BITCOIN_ADDRESS ||
    "bc1qary6smwqm8at0vx5m4e6nxznpftrw8jzqe2u8x";

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
        .catch(console.error);
    }
  }, [address, open]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Donate Bitcoin</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Support Chrondle development with Bitcoin
          </p>

          {qrDataUrl && (
            <div className="flex justify-center my-6">
              <img
                src={qrDataUrl}
                alt="Bitcoin QR code"
                className="w-48 h-48"
              />
            </div>
          )}

          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Bitcoin Address
            </p>
            <code className="block text-xs break-all bg-muted p-3 rounded">
              {address}
            </code>
          </div>

          <Button
            onClick={handleCopy}
            variant="outline"
            size="sm"
            className="w-full"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Address
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
