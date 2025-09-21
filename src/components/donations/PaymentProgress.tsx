"use client";

import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentProgressProps {
  currentStep: "amount" | "payment" | "success";
  isPending?: boolean;
  className?: string;
}

interface StepIndicatorProps {
  stepNumber: number;
  label: string;
  status: "completed" | "current" | "pending";
  isPending?: boolean;
}

function StepIndicator({ stepNumber, label, status, isPending }: StepIndicatorProps) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all",
          status === "completed" && "border-green-500 bg-green-500 text-white",
          status === "current" && isPending && "border-yellow-500 bg-yellow-50 text-yellow-600",
          status === "current" && !isPending && "border-primary bg-primary/10 text-primary",
          status === "pending" && "border-muted bg-muted text-muted-foreground",
        )}
      >
        {status === "completed" ? (
          <Check className="h-4 w-4" />
        ) : status === "current" && isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <span className="text-xs font-semibold">{stepNumber}</span>
        )}
      </div>
      <span
        className={cn(
          "mt-1 text-xs font-medium",
          status === "completed" && "text-green-600",
          status === "current" && "text-foreground",
          status === "pending" && "text-muted-foreground",
        )}
      >
        {label}
      </span>
    </div>
  );
}

export function PaymentProgress({ currentStep, isPending, className }: PaymentProgressProps) {
  const steps = [
    {
      number: 1,
      label: "Amount",
      status: currentStep === "amount" ? "current" : "completed",
    },
    {
      number: 2,
      label: "Payment",
      status:
        currentStep === "payment" ? "current" : currentStep === "success" ? "completed" : "pending",
    },
    {
      number: 3,
      label: "Complete",
      status: currentStep === "success" ? "current" : "pending",
    },
  ] as const;

  return (
    <div className={cn("flex items-center justify-between", className)}>
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <StepIndicator
            stepNumber={step.number}
            label={step.label}
            status={step.status}
            isPending={isPending && currentStep === "payment"}
          />
          {index < steps.length - 1 && (
            <div
              className={cn(
                "mx-2 h-0.5 w-8 transition-colors sm:w-12",
                (step.status === "completed" || (currentStep === "success" && index === 1)) &&
                  "bg-green-500",
                step.status === "current" && "bg-muted",
                step.status === "pending" && "bg-muted",
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
