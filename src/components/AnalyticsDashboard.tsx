"use client";

import React, { useState, useEffect } from "react";
import { analytics } from "@/lib/analytics";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Users,
  Activity,
} from "lucide-react";

/**
 * Analytics Dashboard Component
 *
 * Displays real-time analytics data for monitoring game health,
 * state transitions, and potential issues.
 *
 * Only visible in development mode or when analytics debug is enabled.
 */
export function AnalyticsDashboard() {
  const [isVisible, setIsVisible] = useState(false);
  const [summary, setSummary] = useState<Record<string, unknown>>({});
  const [refreshKey, setRefreshKey] = useState(0);

  // Only show in development or with debug flag
  const shouldShow =
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "true";

  useEffect(() => {
    if (!shouldShow) return;

    // Keyboard shortcut to toggle dashboard (Ctrl+Shift+A)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "A") {
        e.preventDefault();
        setIsVisible((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shouldShow]);

  useEffect(() => {
    if (!isVisible) return;

    // Update summary data
    const updateSummary = () => {
      setSummary(analytics.getSummary());
    };

    updateSummary();

    // Auto-refresh every 2 seconds
    const interval = setInterval(updateSummary, 2000);

    return () => clearInterval(interval);
  }, [isVisible, refreshKey]);

  if (!shouldShow || !isVisible) {
    return null;
  }

  const {
    sessionId,
    queueSize = 0,
    recentTransitions = [],
    eventCounts = {},
    lastState,
    enabled,
  } = summary;

  // Calculate metrics
  const totalEvents = Object.values(eventCounts).reduce(
    (sum: number, count: unknown) => sum + (count as number),
    0,
  );
  const divergenceCount = eventCounts.state_divergence || 0;
  const errorCount = eventCounts.state_error || 0;
  const completionCount = eventCounts.game_completed || 0;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[600px] overflow-auto">
      <Card className="bg-background/95 backdrop-blur border-primary/20 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="font-bold">Analytics Dashboard</h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={enabled ? "default" : "secondary"}>
              {enabled ? "Active" : "Disabled"}
            </Badge>
            <button
              onClick={() => setIsVisible(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close dashboard"
            >
              ×
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 p-4">
          <MetricCard
            icon={<BarChart3 className="w-4 h-4" />}
            label="Total Events"
            value={totalEvents}
            color="text-primary"
          />
          <MetricCard
            icon={<Users className="w-4 h-4" />}
            label="Queue Size"
            value={queueSize}
            color="text-blue-500"
          />
          <MetricCard
            icon={<TrendingUp className="w-4 h-4" />}
            label="Completions"
            value={completionCount}
            color="text-green-500"
          />
          <MetricCard
            icon={<AlertTriangle className="w-4 h-4" />}
            label="Issues"
            value={divergenceCount + errorCount}
            color={
              divergenceCount + errorCount > 0
                ? "text-red-500"
                : "text-muted-foreground"
            }
          />
        </div>

        {/* State Info */}
        <div className="px-4 pb-2">
          <div className="text-xs text-muted-foreground mb-1">
            Current State
          </div>
          <Badge variant="outline" className="font-mono">
            {lastState || "unknown"}
          </Badge>
        </div>

        {/* Recent Transitions */}
        {recentTransitions.length > 0 && (
          <div className="px-4 pb-4">
            <div className="text-xs text-muted-foreground mb-2">
              Recent Transitions
            </div>
            <div className="space-y-1">
              {recentTransitions
                .slice(-5)
                .reverse()
                .map((transition: Record<string, unknown>, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-xs bg-muted/50 rounded px-2 py-1"
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">
                        {transition.from}
                      </span>
                      <span>→</span>
                      <span className="font-medium">{transition.to}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {new Date(transition.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Event Breakdown */}
        {Object.keys(eventCounts).length > 0 && (
          <div className="px-4 pb-4">
            <div className="text-xs text-muted-foreground mb-2">
              Event Breakdown
            </div>
            <div className="space-y-1">
              {Object.entries(eventCounts)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 5)
                .map(([event, count]: [string, unknown]) => (
                  <div
                    key={event}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-muted-foreground">
                      {event.replace(/_/g, " ")}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {count}
                    </Badge>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Alerts */}
        {(divergenceCount > 0 || errorCount > 0) && (
          <div className="px-4 pb-4 border-t">
            <div className="text-xs text-muted-foreground mb-2 mt-2">
              Alerts
            </div>
            {divergenceCount > 0 && (
              <div className="flex items-center gap-2 text-xs text-yellow-600 mb-1">
                <AlertTriangle className="w-3 h-3" />
                <span>{divergenceCount} state divergence(s) detected</span>
              </div>
            )}
            {errorCount > 0 && (
              <div className="flex items-center gap-2 text-xs text-red-600">
                <AlertTriangle className="w-3 h-3" />
                <span>{errorCount} state error(s) detected</span>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-4 pb-4 border-t">
          <div className="flex items-center justify-between mt-2">
            <div className="text-xs text-muted-foreground">
              Session: {sessionId?.slice(0, 8)}...
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setRefreshKey((prev) => prev + 1)}
              className="text-xs h-6"
            >
              Refresh
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

/**
 * Metric card component
 */
function MetricCard({
  icon,
  label,
  value,
  color = "text-foreground",
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color?: string;
}) {
  return (
    <div className="bg-muted/50 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        <span className={color}>{icon}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className={`text-lg font-bold ${color}`}>{value}</div>
    </div>
  );
}
