/**
 * Regression Monitoring Configuration
 *
 * This file defines thresholds and baseline metrics for regression detection.
 * Update these values when performance baselines change.
 */

module.exports = {
  // Baseline metrics from BASELINE_METRICS.md
  baseline: {
    bundleSize: 261, // KB (main route bundle size)
    buildTime: 7000, // ms (production build time)
    testSuiteTime: 90, // seconds (after root cause fix)
    testCount: 177, // number of tests
  },

  // Regression thresholds
  thresholds: {
    bundleSize: {
      regression: 15, // KB increase considered regression
      improvement: 15, // KB decrease considered improvement
    },
    buildTime: {
      regression: 2000, // ms increase considered regression
      improvement: 1000, // ms decrease considered improvement
    },
    testSuiteTime: {
      regression: 30, // seconds increase considered regression
      improvement: 15, // seconds decrease considered improvement
    },
    testCount: {
      regression: -5, // test count decrease considered regression
      improvement: 10, // test count increase considered improvement
    },
  },

  // Monitoring configuration
  monitoring: {
    // Files to save reports to
    reports: {
      bundleSize: "bundle-size-report.json",
      performance: "performance-report.json",
      regression: "regression-report.json",
    },

    // CI/CD configuration
    ci: {
      enablePRComments: true,
      enableSlackNotifications: false,
      enableEmailAlerts: false,
    },

    // Alert configuration
    alerts: {
      // Bundle size alerts
      bundleSize: {
        enabled: true,
        severity: "error", // 'error', 'warning', 'info'
      },

      // Performance alerts
      performance: {
        enabled: true,
        severity: "warning",
      },

      // Test suite alerts
      testSuite: {
        enabled: true,
        severity: "error",
      },
    },
  },

  // Quality gates
  qualityGates: {
    // Fail CI if bundle size increases by more than this
    bundleSizeGate: 25, // KB

    // Fail CI if build time increases by more than this
    buildTimeGate: 3000, // ms

    // Fail CI if test suite time increases by more than this
    testSuiteTimeGate: 45, // seconds

    // Fail CI if test count decreases by more than this
    testCountGate: 10, // test count
  },
};
