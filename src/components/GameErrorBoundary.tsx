"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCw, Home, Bug } from "lucide-react";
import Link from "next/link";
import { logger } from "@/lib/logger";

interface Props {
  children: ReactNode;
  puzzleNumber?: number;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
  lastErrorTimestamp: number | null;
}

/**
 * Specialized error boundary for game state derivation
 *
 * This boundary specifically handles errors that may occur during:
 * - State derivation from orthogonal data sources
 * - Convex query errors
 * - Race condition edge cases
 * - Game logic calculation errors
 *
 * Provides game-specific recovery options and detailed debugging in development
 */
export class GameErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorCount: 0,
    lastErrorTimestamp: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      lastErrorTimestamp: Date.now(),
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { errorCount } = this.state;
    const newErrorCount = errorCount + 1;

    // Update state with error details
    this.setState({
      error,
      errorInfo,
      errorCount: newErrorCount,
    });

    // Log error details
    logger.error("Game Error Boundary caught an error:", error);
    logger.error("Component Stack:", errorInfo.componentStack);

    // Log game-specific context
    if (this.props.puzzleNumber) {
      logger.error("Puzzle Number:", this.props.puzzleNumber);
    }

    // Report to telemetry with game context
    this.reportGameError(error, errorInfo, newErrorCount);

    // If we've had multiple errors in quick succession, it might be a critical issue
    if (newErrorCount > 3) {
      logger.error("Multiple errors detected, suggesting critical issue");
    }
  }

  private reportGameError(
    error: Error,
    errorInfo: ErrorInfo,
    errorCount: number,
  ) {
    if (process.env.NODE_ENV !== "production") {
      // In development, log detailed debugging info
      // Using console.error which is allowed by ESLint
      console.error("🎮 Game Error Debug Info", {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorCount,
        puzzleNumber: this.props.puzzleNumber || "daily",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Production telemetry
    try {
      const errorData = {
        type: "GAME_STATE_ERROR",
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        puzzleNumber: this.props.puzzleNumber || "daily",
        errorCount,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      // Log for production monitoring
      console.error("GAME_ERROR:", JSON.stringify(errorData, null, 2));

      // Send to analytics if available
      if (typeof window !== "undefined" && "gtag" in window) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).gtag?.("event", "exception", {
          description: `Game State Error: ${error.message}`,
          fatal: false,
          error_count: errorCount,
          puzzle_number: this.props.puzzleNumber,
        });
      }
    } catch (reportingError) {
      console.error("Failed to report game error:", reportingError);
    }
  }

  private handleSoftReload = () => {
    // Try to reset the game state without full page reload
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Call custom reset handler if provided
    this.props.onReset?.();
  };

  private handleHardReload = () => {
    // Clear any problematic localStorage and reload
    try {
      // Clear only game-related localStorage keys
      const keysToRemove = [
        "chrondle-anonymous-id",
        "chrondle-session",
        "chrondle-debug",
      ];

      keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
      });

      logger.info("Cleared game data and reloading");
    } catch (e) {
      logger.error("Error clearing storage:", e);
    }

    window.location.reload();
  };

  private renderErrorDetails() {
    if (process.env.NODE_ENV !== "development" || !this.state.error) {
      return null;
    }

    return (
      <details className="mt-6 text-left">
        <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Bug className="inline w-4 h-4 mr-1" />
          Developer Details
        </summary>
        <div className="mt-3 space-y-3">
          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-xs font-mono text-muted-foreground mb-1">
              Error Message:
            </p>
            <pre className="text-xs font-mono overflow-auto">
              {this.state.error.message}
            </pre>
          </div>

          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-xs font-mono text-muted-foreground mb-1">
              Stack Trace:
            </p>
            <pre className="text-xs font-mono overflow-auto max-h-32">
              {this.state.error.stack}
            </pre>
          </div>

          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-xs font-mono text-muted-foreground mb-1">
              Component Stack:
            </p>
            <pre className="text-xs font-mono overflow-auto max-h-32">
              {this.state.errorInfo?.componentStack}
            </pre>
          </div>

          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-xs font-mono text-muted-foreground">
              Error Count: {this.state.errorCount} | Puzzle:{" "}
              {this.props.puzzleNumber || "daily"}
            </p>
          </div>
        </div>
      </details>
    );
  }

  public render() {
    if (this.state.hasError) {
      const isDerivationError =
        this.state.error?.message?.includes("derive") ||
        this.state.error?.message?.includes("state") ||
        this.state.error?.stack?.includes("deriveGameState");

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full">
            <div className="bg-card rounded-lg border shadow-lg p-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 mb-4">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>

                <h1 className="text-xl font-bold text-foreground mb-2">
                  {isDerivationError
                    ? "Game State Error"
                    : "Something went wrong with the game"}
                </h1>

                <p className="text-muted-foreground mb-6">
                  {isDerivationError
                    ? "We encountered an issue calculating the game state. This is usually temporary."
                    : "An unexpected error occurred while running the game. Please try refreshing."}
                </p>

                {/* Recovery Options */}
                <div className="space-y-3">
                  {/* Soft reload - try to recover without losing data */}
                  <button
                    onClick={this.handleSoftReload}
                    className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCw className="w-4 h-4" />
                    Try Again
                  </button>

                  {/* Navigate to home */}
                  <Link href="/" className="block">
                    <button className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2">
                      <Home className="w-4 h-4" />
                      Go to Today&apos;s Puzzle
                    </button>
                  </Link>

                  {/* Hard reload - last resort */}
                  {this.state.errorCount > 2 && (
                    <button
                      onClick={this.handleHardReload}
                      className="w-full px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
                    >
                      Clear Data & Reload
                    </button>
                  )}
                </div>

                {/* Error counter for persistent issues */}
                {this.state.errorCount > 1 && (
                  <p className="mt-4 text-xs text-muted-foreground">
                    Error occurred {this.state.errorCount} times
                  </p>
                )}

                {/* Developer details in development mode */}
                {this.renderErrorDetails()}
              </div>
            </div>

            {/* Help text */}
            <p className="mt-4 text-center text-xs text-muted-foreground">
              If this problem persists, please try a different browser or clear
              your browser&apos;s cache.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap game components with error boundary
 */
export function withGameErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  puzzleNumber?: number,
) {
  return function WrappedComponent(props: P) {
    return (
      <GameErrorBoundary puzzleNumber={puzzleNumber}>
        <Component {...props} />
      </GameErrorBoundary>
    );
  };
}
