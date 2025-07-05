// Test setup for Vitest
import { beforeEach, beforeAll, afterAll, vi } from "vitest";

// Mock localStorage for testing
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

// Mock crypto.randomUUID for consistent testing
const mockCrypto = {
  randomUUID: () => "test-uuid-1234-5678-9abc-def123456789",
};

beforeEach(() => {
  // Reset localStorage before each test
  localStorageMock.clear();

  // Setup global mocks
  Object.defineProperty(global, "localStorage", {
    value: localStorageMock,
    writable: true,
  });

  Object.defineProperty(global, "crypto", {
    value: mockCrypto,
    writable: true,
  });
});

// Optionally mock console during tests to reduce noise
if (process.env.QUIET_TESTS) {
  beforeAll(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "debug").mockImplementation(() => {});
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });
}

export { localStorageMock, mockCrypto };
