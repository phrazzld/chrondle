"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AmountSelectorProps {
  onSelectAmount: (amount: number) => void;
  selectedAmount?: number | null;
  className?: string;
}

// Popular donation amounts based on common patterns
const POPULAR_AMOUNTS = [
  { value: 3.69, label: "$3.69", reason: "Nice" },
  { value: 4.2, label: "$4.20", reason: "Classic" },
  { value: 13.37, label: "$13.37", reason: "Elite" },
  { value: 21, label: "$21", reason: "Bitcoin" },
];

export function AmountSelector({ onSelectAmount, selectedAmount, className }: AmountSelectorProps) {
  const [recentAmounts, setRecentAmounts] = useState<number[]>([]);
  const [showSparkle, setShowSparkle] = useState(false);

  // Load recent amounts from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("chrondle_recent_amounts");
      if (stored) {
        setRecentAmounts(JSON.parse(stored).slice(0, 3));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Save selected amount to recent
  useEffect(() => {
    if (selectedAmount && selectedAmount > 0) {
      const updated = [selectedAmount, ...recentAmounts.filter((a) => a !== selectedAmount)].slice(
        0,
        3,
      );
      setRecentAmounts(updated);
      try {
        localStorage.setItem("chrondle_recent_amounts", JSON.stringify(updated));
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [selectedAmount]);

  const handlePopularSelect = (amount: number) => {
    setShowSparkle(true);
    setTimeout(() => setShowSparkle(false), 1000);
    onSelectAmount(amount);
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Recent amounts */}
      {recentAmounts.length > 0 && (
        <div className="space-y-2">
          <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
            <TrendingUp className="h-3 w-3" />
            Recent amounts
          </div>
          <div className="flex gap-2">
            {recentAmounts.map((amount) => (
              <Button
                key={amount}
                variant={selectedAmount === amount ? "default" : "outline"}
                size="sm"
                onClick={() => onSelectAmount(amount)}
                className="text-xs"
              >
                {formatAmount(amount)}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Popular amounts */}
      <div className="space-y-2">
        <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
          <Sparkles className={cn("h-3 w-3", showSparkle && "animate-pulse text-yellow-500")} />
          Popular amounts
        </div>
        <div className="flex flex-wrap gap-2">
          {POPULAR_AMOUNTS.map((popular) => (
            <Button
              key={popular.value}
              variant={selectedAmount === popular.value ? "default" : "outline"}
              size="sm"
              onClick={() => handlePopularSelect(popular.value)}
              className="group relative text-xs"
            >
              <span>{popular.label}</span>
              {/* Tooltip on hover */}
              <span className="absolute -top-8 left-1/2 hidden -translate-x-1/2 rounded bg-black px-2 py-1 text-[10px] whitespace-nowrap text-white group-hover:block">
                {popular.reason}
              </span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
