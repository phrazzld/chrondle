#!/usr/bin/env node

/**
 * Bundle Alerts System
 *
 * This script generates alerts for bundle size changes, budget violations,
 * and composition changes. It can be used in CI/CD for notifications.
 */

const fs = require("fs");

// Alert severity levels
const SEVERITY = {
  INFO: "info",
  WARNING: "warning",
  ERROR: "error",
  CRITICAL: "critical",
};

// Alert thresholds
const ALERT_THRESHOLDS = {
  bundleIncrease: 10, // KB increase to trigger warning
  bundleCritical: 25, // KB increase to trigger critical alert
  chunkIncrease: 5, // KB chunk increase to trigger warning
  budgetViolation: 0, // Any budget violation triggers error
  newDependencies: 2, // Number of new dependencies to trigger warning
};

/**
 * Generate alerts from bundle analysis reports
 */
function generateBundleAlerts() {
  const alerts = [];

  try {
    // Read bundle analysis report
    const bundleReport = JSON.parse(
      fs.readFileSync("bundle-analysis-report.json", "utf8"),
    );

    // Check for budget violations
    if (bundleReport.analysis.budgetViolations.length > 0) {
      bundleReport.analysis.budgetViolations.forEach((violation) => {
        alerts.push({
          type: "budget_violation",
          severity: SEVERITY.ERROR,
          title: `Bundle Budget Violation: ${violation.type}`,
          message: `${violation.type} is ${violation.current}KB, exceeding budget of ${violation.budget}KB by ${violation.overage.toFixed(1)}KB`,
          data: violation,
          timestamp: new Date().toISOString(),
        });
      });
    }

    // Check for significant size increases
    if (bundleReport.analysis.changes.length > 0) {
      bundleReport.analysis.changes.forEach((change) => {
        if (change.sizeDiff > ALERT_THRESHOLDS.bundleIncrease) {
          const severity =
            change.sizeDiff > ALERT_THRESHOLDS.bundleCritical
              ? SEVERITY.CRITICAL
              : SEVERITY.WARNING;
          alerts.push({
            type: "bundle_size_increase",
            severity,
            title: `Bundle Size Increase: ${change.route}`,
            message: `${change.route} increased by ${change.sizeDiff.toFixed(1)}KB (${change.percentChange}%)`,
            data: change,
            timestamp: new Date().toISOString(),
          });
        }
      });
    }

    // Check for regressions
    if (bundleReport.analysis.regressions.length > 0) {
      bundleReport.analysis.regressions.forEach((regression) => {
        alerts.push({
          type: "bundle_regression",
          severity: SEVERITY.WARNING,
          title: `Bundle Size Regression`,
          message: regression.message,
          data: regression,
          timestamp: new Date().toISOString(),
        });
      });
    }

    // Check for improvements (positive alerts)
    if (bundleReport.analysis.improvements.length > 0) {
      bundleReport.analysis.improvements.forEach((improvement) => {
        alerts.push({
          type: "bundle_improvement",
          severity: SEVERITY.INFO,
          title: `Bundle Size Improvement`,
          message: improvement.message,
          data: improvement,
          timestamp: new Date().toISOString(),
        });
      });
    }
  } catch (error) {
    console.warn("Could not read bundle analysis report:", error.message);
  }

  try {
    // Read bundle composition report
    const compositionReport = JSON.parse(
      fs.readFileSync("bundle-composition-report.json", "utf8"),
    );

    // Check for significant chunk changes
    if (compositionReport.analysis.chunkChanges.length > 0) {
      compositionReport.analysis.chunkChanges.forEach((change) => {
        if (change.sizeDiff > ALERT_THRESHOLDS.chunkIncrease) {
          alerts.push({
            type: "chunk_size_increase",
            severity: SEVERITY.WARNING,
            title: `Chunk Size Increase: ${change.chunk}`,
            message: `Chunk ${change.chunk} increased by ${change.sizeDiff.toFixed(1)}KB (${change.percentChange}%)`,
            data: change,
            timestamp: new Date().toISOString(),
          });
        }
      });
    }

    // Check for new chunks
    if (compositionReport.analysis.newChunks.length > 0) {
      compositionReport.analysis.newChunks.forEach((chunk) => {
        alerts.push({
          type: "new_chunk",
          severity: SEVERITY.INFO,
          title: `New Chunk Created: ${chunk.chunk}`,
          message: `New chunk ${chunk.chunk} created with size ${chunk.size}KB`,
          data: chunk,
          timestamp: new Date().toISOString(),
        });
      });
    }

    // Check for removed chunks
    if (compositionReport.analysis.removedChunks.length > 0) {
      compositionReport.analysis.removedChunks.forEach((chunk) => {
        alerts.push({
          type: "removed_chunk",
          severity: SEVERITY.INFO,
          title: `Chunk Removed: ${chunk.chunk}`,
          message: `Chunk ${chunk.chunk} removed, reducing size by ${chunk.size}KB`,
          data: chunk,
          timestamp: new Date().toISOString(),
        });
      });
    }

    // Check for dependency changes
    if (compositionReport.analysis.dependencyChanges.length > 0) {
      compositionReport.analysis.dependencyChanges.forEach((change) => {
        if (change.added.length > ALERT_THRESHOLDS.newDependencies) {
          alerts.push({
            type: "dependency_increase",
            severity: SEVERITY.WARNING,
            title: `Multiple New Dependencies Added`,
            message: `${change.added.length} new dependencies added: ${change.added.join(", ")}`,
            data: change,
            timestamp: new Date().toISOString(),
          });
        } else if (change.added.length > 0) {
          alerts.push({
            type: "dependency_added",
            severity: SEVERITY.INFO,
            title: `Dependencies Added`,
            message: `New dependencies: ${change.added.join(", ")}`,
            data: change,
            timestamp: new Date().toISOString(),
          });
        }

        if (change.removed.length > 0) {
          alerts.push({
            type: "dependency_removed",
            severity: SEVERITY.INFO,
            title: `Dependencies Removed`,
            message: `Removed dependencies: ${change.removed.join(", ")}`,
            data: change,
            timestamp: new Date().toISOString(),
          });
        }
      });
    }
  } catch (error) {
    console.warn("Could not read bundle composition report:", error.message);
  }

  return alerts;
}

/**
 * Format alerts for different output formats
 */
function formatAlerts(alerts, format = "console") {
  if (format === "console") {
    return formatAlertsForConsole(alerts);
  } else if (format === "markdown") {
    return formatAlertsForMarkdown(alerts);
  } else if (format === "json") {
    return JSON.stringify(alerts, null, 2);
  } else if (format === "slack") {
    return formatAlertsForSlack(alerts);
  }

  return alerts;
}

/**
 * Format alerts for console output
 */
function formatAlertsForConsole(alerts) {
  let output = "";

  const severityIcons = {
    [SEVERITY.INFO]: "📊",
    [SEVERITY.WARNING]: "⚠️",
    [SEVERITY.ERROR]: "❌",
    [SEVERITY.CRITICAL]: "🚨",
  };

  alerts.forEach((alert) => {
    const icon = severityIcons[alert.severity] || "📊";
    output += `${icon} ${alert.title}\n`;
    output += `   ${alert.message}\n`;
    output += `   Severity: ${alert.severity.toUpperCase()}\n`;
    output += `   Time: ${new Date(alert.timestamp).toLocaleString()}\n\n`;
  });

  return output;
}

/**
 * Format alerts for Markdown (GitHub PR comments)
 */
function formatAlertsForMarkdown(alerts) {
  let output = "## 📊 Bundle Analysis Alerts\n\n";

  const severityIcons = {
    [SEVERITY.INFO]: "📊",
    [SEVERITY.WARNING]: "⚠️",
    [SEVERITY.ERROR]: "❌",
    [SEVERITY.CRITICAL]: "🚨",
  };

  // Group alerts by severity
  const groupedAlerts = alerts.reduce((groups, alert) => {
    if (!groups[alert.severity]) {
      groups[alert.severity] = [];
    }
    groups[alert.severity].push(alert);
    return groups;
  }, {});

  // Display critical alerts first
  const severityOrder = [
    SEVERITY.CRITICAL,
    SEVERITY.ERROR,
    SEVERITY.WARNING,
    SEVERITY.INFO,
  ];

  severityOrder.forEach((severity) => {
    if (groupedAlerts[severity] && groupedAlerts[severity].length > 0) {
      const icon = severityIcons[severity];
      output += `### ${icon} ${severity.toUpperCase()} (${groupedAlerts[severity].length})\n\n`;

      groupedAlerts[severity].forEach((alert) => {
        output += `- **${alert.title}**: ${alert.message}\n`;
      });

      output += "\n";
    }
  });

  if (alerts.length === 0) {
    output += "✅ No bundle alerts detected\n";
  }

  return output;
}

/**
 * Format alerts for Slack notifications
 */
function formatAlertsForSlack(alerts) {
  const criticalAlerts = alerts.filter((a) => a.severity === SEVERITY.CRITICAL);
  const errorAlerts = alerts.filter((a) => a.severity === SEVERITY.ERROR);
  const warningAlerts = alerts.filter((a) => a.severity === SEVERITY.WARNING);
  const infoAlerts = alerts.filter((a) => a.severity === SEVERITY.INFO);

  let color = "good"; // Green
  if (criticalAlerts.length > 0) {
    color = "danger"; // Red
  } else if (errorAlerts.length > 0) {
    color = "danger"; // Red
  } else if (warningAlerts.length > 0) {
    color = "warning"; // Yellow
  }

  const attachment = {
    color,
    title: "📊 Bundle Analysis Alerts",
    fields: [],
    footer: `Generated at ${new Date().toLocaleString()}`,
    ts: Math.floor(Date.now() / 1000),
  };

  if (criticalAlerts.length > 0) {
    attachment.fields.push({
      title: `🚨 Critical (${criticalAlerts.length})`,
      value: criticalAlerts.map((a) => a.message).join("\n"),
      short: false,
    });
  }

  if (errorAlerts.length > 0) {
    attachment.fields.push({
      title: `❌ Errors (${errorAlerts.length})`,
      value: errorAlerts.map((a) => a.message).join("\n"),
      short: false,
    });
  }

  if (warningAlerts.length > 0) {
    attachment.fields.push({
      title: `⚠️ Warnings (${warningAlerts.length})`,
      value: warningAlerts.map((a) => a.message).join("\n"),
      short: false,
    });
  }

  if (infoAlerts.length > 0) {
    attachment.fields.push({
      title: `📊 Info (${infoAlerts.length})`,
      value: infoAlerts.map((a) => a.message).join("\n"),
      short: false,
    });
  }

  return {
    text: "Bundle Analysis Complete",
    attachments: [attachment],
  };
}

/**
 * Save alerts to file
 */
function saveAlerts(alerts) {
  const alertsReport = {
    timestamp: new Date().toISOString(),
    totalAlerts: alerts.length,
    severityCounts: alerts.reduce((counts, alert) => {
      counts[alert.severity] = (counts[alert.severity] || 0) + 1;
      return counts;
    }, {}),
    alerts,
  };

  fs.writeFileSync(
    "bundle-alerts-report.json",
    JSON.stringify(alertsReport, null, 2),
  );
  return alertsReport;
}

/**
 * Main bundle alerts function
 */
function runBundleAlerts() {
  console.warn("🚨 Generating bundle alerts...");

  try {
    // Generate alerts
    const alerts = generateBundleAlerts();

    // Save alerts report
    const alertsReport = saveAlerts(alerts);

    // Display alerts
    if (alerts.length > 0) {
      console.warn("\n📊 Bundle Alerts Summary:");
      Object.entries(alertsReport.severityCounts).forEach(
        ([severity, count]) => {
          console.warn(`   ${severity.toUpperCase()}: ${count}`);
        },
      );

      console.warn("\n📋 Alert Details:");
      console.warn(formatAlerts(alerts, "console"));
    } else {
      console.warn("\n✅ No bundle alerts detected");
    }

    console.warn(`📄 Full alerts report saved to: bundle-alerts-report.json`);

    // Exit with appropriate code based on severity
    const hasErrors = alerts.some(
      (alert) =>
        alert.severity === SEVERITY.ERROR ||
        alert.severity === SEVERITY.CRITICAL,
    );
    if (hasErrors) {
      console.error("❌ Bundle alerts contain errors or critical issues!");
      process.exit(1);
    } else {
      console.warn("✅ Bundle alerts completed successfully!");
      process.exit(0);
    }
  } catch (error) {
    console.error("❌ Bundle alerts failed:", error.message);
    process.exit(1);
  }
}

// Run alerts if called directly
if (require.main === module) {
  runBundleAlerts();
}

module.exports = {
  generateBundleAlerts,
  formatAlerts,
  saveAlerts,
  SEVERITY,
  ALERT_THRESHOLDS,
};
