"use client";

import React, { useState, useCallback, useEffect } from "react";
import { WAGER_CONFIG } from "@/types/wager";
import { formatPoints } from "@/lib/wagerCalculations";
import { MultiplierBadge } from "./MultiplierBadge";

interface WagerInputProps {
  /** Current bank balance */
  bank: number;

  /** Current multiplier */
  multiplier: number;

  /** Recommended wager amount */
  recommendedAmount: number;

  /** Callback when wager amount changes */
  onChange: (amount: number) => void;

  /** Current wager amount (controlled) */
  value: number;

  /** Whether input is disabled */
  disabled?: boolean;

  /** Additional CSS classes */
  className?: string;
}

/**
 * Wager input component with slider and text input
 *
 * Allows players to set their wager amount using either:
 * - A slider for quick adjustment
 * - A text input for precise values
 * - Quick buttons for recommended amounts
 *
 * @example
 * <WagerInput
 *   bank={1000}
 *   multiplier={6}
 *   recommendedAmount={50}
 *   value={100}
 *   onChange={(amount) => setWager(amount)}
 * />
 */
export const WagerInput: React.FC<WagerInputProps> = ({
  bank,
  multiplier,
  recommendedAmount,
  onChange,
  value,
  disabled = false,
  className = "",
}) => {
  const [inputValue, setInputValue] = useState(value.toString());

  // Sync input value when controlled value changes
  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  // Handle slider change
  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseInt(e.target.value, 10);
      if (!isNaN(newValue)) {
        onChange(newValue);
      }
    },
    [onChange],
  );

  // Handle text input change
  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const text = e.target.value;
      setInputValue(text);

      // Parse and validate
      const num = parseInt(text, 10);
      if (!isNaN(num) && num >= WAGER_CONFIG.MIN_WAGER && num <= bank) {
        onChange(num);
      }
    },
    [onChange, bank],
  );

  // Handle text input blur - enforce min/max
  const handleTextBlur = useCallback(() => {
    const num = parseInt(inputValue, 10);
    if (isNaN(num) || num < WAGER_CONFIG.MIN_WAGER) {
      onChange(WAGER_CONFIG.MIN_WAGER);
      setInputValue(WAGER_CONFIG.MIN_WAGER.toString());
    } else if (num > bank) {
      onChange(bank);
      setInputValue(bank.toString());
    }
  }, [inputValue, onChange, bank]);

  // Quick amount buttons
  const quickAmounts = [
    { label: "Min", value: WAGER_CONFIG.MIN_WAGER },
    { label: "Rec", value: recommendedAmount },
    { label: "25%", value: Math.floor(bank * 0.25) },
    { label: "50%", value: Math.floor(bank * 0.5) },
    { label: "All-in", value: bank },
  ];

  // Calculate potential winnings
  const potentialWin = value * multiplier;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with multiplier */}
      <div className="flex items-center justify-between">
        <div className="text-foreground text-sm font-medium">Set Your Wager</div>
        <MultiplierBadge multiplier={multiplier} />
      </div>

      {/* Slider */}
      <div className="space-y-2">
        <input
          type="range"
          id="wager-slider"
          min={WAGER_CONFIG.MIN_WAGER}
          max={bank}
          value={value}
          onChange={handleSliderChange}
          disabled={disabled}
          className="bg-input slider-thumb h-2 w-full cursor-pointer appearance-none rounded-lg"
          style={{
            background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${((value - WAGER_CONFIG.MIN_WAGER) / (bank - WAGER_CONFIG.MIN_WAGER)) * 100}%, var(--input) ${((value - WAGER_CONFIG.MIN_WAGER) / (bank - WAGER_CONFIG.MIN_WAGER)) * 100}%, var(--input) 100%)`,
          }}
          aria-label={`Wager amount: ${formatPoints(value)} points`}
        />

        {/* Current value display */}
        <div className="text-muted-foreground flex items-center justify-between text-xs">
          <span>{formatPoints(WAGER_CONFIG.MIN_WAGER)}</span>
          <span className="text-foreground text-sm font-bold">{formatPoints(value)} pts</span>
          <span>{formatPoints(bank)}</span>
        </div>
      </div>

      {/* Text input */}
      <div className="relative">
        <input
          type="number"
          id="wager-input"
          value={inputValue}
          onChange={handleTextChange}
          onBlur={handleTextBlur}
          disabled={disabled}
          min={WAGER_CONFIG.MIN_WAGER}
          max={bank}
          className="bg-input border-border focus:ring-primary w-full rounded-lg border px-4 py-2 text-center text-lg font-bold transition-all focus:border-transparent focus:ring-2 focus:outline-none"
          placeholder={formatPoints(recommendedAmount)}
          aria-label="Wager amount input"
        />
      </div>

      {/* Quick amount buttons */}
      <div className="grid grid-cols-5 gap-2">
        {quickAmounts.map((quick) => (
          <button
            key={quick.label}
            type="button"
            onClick={() => onChange(quick.value)}
            disabled={disabled || quick.value < WAGER_CONFIG.MIN_WAGER}
            className="bg-input hover:bg-input/80 border-border rounded-md border px-2 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            title={`Set wager to ${formatPoints(quick.value)} points`}
          >
            {quick.label}
          </button>
        ))}
      </div>

      {/* Potential winnings display */}
      <div className="bg-primary/10 border-primary/20 rounded-lg border p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Potential win:</span>
          <span className="text-primary font-bold">+{formatPoints(potentialWin)} pts</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">If wrong:</span>
          <span className="text-destructive">
            -{formatPoints(Math.floor(value * WAGER_CONFIG.LOSS_MULTIPLIER))} pts
          </span>
        </div>
      </div>
    </div>
  );
};
