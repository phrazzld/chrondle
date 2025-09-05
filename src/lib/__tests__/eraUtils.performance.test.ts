import { describe, it, expect } from "vitest";
import {
  convertToInternalYear,
  convertFromInternalYear,
  isValidEraYear,
  adjustYearWithinEra,
  formatEraYear,
  parseEraYearString,
  getEraYearRange,
  isAmbiguousYear,
} from "../eraUtils";

describe("Era Utilities Performance Benchmarks", () => {
  // Performance target: All operations should complete in under 1ms
  // This is critical for maintaining 60fps UI responsiveness
  const PERFORMANCE_TARGET_MS = 1; // 1ms per operation
  const CI_THRESHOLD_MULTIPLIER = 1.5; // Allow 50% more time in CI

  describe("Core Conversion Functions", () => {
    it("convertToInternalYear should execute in under 1ms", () => {
      const testCases = [
        { year: 776, era: "BC" as const },
        { year: 1969, era: "AD" as const },
        { year: 1, era: "BC" as const },
        { year: 1, era: "AD" as const },
        { year: 3000, era: "BC" as const },
        { year: 2024, era: "AD" as const },
      ];

      // Warm up
      convertToInternalYear(100, "BC");

      // Measure individual operation performance
      testCases.forEach(({ year, era }) => {
        const iterations = 1000;
        const startTime = performance.now();

        for (let i = 0; i < iterations; i++) {
          const result = convertToInternalYear(year, era);
          // Ensure result is used to prevent optimization
          if (result === undefined) throw new Error("Unexpected undefined");
        }

        const endTime = performance.now();
        const avgTime = (endTime - startTime) / iterations;

        // Each conversion should be well under 1ms
        expect(avgTime).toBeLessThan(PERFORMANCE_TARGET_MS);

        // Even 1000 iterations should complete quickly
        expect(endTime - startTime).toBeLessThan(10);
      });
    });

    it("convertFromInternalYear should execute in under 1ms", () => {
      const testCases = [-776, 1969, -1, 1, -3000, 2024, 0];

      // Warm up
      convertFromInternalYear(100);

      testCases.forEach((internalYear) => {
        const iterations = 1000;
        const startTime = performance.now();

        for (let i = 0; i < iterations; i++) {
          const result = convertFromInternalYear(internalYear);
          // Ensure result is used
          if (!result.era) throw new Error("Missing era");
        }

        const endTime = performance.now();
        const avgTime = (endTime - startTime) / iterations;

        expect(avgTime).toBeLessThan(PERFORMANCE_TARGET_MS);
        expect(endTime - startTime).toBeLessThan(10);
      });
    });
  });

  describe("Validation Functions", () => {
    it("isValidEraYear should execute in under 1ms", () => {
      const testCases = [
        { year: 776, era: "BC" as const },
        { year: 1969, era: "AD" as const },
        { year: 0, era: "AD" as const },
        { year: 5000, era: "BC" as const }, // Invalid
        { year: -100, era: "AD" as const }, // Invalid
      ];

      testCases.forEach(({ year, era }) => {
        const iterations = 1000;
        const startTime = performance.now();

        for (let i = 0; i < iterations; i++) {
          const valid = isValidEraYear(year, era);
          // Use result
          if (valid === undefined) throw new Error("Unexpected undefined");
        }

        const endTime = performance.now();
        const avgTime = (endTime - startTime) / iterations;

        expect(avgTime).toBeLessThan(PERFORMANCE_TARGET_MS);
      });
    });

    it("isAmbiguousYear should execute in under 1ms", () => {
      const testCases = [1, 100, 500, 1000, 1001, 2000, 50];

      testCases.forEach((year) => {
        const iterations = 1000;
        const startTime = performance.now();

        for (let i = 0; i < iterations; i++) {
          const ambiguous = isAmbiguousYear(year);
          // Use result
          if (ambiguous === undefined) throw new Error("Unexpected undefined");
        }

        const endTime = performance.now();
        const avgTime = (endTime - startTime) / iterations;

        expect(avgTime).toBeLessThan(PERFORMANCE_TARGET_MS);
      });
    });
  });

  describe("Utility Functions", () => {
    it("adjustYearWithinEra should execute in under 1ms", () => {
      const testCases = [
        { year: 500, era: "BC" as const, delta: 10 },
        { year: 500, era: "AD" as const, delta: -10 },
        { year: 10, era: "AD" as const, delta: -20 }, // Should clamp
        { year: 2990, era: "BC" as const, delta: 20 }, // Should clamp
      ];

      testCases.forEach(({ year, era, delta }) => {
        const iterations = 1000;
        const startTime = performance.now();

        for (let i = 0; i < iterations; i++) {
          const adjusted = adjustYearWithinEra(year, era, delta);
          // Use result
          if (adjusted < 0) throw new Error("Invalid adjustment");
        }

        const endTime = performance.now();
        const avgTime = (endTime - startTime) / iterations;

        expect(avgTime).toBeLessThan(PERFORMANCE_TARGET_MS);
      });
    });

    it("getEraYearRange should execute in under 1ms", () => {
      const eras: Array<"BC" | "AD"> = ["BC", "AD"];

      eras.forEach((era) => {
        const iterations = 1000;
        const startTime = performance.now();

        for (let i = 0; i < iterations; i++) {
          const range = getEraYearRange(era);
          // Use result
          if (range.min === undefined) throw new Error("Missing min");
        }

        const endTime = performance.now();
        const avgTime = (endTime - startTime) / iterations;

        expect(avgTime).toBeLessThan(PERFORMANCE_TARGET_MS);
      });
    });
  });

  describe("String Formatting Functions", () => {
    it("formatEraYear should execute in under 1ms", () => {
      const testCases = [
        { year: 776, era: "BC" as const },
        { year: 1969, era: "AD" as const },
        { year: 1, era: "BC" as const },
        { year: 2024, era: "AD" as const },
      ];

      testCases.forEach(({ year, era }) => {
        const iterations = 1000;
        const startTime = performance.now();

        for (let i = 0; i < iterations; i++) {
          const formatted = formatEraYear(year, era);
          // Use result
          if (!formatted.includes(era)) throw new Error("Format error");
        }

        const endTime = performance.now();
        const avgTime = (endTime - startTime) / iterations;

        expect(avgTime).toBeLessThan(PERFORMANCE_TARGET_MS);
      });
    });

    it("parseEraYearString should execute in under 1ms", () => {
      const testCases = [
        "776 BC",
        "1969 AD",
        "1 BC",
        "2024 AD",
        "100 BCE",
        "2000 CE",
        "invalid", // Should return null quickly
      ];

      testCases.forEach((input) => {
        const iterations = 1000;
        const startTime = performance.now();

        for (let i = 0; i < iterations; i++) {
          const parsed = parseEraYearString(input);
          // Use result (may be null)
          if (parsed && parsed.year < 0) throw new Error("Parse error");
        }

        const endTime = performance.now();
        const avgTime = (endTime - startTime) / iterations;

        // Regex parsing might be slightly slower but should still meet target
        expect(avgTime).toBeLessThan(
          PERFORMANCE_TARGET_MS * CI_THRESHOLD_MULTIPLIER,
        );
      });
    });
  });

  describe("Bulk Operations Performance", () => {
    it("should handle 10000 mixed operations efficiently", () => {
      const startTime = performance.now();

      // Simulate a mix of operations that might occur during gameplay
      for (let i = 0; i < 10000; i++) {
        const year = Math.floor(Math.random() * 2000) + 1;
        const era = i % 2 === 0 ? "BC" : "AD";

        // Convert to internal
        const internal = convertToInternalYear(year, era);

        // Validate
        const valid = isValidEraYear(year, era);

        // Format for display
        if (valid) {
          const formatted = formatEraYear(year, era);
          // Use formatted to prevent optimization
          if (!formatted) throw new Error("Format failed");
        }

        // Convert back
        const { year: convertedYear } = convertFromInternalYear(internal);

        // Adjust within bounds
        const adjusted = adjustYearWithinEra(convertedYear, era, 5);

        // Use final result
        if (adjusted < 0) throw new Error("Invalid result");
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // 10000 mixed operations should complete quickly
      // This simulates heavy usage during gameplay
      expect(duration).toBeLessThan(200); // 20 microseconds per operation average

      // Performance metrics: 10000 mixed operations completed in reasonable time
    });

    it("should maintain performance with edge cases", () => {
      const edgeCases = [
        { year: 0, era: "AD" as const },
        { year: 1, era: "BC" as const },
        { year: 1, era: "AD" as const },
        { year: 3000, era: "BC" as const },
        { year: 2024, era: "AD" as const },
      ];

      const iterations = 1000;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        edgeCases.forEach(({ year, era }) => {
          // Full conversion cycle
          const internal = convertToInternalYear(year, era);
          const { year: back, era: backEra } =
            convertFromInternalYear(internal);
          const formatted = formatEraYear(back, backEra);
          const valid = isValidEraYear(back, backEra);

          // Ensure all operations complete correctly
          if (!valid || !formatted) throw new Error("Edge case failed");
        });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Edge cases shouldn't significantly impact performance
      expect(duration).toBeLessThan(100);
    });
  });

  describe("Performance Regression Guards", () => {
    it("conversion functions should not allocate excessive memory", () => {
      // This test ensures functions don't create unnecessary objects
      const iterations = 10000;

      // Get initial memory if available (Node.js environment)
      const initialMemory = (
        global as { process?: { memoryUsage: () => { heapUsed: number } } }
      ).process?.memoryUsage?.()?.heapUsed;

      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        convertToInternalYear(776, "BC");
        convertFromInternalYear(-776);
        formatEraYear(776, "BC");
        isValidEraYear(776, "BC");
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete very quickly with minimal allocations
      expect(duration).toBeLessThan(100);

      if (initialMemory) {
        const finalMemory = (
          global as { process?: { memoryUsage: () => { heapUsed: number } } }
        ).process?.memoryUsage?.().heapUsed;
        if (finalMemory) {
          const memoryIncrease = finalMemory - initialMemory;

          // Memory increase should be minimal (allowing for some test overhead)
          // This guards against memory leaks or excessive allocations
          // Metric: Memory increase for 10000 operations should be < 10MB
          expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
        }
      }
    });
  });
});
