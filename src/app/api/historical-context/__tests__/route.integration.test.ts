// Tests for Historical Context API Route
// Following TDD approach: test the contract, not the implementation

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { POST, GET } from "../route";
import { NextRequest } from "next/server";

describe("Historical Context API Route", () => {
  const originalEnv = process.env;
  const mockFetch = vi.fn();

  beforeEach(() => {
    // Set up environment for tests
    process.env = {
      ...originalEnv,
      OPENROUTER_API_KEY: "test-api-key-12345",
    };

    // Mock global fetch for external API calls
    vi.stubGlobal("fetch", mockFetch);
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe("POST /api/historical-context", () => {
    it("should return historical context for valid request", async () => {
      // Mock OpenRouter API response with realistic content that passes validation
      const mockOpenRouterResponse = {
        choices: [
          {
            message: {
              content: `HISTORICAL CONTEXT
1969 represents a significant year in the late 1960s, marked by social upheaval, technological breakthroughs, and cultural transformation. This period sees important shifts in society as the counterculture movement gains momentum.

KEY EVENTS
The Apollo 11 mission achieves humanity's first moon landing in July, with Neil Armstrong and Buzz Aldrin walking on the lunar surface. This triumph fulfills President Kennedy's bold 1961 promise. The mission has enormous impact on American pride and scientific advancement. Meanwhile, the Woodstock Music & Art Fair in August brings together 400,000 people for three days of peace, love, and music. The festival features legendary performers like Jimi Hendrix and Janis Joplin. These events led to major cultural changes throughout society.

LASTING IMPACT
These events symbolize 1969's dual legacy of technological achievement and cultural revolution. The moon landing demonstrates human capability to overcome challenges, inspiring generations of scientists. Woodstock becomes the defining moment of the counterculture movement, influencing music and social attitudes. The consequence of these events shapes American culture for decades to come.`,
            },
          },
        ],
      };

      // Setup fetch mock to return realistic OpenRouter response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockOpenRouterResponse,
      });

      const requestData = {
        year: 1969,
        events: ["Moon landing", "Woodstock festival"],
      };

      const request = new NextRequest(
        "http://localhost:3000/api/historical-context",
        {
          method: "POST",
          body: JSON.stringify(requestData),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      // Verify the route processed the request correctly
      expect(response.status).toBe(200);
      expect(data.context).toBeTruthy();
      expect(data.context).toContain("1969");
      expect(data.context).toContain("moon landing");
      expect(data.year).toBe(1969);
      expect(data.generatedAt).toBeTruthy();
      expect(data.source).toBe("openrouter-gemini");

      // Verify fetch was called with correct parameters
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://openrouter.ai/api/v1/chat/completions",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer test-api-key-12345",
            "Content-Type": "application/json",
          }),
        }),
      );
    });

    it("should handle OpenRouter API failure", async () => {
      // Mock OpenRouter API error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => "Internal Server Error",
      });

      const requestData = {
        year: 1969,
        events: ["Moon landing", "Woodstock festival"],
      };

      const request = new NextRequest(
        "http://localhost:3000/api/historical-context",
        {
          method: "POST",
          body: JSON.stringify(requestData),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(502);
      expect(data.error).toBe(
        "Failed to generate historical context from AI service",
      );
    });

    it("should handle invalid OpenRouter API response", async () => {
      // Mock OpenRouter API with invalid response structure
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ invalid: "response" }),
      });

      const requestData = {
        year: 1969,
        events: ["Moon landing", "Woodstock festival"],
      };

      const request = new NextRequest(
        "http://localhost:3000/api/historical-context",
        {
          method: "POST",
          body: JSON.stringify(requestData),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(502);
      expect(data.error).toBe("Invalid response from AI service");
    });

    it("should reject request without year parameter", async () => {
      const requestData = {
        events: ["Some event"],
      };

      const request = new NextRequest(
        "http://localhost:3000/api/historical-context",
        {
          method: "POST",
          body: JSON.stringify(requestData),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe(
        "Year parameter is required and must be a number",
      );
    });

    it("should reject request with invalid year type", async () => {
      const requestData = {
        year: "1969",
        events: ["Some event"],
      };

      const request = new NextRequest(
        "http://localhost:3000/api/historical-context",
        {
          method: "POST",
          body: JSON.stringify(requestData),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe(
        "Year parameter is required and must be a number",
      );
    });

    it("should reject request without events parameter", async () => {
      const requestData = {
        year: 1969,
      };

      const request = new NextRequest(
        "http://localhost:3000/api/historical-context",
        {
          method: "POST",
          body: JSON.stringify(requestData),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe(
        "Events parameter is required and must be a non-empty array",
      );
    });

    it("should reject request with empty events array", async () => {
      const requestData = {
        year: 1969,
        events: [],
      };

      const request = new NextRequest(
        "http://localhost:3000/api/historical-context",
        {
          method: "POST",
          body: JSON.stringify(requestData),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe(
        "Events parameter is required and must be a non-empty array",
      );
    });

    it("should handle environment validation failure", async () => {
      // Remove API key to trigger validation failure
      delete process.env.OPENROUTER_API_KEY;

      const requestData = {
        year: 1969,
        events: ["Moon landing"],
      };

      const request = new NextRequest(
        "http://localhost:3000/api/historical-context",
        {
          method: "POST",
          body: JSON.stringify(requestData),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to generate historical context");
    });

    it("should handle request timeout (AbortError)", async () => {
      // Mock fetch to immediately reject with AbortError (simulating timeout)
      const abortError = new Error("The operation was aborted");
      abortError.name = "AbortError";
      mockFetch.mockRejectedValueOnce(abortError);

      const requestData = {
        year: 1969,
        events: ["Moon landing"],
      };

      const request = new NextRequest(
        "http://localhost:3000/api/historical-context",
        {
          method: "POST",
          body: JSON.stringify(requestData),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(504);
      expect(data.error).toBe("Request timed out while generating context");
    });

    it("should cleanup timeout on successful request", async () => {
      vi.useFakeTimers();
      const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          choices: [
            {
              message: {
                content: "Historical context for 1969",
              },
            },
          ],
        }),
      });

      const requestData = {
        year: 1969,
        events: ["Moon landing"],
      };

      const request = new NextRequest(
        "http://localhost:3000/api/historical-context",
        {
          method: "POST",
          body: JSON.stringify(requestData),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      await POST(request);

      expect(clearTimeoutSpy).toHaveBeenCalled();
      vi.useRealTimers();
    });
  });

  describe("GET /api/historical-context", () => {
    it("should reject GET method", async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(405);
      expect(data.error).toBe("Method not allowed. Use POST.");
    });
  });
});
