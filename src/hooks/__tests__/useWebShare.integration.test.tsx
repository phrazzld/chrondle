import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWebShare } from "../useWebShare";

// Mock functions
const mockShare = vi.fn();
const mockWriteText = vi.fn();

describe("useWebShare", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Ensure DOM body exists and is clean
    document.body.innerHTML = "";

    // Reset to default state with Web Share API available
    Object.defineProperty(global, "navigator", {
      value: {
        share: mockShare,
        clipboard: {
          writeText: mockWriteText,
        },
      },
      writable: true,
    });

    Object.defineProperty(global, "window", {
      value: {
        isSecureContext: true,
      },
      writable: true,
    });
  });

  describe("canShare detection", () => {
    it("should detect Web Share API availability", () => {
      const { result } = renderHook(() => useWebShare(), {
        container: document.body.appendChild(document.createElement("div")),
      });
      expect(result.current.canShare).toBe(true);
    });

    it("should handle missing Web Share API", () => {
      Object.defineProperty(global, "navigator", {
        value: { clipboard: { writeText: mockWriteText } },
        writable: true,
      });

      const { result } = renderHook(() => useWebShare());
      expect(result.current.canShare).toBe(false);
    });
  });

  describe("share functionality", () => {
    it("should use Web Share API when available", async () => {
      const testText =
        "Chrondle: July 7, 2025 - 3/6\n🎯 ♨️ 🔥\n\nhttps://www.chrondle.app";
      mockShare.mockResolvedValue(undefined);

      const { result } = renderHook(() => useWebShare());

      await act(async () => {
        const success = await result.current.share(testText);
        expect(success).toBe(true);
      });

      expect(mockShare).toHaveBeenCalledWith({
        text: testText,
        title: "Chrondle",
      });
      expect(result.current.shareMethod).toBe("webshare");
      expect(result.current.lastShareSuccess).toBe(true);
    });

    it("should preserve emojis and special characters in Web Share API", async () => {
      const testText =
        "Chrondle: July 7, 2025 - 3/6 🎯\nCivil rights movement begins\n\n🎯 ♨️ 🔥\n\nhttps://www.chrondle.app";
      mockShare.mockResolvedValue(undefined);

      const { result } = renderHook(() => useWebShare());

      await act(async () => {
        await result.current.share(testText);
      });

      expect(mockShare).toHaveBeenCalledWith({
        text: testText,
        title: "Chrondle",
      });

      // Verify the exact text was passed without encoding
      const callArgs = mockShare.mock.calls[0][0];
      expect(callArgs.text).toContain("🎯");
      expect(callArgs.text).toContain("♨️");
      expect(callArgs.text).toContain("🔥");
      expect(callArgs.text).not.toContain("%");
      expect(callArgs.text).not.toContain("20%");
    });

    it("should fall back to clipboard when Web Share API fails", async () => {
      const testText = "Test share text";
      mockShare.mockRejectedValue(new Error("Web Share failed"));
      mockWriteText.mockResolvedValue(undefined);

      const { result } = renderHook(() => useWebShare());

      await act(async () => {
        const success = await result.current.share(testText);
        expect(success).toBe(true);
      });

      expect(mockShare).toHaveBeenCalled();
      expect(mockWriteText).toHaveBeenCalledWith(testText);
      expect(result.current.shareMethod).toBe("clipboard");
    });

    it("should use clipboard when Web Share API is not available", async () => {
      Object.defineProperty(global, "navigator", {
        value: {
          clipboard: {
            writeText: mockWriteText.mockResolvedValue(undefined),
          },
        },
        writable: true,
      });

      const testText = "Test share text";
      const { result } = renderHook(() => useWebShare());

      await act(async () => {
        const success = await result.current.share(testText);
        expect(success).toBe(true);
      });

      expect(result.current.shareMethod).toBe("clipboard");
    });

    it("should fall back to execCommand when clipboard API is not available", async () => {
      Object.defineProperty(global, "navigator", {
        value: {},
        writable: true,
      });
      Object.defineProperty(global, "window", {
        value: {
          isSecureContext: false,
        },
        writable: true,
      });

      // Mock document.execCommand as it doesn't exist in jsdom
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (document as any).execCommand = vi.fn().mockReturnValue(true);

      const testText = "Test share text";
      const { result } = renderHook(() => useWebShare());

      await act(async () => {
        const success = await result.current.share(testText);
        expect(success).toBe(true);
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((document as any).execCommand).toHaveBeenCalledWith("copy");
      expect(result.current.shareMethod).toBe("clipboard");
    });

    it("should handle complete failure gracefully", async () => {
      Object.defineProperty(global, "navigator", {
        value: {},
        writable: true,
      });
      Object.defineProperty(global, "window", {
        value: {
          isSecureContext: false,
        },
        writable: true,
      });

      // Mock document.execCommand to return false (failure)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (document as any).execCommand = vi.fn().mockReturnValue(false);

      const testText = "Test share text";
      const { result } = renderHook(() => useWebShare());

      await act(async () => {
        const success = await result.current.share(testText);
        expect(success).toBe(false);
      });

      expect(result.current.lastShareSuccess).toBe(false);
    });
  });

  describe("state management", () => {
    it("should track sharing state correctly", async () => {
      const testText = "Test share text";
      mockShare.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );

      const { result } = renderHook(() => useWebShare());

      expect(result.current.isSharing).toBe(false);

      act(() => {
        result.current.share(testText);
      });

      expect(result.current.isSharing).toBe(true);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
      });

      expect(result.current.isSharing).toBe(false);
    });

    it("should reset sharing state on error", async () => {
      const testText = "Test share text";
      mockShare.mockRejectedValue(new Error("Share failed"));

      // Also make clipboard fail by removing it
      Object.defineProperty(global, "navigator", {
        value: {
          share: mockShare,
        },
        writable: true,
      });

      const { result } = renderHook(() => useWebShare());

      await act(async () => {
        await result.current.share(testText);
      });

      expect(result.current.isSharing).toBe(false);
      expect(result.current.lastShareSuccess).toBe(false);
    });
  });
});
