#!/usr/bin/env node

/**
 * Comprehensive Regression Detection Script
 *
 * This script runs all regression detection checks and generates a comprehensive report.
 * It uses the configuration from regression-monitoring.config.js for thresholds and settings.
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// Load configuration
import config from "../regression-monitoring.config.js";

/**
 * Run all tests and collect metrics
 */
function runTests() {
  console.warn("🧪 Running test suite...");

  try {
    const startTime = Date.now();
    const testOutput = execSync("pnpm test:ci", { encoding: "utf8" });
    const endTime = Date.now();

    // Extract test count from output
    const testCountMatch = testOutput.match(/(\d+) passed/);
    const testCount = testCountMatch ? parseInt(testCountMatch[1]) : 0;

    return {
      testSuiteTime: (endTime - startTime) / 1000, // Convert to seconds
      testCount,
      success: true,
      output: testOutput,
    };
  } catch (error) {
    return {
      testSuiteTime: null,
      testCount: 0,
      success: false,
      error: error.message,
    };
  }
}

/**
 * Build and measure performance
 */
function runBuild() {
  console.warn("🏗️  Building application...");

  try {
    const startTime = Date.now();
    const buildOutput = execSync("pnpm build", { encoding: "utf8" });
    const endTime = Date.now();

    // Extract bundle size from build output
    const bundleSizeMatch = buildOutput.match(/\s+\/\s+(\d+(?:\.\d+)?)\s+kB/);
    const bundleSize = bundleSizeMatch ? parseFloat(bundleSizeMatch[1]) : null;

    return {
      buildTime: endTime - startTime,
      bundleSize,
      success: true,
      output: buildOutput,
    };
  } catch (error) {
    return {
      buildTime: null,
      bundleSize: null,
      success: false,
      error: error.message,
    };
  }
}

/**
 * Analyze metrics for regressions
 */
function analyzeRegressions(metrics) {
  const analysis = {
    regressions: [],
    improvements: [],
    warnings: [],
    overallStatus: "stable",
    qualityGateFailures: [],
  };

  // Analyze bundle size
  if (metrics.bundleSize !== null) {
    const sizeDiff = metrics.bundleSize - config.baseline.bundleSize;
    const percentChange = (sizeDiff / config.baseline.bundleSize) * 100;

    if (sizeDiff > config.thresholds.bundleSize.regression) {
      analysis.regressions.push({
        metric: "bundleSize",
        message: `Bundle size increased by ${sizeDiff.toFixed(1)}KB (${percentChange.toFixed(1)}%)`,
        current: metrics.bundleSize,
        baseline: config.baseline.bundleSize,
        difference: sizeDiff,
        percentChange,
      });
    } else if (sizeDiff < -config.thresholds.bundleSize.improvement) {
      analysis.improvements.push({
        metric: "bundleSize",
        message: `Bundle size decreased by ${Math.abs(sizeDiff).toFixed(1)}KB (${Math.abs(percentChange).toFixed(1)}%)`,
        current: metrics.bundleSize,
        baseline: config.baseline.bundleSize,
        difference: sizeDiff,
        percentChange,
      });
    }

    // Check quality gate
    if (sizeDiff > config.qualityGates.bundleSizeGate) {
      analysis.qualityGateFailures.push({
        gate: "bundleSize",
        message: `Bundle size increased by ${sizeDiff.toFixed(1)}KB (limit: ${config.qualityGates.bundleSizeGate}KB)`,
        current: metrics.bundleSize,
        limit: config.baseline.bundleSize + config.qualityGates.bundleSizeGate,
      });
    }
  }

  // Analyze build time
  if (metrics.buildTime !== null) {
    const timeDiff = metrics.buildTime - config.baseline.buildTime;
    const percentChange = (timeDiff / config.baseline.buildTime) * 100;

    if (timeDiff > config.thresholds.buildTime.regression) {
      analysis.regressions.push({
        metric: "buildTime",
        message: `Build time increased by ${timeDiff}ms (${percentChange.toFixed(1)}%)`,
        current: metrics.buildTime,
        baseline: config.baseline.buildTime,
        difference: timeDiff,
        percentChange,
      });
    } else if (timeDiff < -config.thresholds.buildTime.improvement) {
      analysis.improvements.push({
        metric: "buildTime",
        message: `Build time decreased by ${Math.abs(timeDiff)}ms (${Math.abs(percentChange).toFixed(1)}%)`,
        current: metrics.buildTime,
        baseline: config.baseline.buildTime,
        difference: timeDiff,
        percentChange,
      });
    }

    // Check quality gate
    if (timeDiff > config.qualityGates.buildTimeGate) {
      analysis.qualityGateFailures.push({
        gate: "buildTime",
        message: `Build time increased by ${timeDiff}ms (limit: ${config.qualityGates.buildTimeGate}ms)`,
        current: metrics.buildTime,
        limit: config.baseline.buildTime + config.qualityGates.buildTimeGate,
      });
    }
  }

  // Analyze test suite time
  if (metrics.testSuiteTime !== null) {
    const timeDiff = metrics.testSuiteTime - config.baseline.testSuiteTime;
    const percentChange = (timeDiff / config.baseline.testSuiteTime) * 100;

    if (timeDiff > config.thresholds.testSuiteTime.regression) {
      analysis.regressions.push({
        metric: "testSuiteTime",
        message: `Test suite time increased by ${timeDiff.toFixed(1)}s (${percentChange.toFixed(1)}%)`,
        current: metrics.testSuiteTime,
        baseline: config.baseline.testSuiteTime,
        difference: timeDiff,
        percentChange,
      });
    } else if (timeDiff < -config.thresholds.testSuiteTime.improvement) {
      analysis.improvements.push({
        metric: "testSuiteTime",
        message: `Test suite time decreased by ${Math.abs(timeDiff).toFixed(1)}s (${Math.abs(percentChange).toFixed(1)}%)`,
        current: metrics.testSuiteTime,
        baseline: config.baseline.testSuiteTime,
        difference: timeDiff,
        percentChange,
      });
    }

    // Check quality gate
    if (timeDiff > config.qualityGates.testSuiteTimeGate) {
      analysis.qualityGateFailures.push({
        gate: "testSuiteTime",
        message: `Test suite time increased by ${timeDiff.toFixed(1)}s (limit: ${config.qualityGates.testSuiteTimeGate}s)`,
        current: metrics.testSuiteTime,
        limit:
          config.baseline.testSuiteTime + config.qualityGates.testSuiteTimeGate,
      });
    }
  }

  // Analyze test count
  if (metrics.testCount !== null) {
    const countDiff = metrics.testCount - config.baseline.testCount;
    const percentChange = (countDiff / config.baseline.testCount) * 100;

    if (countDiff < config.thresholds.testCount.regression) {
      analysis.regressions.push({
        metric: "testCount",
        message: `Test count decreased by ${Math.abs(countDiff)} tests (${Math.abs(percentChange).toFixed(1)}%)`,
        current: metrics.testCount,
        baseline: config.baseline.testCount,
        difference: countDiff,
        percentChange,
      });
    } else if (countDiff > config.thresholds.testCount.improvement) {
      analysis.improvements.push({
        metric: "testCount",
        message: `Test count increased by ${countDiff} tests (${percentChange.toFixed(1)}%)`,
        current: metrics.testCount,
        baseline: config.baseline.testCount,
        difference: countDiff,
        percentChange,
      });
    }

    // Check quality gate
    if (countDiff < -config.qualityGates.testCountGate) {
      analysis.qualityGateFailures.push({
        gate: "testCount",
        message: `Test count decreased by ${Math.abs(countDiff)} tests (limit: ${config.qualityGates.testCountGate} tests)`,
        current: metrics.testCount,
        limit: config.baseline.testCount - config.qualityGates.testCountGate,
      });
    }
  }

  // Determine overall status
  if (analysis.qualityGateFailures.length > 0) {
    analysis.overallStatus = "failed";
  } else if (analysis.regressions.length > 0) {
    analysis.overallStatus = "regression";
  } else if (analysis.improvements.length > 0) {
    analysis.overallStatus = "improvement";
  }

  return analysis;
}

/**
 * Generate comprehensive regression report
 */
function generateReport(metrics, analysis) {
  const timestamp = new Date().toISOString();

  const report = {
    timestamp,
    config: {
      baseline: config.baseline,
      thresholds: config.thresholds,
      qualityGates: config.qualityGates,
    },
    metrics,
    analysis,
    success:
      analysis.overallStatus !== "failed" &&
      analysis.overallStatus !== "regression",
  };

  // Save report to file
  const reportPath = path.join(
    process.cwd(),
    config.monitoring.reports.regression,
  );
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  return report;
}

/**
 * Main regression detection function
 */
function detectRegressions() {
  console.warn("🔍 Running comprehensive regression detection...");

  try {
    // Run tests and build
    const testResults = runTests();
    const buildResults = runBuild();

    // Collect metrics
    const metrics = {
      bundleSize: buildResults.bundleSize,
      buildTime: buildResults.buildTime,
      testSuiteTime: testResults.testSuiteTime,
      testCount: testResults.testCount,
      testSuccess: testResults.success,
      buildSuccess: buildResults.success,
    };

    // Analyze for regressions
    const analysis = analyzeRegressions(metrics);

    // Generate report
    generateReport(metrics, analysis);

    // Display results
    console.warn("\n📊 Regression Detection Results:");
    console.warn(`Overall Status: ${analysis.overallStatus.toUpperCase()}`);

    if (metrics.bundleSize) {
      console.warn(
        `Bundle Size: ${metrics.bundleSize}KB (baseline: ${config.baseline.bundleSize}KB)`,
      );
    }

    if (metrics.buildTime) {
      console.warn(
        `Build Time: ${metrics.buildTime}ms (baseline: ${config.baseline.buildTime}ms)`,
      );
    }

    if (metrics.testSuiteTime) {
      console.warn(
        `Test Suite Time: ${metrics.testSuiteTime.toFixed(1)}s (baseline: ${config.baseline.testSuiteTime}s)`,
      );
    }

    if (metrics.testCount) {
      console.warn(
        `Test Count: ${metrics.testCount} (baseline: ${config.baseline.testCount})`,
      );
    }

    // Display quality gate failures
    if (analysis.qualityGateFailures.length > 0) {
      console.warn("\n❌ Quality Gate Failures:");
      analysis.qualityGateFailures.forEach((failure) => {
        console.warn(`   - ${failure.message}`);
      });
    }

    // Display regressions
    if (analysis.regressions.length > 0) {
      console.warn("\n⚠️  Regressions Detected:");
      analysis.regressions.forEach((regression) => {
        console.warn(`   - ${regression.message}`);
      });
    }

    // Display improvements
    if (analysis.improvements.length > 0) {
      console.warn("\n✅ Improvements Detected:");
      analysis.improvements.forEach((improvement) => {
        console.warn(`   - ${improvement.message}`);
      });
    }

    console.warn(
      `\n📄 Full report saved to: ${config.monitoring.reports.regression}`,
    );

    // Exit with appropriate code
    if (analysis.overallStatus === "failed") {
      console.error("\n❌ Quality gates failed!");
      process.exit(1);
    } else if (analysis.overallStatus === "regression") {
      console.error("\n⚠️  Performance regressions detected!");
      process.exit(1);
    } else {
      console.warn("\n✅ All checks passed!");
      process.exit(0);
    }
  } catch (error) {
    console.error("❌ Regression detection failed:", error.message);
    process.exit(1);
  }
}

// Run detection if called directly
if (require.main === module) {
  detectRegressions();
}

module.exports = { detectRegressions, analyzeRegressions };
