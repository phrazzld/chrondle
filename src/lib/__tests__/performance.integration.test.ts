import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getDailyYear,
  initializePuzzle,
  createInitialGameState,
} from "../gameState";
import { getPuzzleForYear, SUPPORTED_YEARS } from "../puzzleData";
import { sortEventsByRecognizability } from "../gameState";
import { logger } from "../logger";

// Performance test configuration
const PERFORMANCE_THRESHOLD_MS = 1000; // 1 second threshold
const BENCHMARK_ITERATIONS = 10; // Number of iterations for averaging

describe("Performance Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getDailyYear Performance", () => {
    it("should complete within performance threshold", () => {
      const start = performance.now();

      // Run multiple iterations to get average performance
      for (let i = 0; i < BENCHMARK_ITERATIONS; i++) {
        getDailyYear();
      }

      const end = performance.now();
      const totalTime = end - start;
      const averageTime = totalTime / BENCHMARK_ITERATIONS;

      logger.debug(
        `getDailyYear average execution time: ${averageTime.toFixed(2)}ms`,
      );

      // Should complete well under 1 second per call
      expect(averageTime).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
      expect(averageTime).toBeLessThan(100); // Should be much faster, under 100ms
    });

    it("should handle debug mode efficiently", () => {
      const start = performance.now();

      for (let i = 0; i < BENCHMARK_ITERATIONS; i++) {
        getDailyYear("1969", true);
      }

      const end = performance.now();
      const averageTime = (end - start) / BENCHMARK_ITERATIONS;

      logger.debug(
        `getDailyYear (debug mode) average execution time: ${averageTime.toFixed(2)}ms`,
      );

      expect(averageTime).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
      expect(averageTime).toBeLessThan(100);
    });
  });

  describe("initializePuzzle Performance", () => {
    it("should initialize puzzle within performance threshold", () => {
      // Use a year that has puzzle data
      const testYear = SUPPORTED_YEARS[0];

      const start = performance.now();

      for (let i = 0; i < BENCHMARK_ITERATIONS; i++) {
        try {
          initializePuzzle(testYear.toString(), true);
        } catch {
          // Expected if no puzzle data available, skip timing this iteration
          continue;
        }
      }

      const end = performance.now();
      const averageTime = (end - start) / BENCHMARK_ITERATIONS;

      logger.debug(
        `initializePuzzle average execution time: ${averageTime.toFixed(2)}ms`,
      );

      expect(averageTime).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
      expect(averageTime).toBeLessThan(500); // Should be under 500ms
    });
  });

  describe("getPuzzleForYear Performance", () => {
    it("should retrieve puzzle data efficiently", () => {
      const testYear = SUPPORTED_YEARS[0];

      const start = performance.now();

      for (let i = 0; i < BENCHMARK_ITERATIONS; i++) {
        getPuzzleForYear(testYear);
      }

      const end = performance.now();
      const averageTime = (end - start) / BENCHMARK_ITERATIONS;

      logger.debug(
        `getPuzzleForYear average execution time: ${averageTime.toFixed(2)}ms`,
      );

      expect(averageTime).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
      expect(averageTime).toBeLessThan(50); // Should be very fast for data lookup
    });
  });

  describe("sortEventsByRecognizability Performance", () => {
    it("should sort events efficiently", () => {
      const testEvents = [
        "First lunar landing by Apollo 11",
        "Vietnam War escalation continues",
        "Woodstock music festival occurs",
        "ARPANET first connection established",
        "Nixon becomes president",
        "Beatles release Abbey Road album",
      ];

      const start = performance.now();

      for (let i = 0; i < BENCHMARK_ITERATIONS; i++) {
        sortEventsByRecognizability(testEvents);
      }

      const end = performance.now();
      const averageTime = (end - start) / BENCHMARK_ITERATIONS;

      logger.debug(
        `sortEventsByRecognizability average execution time: ${averageTime.toFixed(2)}ms`,
      );

      expect(averageTime).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
      expect(averageTime).toBeLessThan(200); // Should be under 200ms for 6 events
    });
  });

  describe("createInitialGameState Performance", () => {
    it("should create initial state efficiently", () => {
      const start = performance.now();

      for (let i = 0; i < BENCHMARK_ITERATIONS; i++) {
        createInitialGameState();
      }

      const end = performance.now();
      const averageTime = (end - start) / BENCHMARK_ITERATIONS;

      logger.debug(
        `createInitialGameState average execution time: ${averageTime.toFixed(2)}ms`,
      );

      expect(averageTime).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
      expect(averageTime).toBeLessThan(10); // Should be very fast
    });
  });

  describe("Memory Usage Tests", () => {
    it("should not cause memory leaks in repeated operations", () => {
      const initialMemory =
        "memory" in performance
          ? (
              performance as Performance & {
                memory: { usedJSHeapSize: number };
              }
            ).memory.usedJSHeapSize
          : 0;

      // Perform many operations
      for (let i = 0; i < 1000; i++) {
        createInitialGameState();
        getDailyYear();
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory =
        "memory" in performance
          ? (
              performance as Performance & {
                memory: { usedJSHeapSize: number };
              }
            ).memory.usedJSHeapSize
          : 0;
      const memoryGrowth = finalMemory - initialMemory;

      logger.debug(
        `Memory growth after 1000 operations: ${memoryGrowth} bytes`,
      );

      // Memory growth should be reasonable (less than 10MB for these simple operations)
      if (initialMemory > 0) {
        expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024); // 10MB threshold
      }
    });
  });

  describe("Stress Tests", () => {
    it("should handle multiple rapid calls without degradation", () => {
      const start = performance.now();

      // Run many operations
      for (let i = 0; i < 1000; i++) {
        getDailyYear();
      }

      const totalTime = performance.now() - start;
      const averageTime = totalTime / 1000;

      logger.debug(
        `Stress test - 1000 operations in ${totalTime.toFixed(2)}ms, average: ${averageTime.toFixed(2)}ms`,
      );

      // Average time per operation should be well under 1ms
      expect(averageTime).toBeLessThan(1);
    });
  });
});
