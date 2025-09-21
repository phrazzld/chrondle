"use client";

import React from "react";
import { AlertCircle, RefreshCw, Wifi, Clock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface DonationErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

/**
 * Categorize Strike API errors for better user messaging
 */
function categorizeError(error: Error): {
  icon: React.ElementType;
  title: string;
  message: string;
  actions: Array<{ label: string; action: () => void; variant?: "default" | "outline" }>;
} {
  const errorMessage = error.message.toLowerCase();

  // Rate limit errors
  if (errorMessage.includes("rate limit") || errorMessage.includes("too many")) {
    return {
      icon: Clock,
      title: "Too Many Requests",
      message: "We're experiencing high traffic. Please wait a moment and try again.",
      actions: [
        {
          label: "Try Again",
          action: () => window.location.reload(),
          variant: "default",
        },
      ],
    };
  }

  // Network errors
  if (
    errorMessage.includes("network") ||
    errorMessage.includes("fetch") ||
    errorMessage.includes("failed to fetch")
  ) {
    return {
      icon: Wifi,
      title: "Connection Problem",
      message: "Unable to connect to the payment service. Please check your internet connection.",
      actions: [
        {
          label: "Retry",
          action: () => window.location.reload(),
          variant: "default",
        },
      ],
    };
  }

  // Strike API errors
  if (errorMessage.includes("strike") || errorMessage.includes("payment service")) {
    return {
      icon: ShieldAlert,
      title: "Payment Service Unavailable",
      message: "The payment service is temporarily unavailable. Please try again later.",
      actions: [
        {
          label: "Try Again Later",
          action: () => window.location.reload(),
          variant: "default",
        },
      ],
    };
  }

  // Default error
  return {
    icon: AlertCircle,
    title: "Something Went Wrong",
    message: "We encountered an unexpected error while processing your donation.",
    actions: [
      {
        label: "Try Again",
        action: () => window.location.reload(),
        variant: "default",
      },
      {
        label: "Go Back",
        action: () => window.history.back(),
        variant: "outline",
      },
    ],
  };
}

/**
 * Fallback UI for donation-related errors
 */
function DonationErrorFallback({ error, resetError }: DonationErrorFallbackProps) {
  const { icon: Icon, title, message, actions } = categorizeError(error);

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <Icon className="h-6 w-6 text-red-600" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={() => {
                action.action();
                resetError();
              }}
              variant={action.variant || "default"}
              size="sm"
            >
              {index === 0 && <RefreshCw className="mr-2 h-4 w-4" />}
              {action.label}
            </Button>
          ))}
        </div>

        {/* Contact support for persistent issues */}
        <div className="text-center">
          <p className="text-muted-foreground text-xs">
            If this problem persists, please{" "}
            <a
              href="mailto:support@chrondle.com?subject=Donation%20Error"
              className="text-primary underline"
            >
              contact support
            </a>
          </p>
        </div>

        {/* Error details in development */}
        {process.env.NODE_ENV === "development" && (
          <details className="bg-muted mt-4 rounded-lg p-3">
            <summary className="text-muted-foreground cursor-pointer text-xs font-medium">
              Technical Details
            </summary>
            <div className="mt-2 space-y-1 text-xs">
              <p>
                <strong>Error:</strong> {error.name}
              </p>
              <p>
                <strong>Message:</strong> {error.message}
              </p>
              <pre className="bg-background mt-2 overflow-auto rounded p-2">
                {error.stack?.split("\n").slice(0, 5).join("\n")}
              </pre>
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}

interface DonationErrorBoundaryProps {
  children: React.ReactNode;
}

/**
 * Error boundary specifically for donation components
 * Provides Strike API-aware error handling and recovery
 */
export function DonationErrorBoundary({ children }: DonationErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={(error, resetError) => (
        <DonationErrorFallback error={error} resetError={resetError} />
      )}
      onError={(error, errorInfo) => {
        // Log to monitoring service in production
        if (process.env.NODE_ENV === "production") {
          // TODO: Send to error tracking service
          console.error("Donation error:", {
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
          });
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
