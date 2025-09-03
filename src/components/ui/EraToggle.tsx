"use client";

import * as React from "react";
import { motion } from "motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { Era } from "@/lib/eraUtils";

const toggleContainerVariants = cva(
  "inline-flex rounded-md bg-muted p-1 gap-1",
  {
    variants: {
      size: {
        sm: "h-8 text-xs",
        default: "h-9 text-sm",
        lg: "h-10 text-base",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

const toggleButtonVariants = cva(
  "inline-flex items-center justify-center rounded px-3 py-1 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        active: "bg-background text-foreground shadow-sm",
        inactive:
          "text-muted-foreground hover:text-foreground hover:bg-background/50",
      },
      size: {
        sm: "h-6 min-w-[2.5rem] text-xs",
        default: "h-7 min-w-[3rem] text-sm",
        lg: "h-8 min-w-[3.5rem] text-base",
      },
    },
    defaultVariants: {
      variant: "inactive",
      size: "default",
    },
  },
);

export interface EraToggleProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange">,
    VariantProps<typeof toggleContainerVariants> {
  value: Era;
  onChange: (era: Era) => void;
  disabled?: boolean;
  showLabels?: boolean;
}

const EraToggle = React.forwardRef<HTMLDivElement, EraToggleProps>(
  (
    {
      className,
      size,
      value,
      onChange,
      disabled = false,
      showLabels = false,
      ...props
    },
    ref,
  ) => {
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;

      switch (event.key) {
        case "ArrowLeft":
        case "ArrowUp":
          event.preventDefault();
          if (value === "AD") {
            onChange("BC");
          }
          break;
        case "ArrowRight":
        case "ArrowDown":
          event.preventDefault();
          if (value === "BC") {
            onChange("AD");
          }
          break;
        case " ":
        case "Enter":
          event.preventDefault();
          onChange(value === "BC" ? "AD" : "BC");
          break;
      }
    };

    const handleButtonClick = (era: Era) => {
      if (!disabled && era !== value) {
        onChange(era);
      }
    };

    return (
      <div
        ref={ref}
        role="radiogroup"
        aria-label="Select era: BC or AD"
        aria-disabled={disabled}
        className={cn(toggleContainerVariants({ size }), className)}
        onKeyDown={handleKeyDown}
        {...props}
      >
        <motion.button
          type="button"
          role="radio"
          aria-checked={value === "BC"}
          aria-label={showLabels ? undefined : "BC era"}
          className={cn(
            toggleButtonVariants({
              variant: value === "BC" ? "active" : "inactive",
              size,
            }),
          )}
          onClick={() => handleButtonClick("BC")}
          disabled={disabled}
          whileTap={!disabled ? { scale: 0.95 } : undefined}
          animate={{
            backgroundColor:
              value === "BC" ? "var(--background)" : "transparent",
          }}
          transition={{ duration: 0.2 }}
        >
          BC
        </motion.button>
        <motion.button
          type="button"
          role="radio"
          aria-checked={value === "AD"}
          aria-label={showLabels ? undefined : "AD era"}
          className={cn(
            toggleButtonVariants({
              variant: value === "AD" ? "active" : "inactive",
              size,
            }),
          )}
          onClick={() => handleButtonClick("AD")}
          disabled={disabled}
          whileTap={!disabled ? { scale: 0.95 } : undefined}
          animate={{
            backgroundColor:
              value === "AD" ? "var(--background)" : "transparent",
          }}
          transition={{ duration: 0.2 }}
        >
          AD
        </motion.button>
      </div>
    );
  },
);

EraToggle.displayName = "EraToggle";

export { EraToggle };

// Example usage with label for forms:
export const EraToggleWithLabel: React.FC<{
  value: Era;
  onChange: (era: Era) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: "sm" | "default" | "lg";
}> = ({ value, onChange, label = "Era", description, disabled, size }) => {
  const id = React.useId();
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
      )}
      <EraToggle
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        size={size}
        aria-describedby={descriptionId}
      />
      {description && (
        <p id={descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
};
