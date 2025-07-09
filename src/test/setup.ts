// Test setup for Vitest
import { beforeEach, afterEach, beforeAll, afterAll, vi } from "vitest";

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

// CARMACK FIX: Mock Notification API to prevent real timer creation
const mockNotification = vi.fn(() => ({
  close: vi.fn(),
  onclick: null,
}));

// Mock the Notification constructor and permission
Object.defineProperty(mockNotification, "permission", {
  value: "default",
  writable: true,
});

Object.defineProperty(mockNotification, "requestPermission", {
  value: vi.fn().mockResolvedValue("granted"),
  writable: true,
});

// Mock Web Notification API completely
Object.defineProperty(global, "Notification", {
  value: mockNotification,
  writable: true,
});

// Keep original timer functions for proper test execution

// Mock crypto.randomUUID for consistent testing
const mockCrypto = {
  randomUUID: () => "test-uuid-1234-5678-9abc-def123456789",
};

// Mock matchMedia for consistent testing and to prevent hanging
const mockMatchMedia = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(), // Deprecated
  removeListener: vi.fn(), // Deprecated
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

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

  // Mock matchMedia to prevent hanging in tests
  Object.defineProperty(window, "matchMedia", {
    value: mockMatchMedia,
    writable: true,
  });

  // Ensure DOM container exists for React Testing Library
  document.body.innerHTML = '<div id="root"></div>';
});

// COMPREHENSIVE CLEANUP: Force cleanup all resources after each test
afterEach(async () => {
  // CRITICAL FIX: Clean up notification service singleton and long-running timers
  try {
    const { __resetNotificationServiceForTesting } = await import(
      "@/lib/notifications"
    );
    if (typeof __resetNotificationServiceForTesting === "function") {
      __resetNotificationServiceForTesting();
    }
  } catch {
    // Notification service might not be initialized, ignore
  }

  // Clear all Vitest timers
  vi.clearAllTimers();

  // Clear any remaining timers (basic cleanup)

  // More aggressive timer cleanup for any missed timeouts/intervals
  if (typeof window !== "undefined") {
    // Clear all possible timer IDs (increased range for long-running timers)
    for (let i = 1; i < 10000; i++) {
      clearTimeout(i);
      clearInterval(i);
    }
  }

  // Clear all mocks to prevent accumulation
  vi.clearAllMocks();

  // Reset DOM to prevent memory leaks
  document.body.innerHTML = "";

  // Force any pending microtasks to complete
  await new Promise((resolve) => setTimeout(resolve, 0));

  // Force garbage collection if available (Node.js testing)
  if (global.gc) {
    global.gc();
  }
});

// GLOBAL CLEANUP: Force exit after all tests complete
afterAll(async () => {
  // CRITICAL: Final cleanup of notification service singleton
  try {
    const { __resetNotificationServiceForTesting } = await import(
      "@/lib/notifications"
    );
    if (typeof __resetNotificationServiceForTesting === "function") {
      __resetNotificationServiceForTesting();
    }
  } catch {
    // Ignore if service not available
  }

  // Final cleanup to ensure process exits
  vi.clearAllTimers();
  vi.clearAllMocks();
  vi.restoreAllMocks();

  // Final timer cleanup

  // Clear any remaining timers and intervals (extended range for notification timers)
  if (typeof window !== "undefined") {
    for (let i = 1; i < 10000; i++) {
      clearTimeout(i);
      clearInterval(i);
    }
  }

  // Force final garbage collection
  if (global.gc) {
    global.gc();
  }
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
