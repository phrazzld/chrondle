#!/usr/bin/env node

/**
 * Performance Regression Detection Script
 *
 * This script monitors key performance metrics and detects regressions
 * by comparing current performance with baseline metrics.
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// Baseline performance metrics from BASELINE_METRICS.md
const BASELINE_METRICS = {
  buildTime: 7000, // ms
  bundleSize: 261, // KB
  testSuiteTime: 90, // seconds (after root cause fix)
};

// Regression thresholds
const THRESHOLDS = {
  buildTime: 2000, // ms increase considered regression
  bundleSize: 15, // KB increase considered regression
  testSuiteTime: 30, // seconds increase considered regression
};

/**
 * Measure build performance
 */
function measureBuildPerformance() {
  console.warn("📊 Measuring build performance...");

  try {
    const startTime = Date.now();
    execSync("pnpm build", { stdio: "pipe" });
    const endTime = Date.now();

    const buildTime = endTime - startTime;
    return {
      buildTime,
      success: true,
    };
  } catch (error) {
    return {
      buildTime: null,
      success: false,
      error: error.message,
    };
  }
}

/**
 * Measure test suite performance
 */
function measureTestPerformance() {
  console.warn("🧪 Measuring test suite performance...");

  try {
    const startTime = Date.now();
    execSync("pnpm test:ci", { stdio: "pipe" });
    const endTime = Date.now();

    const testSuiteTime = (endTime - startTime) / 1000; // Convert to seconds
    return {
      testSuiteTime,
      success: true,
    };
  } catch (error) {
    return {
      testSuiteTime: null,
      success: false,
      error: error.message,
    };
  }
}

/**
 * Extract bundle size from build output
 */
function measureBundleSize() {
  try {
    const buildOutput = execSync("pnpm build", {
      encoding: "utf8",
      stdio: "pipe",
    });

    // Look for the main route bundle size in build output
    const bundleSizeMatch = buildOutput.match(/\s+\/\s+(\d+(?:\.\d+)?)\s+kB/);

    if (bundleSizeMatch) {
      return {
        bundleSize: parseFloat(bundleSizeMatch[1]),
        success: true,
      };
    }

    return {
      bundleSize: null,
      success: false,
      error: "Could not extract bundle size from build output",
    };
  } catch (error) {
    return {
      bundleSize: null,
      success: false,
      error: error.message,
    };
  }
}

/**
 * Analyze performance metrics for regressions
 */
function analyzePerformance(metrics) {
  const analysis = {
    buildTime: null,
    testSuiteTime: null,
    bundleSize: null,
    overallStatus: "stable",
    regressions: [],
    improvements: [],
  };

  // Analyze build time
  if (metrics.buildTime !== null) {
    const buildTimeDiff = metrics.buildTime - BASELINE_METRICS.buildTime;
    analysis.buildTime = {
      current: metrics.buildTime,
      baseline: BASELINE_METRICS.buildTime,
      difference: buildTimeDiff,
      percentChange: (
        (buildTimeDiff / BASELINE_METRICS.buildTime) *
        100
      ).toFixed(1),
    };

    if (buildTimeDiff > THRESHOLDS.buildTime) {
      analysis.regressions.push(
        `Build time increased by ${buildTimeDiff}ms (${analysis.buildTime.percentChange}%)`,
      );
    } else if (buildTimeDiff < -THRESHOLDS.buildTime) {
      analysis.improvements.push(
        `Build time decreased by ${Math.abs(buildTimeDiff)}ms (${Math.abs(analysis.buildTime.percentChange)}%)`,
      );
    }
  }

  // Analyze test suite time
  if (metrics.testSuiteTime !== null) {
    const testTimeDiff = metrics.testSuiteTime - BASELINE_METRICS.testSuiteTime;
    analysis.testSuiteTime = {
      current: metrics.testSuiteTime,
      baseline: BASELINE_METRICS.testSuiteTime,
      difference: testTimeDiff,
      percentChange: (
        (testTimeDiff / BASELINE_METRICS.testSuiteTime) *
        100
      ).toFixed(1),
    };

    if (testTimeDiff > THRESHOLDS.testSuiteTime) {
      analysis.regressions.push(
        `Test suite time increased by ${testTimeDiff.toFixed(1)}s (${analysis.testSuiteTime.percentChange}%)`,
      );
    } else if (testTimeDiff < -THRESHOLDS.testSuiteTime) {
      analysis.improvements.push(
        `Test suite time decreased by ${Math.abs(testTimeDiff).toFixed(1)}s (${Math.abs(analysis.testSuiteTime.percentChange)}%)`,
      );
    }
  }

  // Analyze bundle size
  if (metrics.bundleSize !== null) {
    const bundleSizeDiff = metrics.bundleSize - BASELINE_METRICS.bundleSize;
    analysis.bundleSize = {
      current: metrics.bundleSize,
      baseline: BASELINE_METRICS.bundleSize,
      difference: bundleSizeDiff,
      percentChange: (
        (bundleSizeDiff / BASELINE_METRICS.bundleSize) *
        100
      ).toFixed(1),
    };

    if (bundleSizeDiff > THRESHOLDS.bundleSize) {
      analysis.regressions.push(
        `Bundle size increased by ${bundleSizeDiff.toFixed(1)}KB (${analysis.bundleSize.percentChange}%)`,
      );
    } else if (bundleSizeDiff < -THRESHOLDS.bundleSize) {
      analysis.improvements.push(
        `Bundle size decreased by ${Math.abs(bundleSizeDiff).toFixed(1)}KB (${Math.abs(analysis.bundleSize.percentChange)}%)`,
      );
    }
  }

  // Determine overall status
  if (analysis.regressions.length > 0) {
    analysis.overallStatus = "regression";
  } else if (analysis.improvements.length > 0) {
    analysis.overallStatus = "improvement";
  }

  return analysis;
}

/**
 * Generate performance report
 */
function generatePerformanceReport(metrics, analysis) {
  const timestamp = new Date().toISOString();

  const report = {
    timestamp,
    metrics,
    analysis,
    success: analysis.overallStatus !== "regression",
  };

  // Save report to file
  const reportPath = path.join(process.cwd(), "performance-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  return report;
}

/**
 * Main performance monitoring function
 */
function monitorPerformance() {
  console.warn("🔍 Monitoring performance metrics...");

  try {
    // Measure all metrics
    const buildMetrics = measureBuildPerformance();
    const testMetrics = measureTestPerformance();
    const bundleMetrics = measureBundleSize();

    const metrics = {
      buildTime: buildMetrics.buildTime,
      testSuiteTime: testMetrics.testSuiteTime,
      bundleSize: bundleMetrics.bundleSize,
      success:
        buildMetrics.success && testMetrics.success && bundleMetrics.success,
    };

    // Analyze for regressions
    const analysis = analyzePerformance(metrics);

    // Generate report
    generatePerformanceReport(metrics, analysis);

    // Display results
    console.warn("📊 Performance Analysis:");

    if (analysis.buildTime) {
      console.warn(
        `   Build Time: ${analysis.buildTime.current}ms (${analysis.buildTime.difference > 0 ? "+" : ""}${analysis.buildTime.difference}ms, ${analysis.buildTime.percentChange}%)`,
      );
    }

    if (analysis.testSuiteTime) {
      console.warn(
        `   Test Suite: ${analysis.testSuiteTime.current}s (${analysis.testSuiteTime.difference > 0 ? "+" : ""}${analysis.testSuiteTime.difference.toFixed(1)}s, ${analysis.testSuiteTime.percentChange}%)`,
      );
    }

    if (analysis.bundleSize) {
      console.warn(
        `   Bundle Size: ${analysis.bundleSize.current}KB (${analysis.bundleSize.difference > 0 ? "+" : ""}${analysis.bundleSize.difference.toFixed(1)}KB, ${analysis.bundleSize.percentChange}%)`,
      );
    }

    console.warn(`   Overall Status: ${analysis.overallStatus.toUpperCase()}`);

    // Display alerts
    if (analysis.regressions.length > 0) {
      console.warn("❌ Performance regressions detected:");
      analysis.regressions.forEach((regression) => {
        console.warn(`   - ${regression}`);
      });
    }

    if (analysis.improvements.length > 0) {
      console.warn("✅ Performance improvements detected:");
      analysis.improvements.forEach((improvement) => {
        console.warn(`   - ${improvement}`);
      });
    }

    if (analysis.overallStatus === "regression") {
      console.error("❌ Performance regression detected!");
      process.exit(1);
    } else if (analysis.overallStatus === "improvement") {
      console.warn("✅ Performance improvement detected!");
    } else {
      console.warn("✅ Performance is stable");
    }
  } catch (error) {
    console.error("❌ Performance monitoring failed:", error.message);
    process.exit(1);
  }
}

// Run monitoring if called directly
if (require.main === module) {
  monitorPerformance();
}

module.exports = { monitorPerformance, analyzePerformance };
