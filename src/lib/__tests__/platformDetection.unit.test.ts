import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  isMobileDevice,
  supportsWebShare,
  getShareStrategy,
  isTouchDevice,
  isTabletDevice,
  getPlatformInfo,
} from "../platformDetection";

// Store original values
const originalNavigator = globalThis.navigator;
const originalWindow = globalThis.window;

// Mock navigator and window for testing
const mockNavigator = (
  userAgent: string,
  hasShare = false,
  hasClipboard = false,
  maxTouchPoints = 0,
) => {
  Object.defineProperty(globalThis, "navigator", {
    value: {
      userAgent,
      share: hasShare ? vi.fn() : undefined,
      clipboard: hasClipboard ? { writeText: vi.fn() } : undefined,
      maxTouchPoints,
    },
    writable: true,
    configurable: true,
  });
};

const mockWindow = (isSecureContext = true, hasTouch = false) => {
  // Clear any existing touch properties first
  const windowObj: Record<string, unknown> = {
    isSecureContext,
  };

  if (hasTouch) {
    windowObj.ontouchstart = {};
  }

  Object.defineProperty(globalThis, "window", {
    value: windowObj,
    writable: true,
    configurable: true,
  });
};

describe("Platform Detection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original values
    Object.defineProperty(globalThis, "navigator", {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, "window", {
      value: originalWindow,
      writable: true,
      configurable: true,
    });
  });

  describe("isMobileDevice", () => {
    it("should return true for iPhone user agent", () => {
      mockNavigator(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15",
      );
      expect(isMobileDevice()).toBe(true);
    });

    it("should return true for iPad user agent", () => {
      mockNavigator(
        "Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15",
      );
      expect(isMobileDevice()).toBe(true);
    });

    it("should return true for Android phone user agent", () => {
      mockNavigator(
        "Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36",
      );
      expect(isMobileDevice()).toBe(true);
    });

    it("should return true for BlackBerry user agent", () => {
      mockNavigator(
        "Mozilla/5.0 (BlackBerry; U; BlackBerry 9900; en) AppleWebKit/534.11+",
      );
      expect(isMobileDevice()).toBe(true);
    });

    it("should return false for desktop Chrome user agent", () => {
      mockNavigator(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      );
      expect(isMobileDevice()).toBe(false);
    });

    it("should return false for desktop Firefox user agent", () => {
      mockNavigator(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
      );
      expect(isMobileDevice()).toBe(false);
    });

    it("should return false when navigator is undefined (SSR)", () => {
      expect(isMobileDevice()).toBe(false);
    });
  });

  describe("supportsWebShare", () => {
    it("should return true when Web Share API is available", () => {
      mockNavigator("test", true);
      expect(supportsWebShare()).toBe(true);
    });

    it("should return false when Web Share API is not available", () => {
      mockNavigator("test", false);
      expect(supportsWebShare()).toBe(false);
    });

    it("should return false when navigator is undefined", () => {
      expect(supportsWebShare()).toBe(false);
    });
  });

  describe("getShareStrategy", () => {
    it('should return "native" for mobile device with Web Share API', () => {
      mockNavigator(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)",
        true,
      );
      expect(getShareStrategy()).toBe("native");
    });

    it('should return "clipboard" for desktop with clipboard API', () => {
      mockNavigator(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        false,
        true,
      );
      mockWindow(true);
      expect(getShareStrategy()).toBe("clipboard");
    });

    it('should return "fallback" for desktop without clipboard API', () => {
      mockNavigator(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        false,
        false,
      );
      mockWindow(false);
      expect(getShareStrategy()).toBe("fallback");
    });

    it('should return "clipboard" for desktop Chrome with Web Share (poor UX)', () => {
      // Desktop Chrome has Web Share but we want clipboard instead
      mockNavigator(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        true,
        true,
      );
      mockWindow(true);
      expect(getShareStrategy()).toBe("clipboard");
    });

    it('should return "clipboard" for mobile without Web Share API', () => {
      mockNavigator(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X)",
        false,
        true,
      );
      mockWindow(true);
      expect(getShareStrategy()).toBe("clipboard");
    });
  });

  describe("isTouchDevice", () => {
    it("should return true when ontouchstart is available", () => {
      mockWindow(true, true);
      expect(isTouchDevice()).toBe(true);
    });

    it("should return true when maxTouchPoints > 0", () => {
      mockNavigator("test", false, false, 1);
      mockWindow(true, false);
      expect(isTouchDevice()).toBe(true);
    });

    it("should return false when no touch support", () => {
      mockNavigator("test", false, false, 0);
      mockWindow(true, false);
      expect(isTouchDevice()).toBe(false);
    });

    it("should return false when window is undefined (SSR)", () => {
      // Clear window entirely to simulate SSR
      delete (globalThis as Record<string, unknown>).window;
      expect(isTouchDevice()).toBe(false);
    });
  });

  describe("isTabletDevice", () => {
    it("should return true for iPad user agent", () => {
      mockNavigator(
        "Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15",
      );
      expect(isTabletDevice()).toBe(true);
    });

    it("should return true for Android tablet user agent", () => {
      mockNavigator(
        "Mozilla/5.0 (Linux; Android 11; SM-T870) AppleWebKit/537.36",
      );
      expect(isTabletDevice()).toBe(true);
    });

    it("should return false for Android phone user agent", () => {
      mockNavigator(
        "Mozilla/5.0 (Linux; Android 11; SM-G991B Mobile) AppleWebKit/537.36",
      );
      expect(isTabletDevice()).toBe(false);
    });

    it("should return false for iPhone user agent", () => {
      mockNavigator("Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)");
      expect(isTabletDevice()).toBe(false);
    });

    it("should return false for desktop user agent", () => {
      mockNavigator(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      );
      expect(isTabletDevice()).toBe(false);
    });
  });

  describe("getPlatformInfo", () => {
    it("should return complete platform information for iPhone", () => {
      mockNavigator(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)",
        true,
        false,
        5,
      );
      mockWindow(true, true);

      const info = getPlatformInfo();

      expect(info).toEqual({
        isMobile: true,
        isTablet: false,
        isTouch: true,
        supportsWebShare: true,
        strategy: "native",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)",
      });
    });

    it("should return complete platform information for desktop Chrome", () => {
      mockNavigator(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        true,
        true,
        0,
      );
      mockWindow(true, false);

      const info = getPlatformInfo();

      expect(info).toEqual({
        isMobile: false,
        isTablet: false,
        isTouch: false,
        supportsWebShare: true,
        strategy: "clipboard",
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      });
    });

    it("should handle SSR environment", () => {
      // Clear navigator and window to simulate SSR
      delete (globalThis as Record<string, unknown>).navigator;
      delete (globalThis as Record<string, unknown>).window;

      const info = getPlatformInfo();

      expect(info).toEqual({
        isMobile: false,
        isTablet: false,
        isTouch: false,
        supportsWebShare: false,
        strategy: "fallback",
        userAgent: "SSR",
      });
    });
  });

  describe("Edge cases and real-world scenarios", () => {
    it("should handle malformed user agent strings", () => {
      mockNavigator("");
      expect(isMobileDevice()).toBe(false);
      expect(isTabletDevice()).toBe(false);
    });

    it("should prioritize mobile detection over Web Share availability", () => {
      // Mobile device without Web Share should use clipboard, not native
      mockNavigator(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X)",
        false,
        true,
      );
      mockWindow(true);
      expect(getShareStrategy()).toBe("clipboard");
    });

    it("should handle partial API support gracefully", () => {
      // Navigator exists but share function is not a function
      Object.defineProperty(global, "navigator", {
        value: {
          userAgent: "test",
          share: "not a function",
        },
        writable: true,
      });

      expect(supportsWebShare()).toBe(false);
    });
  });
});
