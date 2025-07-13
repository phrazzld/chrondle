"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { logger } from "@/lib/logger";
import { clearAllChrondleStorage } from "@/lib/storage";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Global Error Boundary for Chrondle
 * Catches JavaScript errors and provides production telemetry
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // Log error for debugging
    logger.error("React Error Boundary caught an error:", error);
    logger.error("Error Info:", errorInfo);

    // Send to production telemetry
    this.reportError(error, errorInfo);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  private reportError(error: Error, errorInfo: ErrorInfo) {
    // Only report in production to avoid noise during development
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    try {
      // Prepare error data for telemetry
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.getAnonymousUserId(),
      };

      // Send to console for basic telemetry
      // In a real production app, you would send this to a service like Sentry, LogRocket, etc.
      console.error("PRODUCTION_ERROR:", JSON.stringify(errorData, null, 2));

      // Optional: Send to a telemetry service
      // Example: window.gtag?.('event', 'exception', { description: error.message, fatal: false });
    } catch (reportingError) {
      // Don't let error reporting crash the app
      console.error("Failed to report error:", reportingError);
    }
  }

  private getAnonymousUserId(): string {
    // Create an anonymous user ID for error tracking
    // This helps correlate errors without storing personal data
    let userId = localStorage.getItem("chrondle-anonymous-id");
    if (!userId) {
      userId = "anon_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("chrondle-anonymous-id", userId);
    }
    return userId;
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleClearStorage = () => {
    if (
      confirm("Clear all game data and reload? This will reset your progress.")
    ) {
      clearAllChrondleStorage();
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md w-full mx-4 p-6 bg-card rounded-lg border shadow-lg">
            <div className="text-center">
              <div className="text-4xl mb-4">🚨</div>
              <h1 className="text-xl font-bold text-foreground mb-2">
                Something went wrong
              </h1>
              <p className="text-muted-foreground mb-6">
                We&apos;re sorry! An unexpected error occurred. This has been
                logged for investigation.
              </p>

              <div className="space-y-3">
                <button
                  onClick={this.handleReload}
                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Reload Game
                </button>

                <button
                  onClick={this.handleClearStorage}
                  className="w-full px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
                >
                  Clear Data & Reload
                </button>
              </div>

              {/* Show error details in development */}
              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm text-muted-foreground">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 text-xs bg-muted p-3 rounded overflow-auto max-h-32">
                    {this.state.error.message}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
