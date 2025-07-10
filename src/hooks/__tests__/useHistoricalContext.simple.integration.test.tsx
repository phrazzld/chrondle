// Simple tests for useHistoricalContext Hook
// Basic functionality tests to avoid memory issues

import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useHistoricalContext,
  useAIContextSettings,
} from "../useHistoricalContext";
import { openRouterService } from "@/lib/openrouter";
import type { AIContextResponse } from "@/lib/types/aiContext";

// Mock the OpenRouter service
vi.mock("@/lib/openrouter", () => ({
  openRouterService: {
    getHistoricalContext: vi.fn(),
  },
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    keys: () => Object.keys(store),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

function createMockAIResponse(year: number = 1969): AIContextResponse {
  return {
    context: `Historical context for ${year}`,
    year,
    generatedAt: "2024-01-01T00:00:00Z",
    source: "openrouter-gemini",
  };
}

describe("useHistoricalContext - Simple Tests", () => {
  const mockGetHistoricalContext = vi.mocked(
    openRouterService.getHistoricalContext,
  );

  beforeEach(() => {
    localStorageMock.clear();
    mockGetHistoricalContext.mockClear();
  });

  it("should initialize with correct default state", () => {
    const { result } = renderHook(() => useHistoricalContext());

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.enabled).toBe(true);
    expect(result.current.actions).toBeDefined();
  });

  it("should have all required action methods", () => {
    const { result } = renderHook(() => useHistoricalContext());

    expect(typeof result.current.actions.generateContext).toBe("function");
    expect(typeof result.current.actions.clearContext).toBe("function");
    expect(typeof result.current.actions.retryGeneration).toBe("function");
    expect(typeof result.current.actions.toggleEnabled).toBe("function");
  });

  it("should clear context when clearContext is called", () => {
    const { result } = renderHook(() => useHistoricalContext());

    act(() => {
      result.current.actions.clearContext();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should toggle enabled state", () => {
    const { result } = renderHook(() => useHistoricalContext());

    expect(result.current.enabled).toBe(true);

    act(() => {
      result.current.actions.toggleEnabled();
    });

    expect(result.current.enabled).toBe(false);

    act(() => {
      result.current.actions.toggleEnabled();
    });

    expect(result.current.enabled).toBe(true);
  });

  it("should generate context manually", async () => {
    const mockResponse = createMockAIResponse(1969);
    mockGetHistoricalContext.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useHistoricalContext());

    await act(async () => {
      await result.current.actions.generateContext(1969, ["Moon landing"]);
    });

    expect(mockGetHistoricalContext).toHaveBeenCalledWith(
      1969,
      ["Moon landing"],
      undefined,
    );
    expect(result.current.data).toEqual(mockResponse);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });
});

describe("useAIContextSettings - Simple Tests", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("should initialize with default enabled state", () => {
    const { result } = renderHook(() => useAIContextSettings());

    expect(result.current.enabled).toBe(true);
  });

  it("should toggle enabled state", () => {
    const { result } = renderHook(() => useAIContextSettings());

    act(() => {
      result.current.toggleEnabled();
    });

    expect(result.current.enabled).toBe(false);

    act(() => {
      result.current.toggleEnabled();
    });

    expect(result.current.enabled).toBe(true);
  });
});
