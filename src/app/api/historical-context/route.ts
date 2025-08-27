// API Route for Historical Context Generation
// Next.js 13+ App Router API Route
// Integrates with OpenRouter service for actual AI context generation

import { NextRequest, NextResponse } from "next/server";
import { validateServerEnvironment, getOpenRouterApiKey } from "@/lib/env";
import { AI_CONFIG } from "@/lib/constants";
import { createTimeoutSignal } from "@/lib/fetch-utils";
import {
  checkRateLimit,
  getClientIP,
  createRateLimitHeaders,
  HISTORICAL_CONTEXT_RATE_LIMIT,
} from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
  console.error("[API] Historical context request received");
  const startTime = Date.now();

  try {
    // Security: Rate limiting check first (skip in test environment)
    let rateLimitResult = null;
    if (process.env.NODE_ENV !== "test") {
      const clientIP = getClientIP(request);
      rateLimitResult = checkRateLimit(clientIP, HISTORICAL_CONTEXT_RATE_LIMIT);

      if (!rateLimitResult.isAllowed) {
        console.error("[API] Rate limit exceeded for IP:", clientIP);
        return NextResponse.json(
          { error: rateLimitResult.message },
          {
            status: 429,
            headers: createRateLimitHeaders(rateLimitResult),
          },
        );
      }
    }

    // Validate environment
    console.error("[API] Validating environment...");

    // Check if API key exists at all
    if (!process.env.OPENROUTER_API_KEY) {
      console.error(
        "[API] CRITICAL: OPENROUTER_API_KEY not found in environment variables!",
      );
      console.error(
        "[API] Please add OPENROUTER_API_KEY to your .env.local file",
      );
      console.error("[API] You can get an API key from https://openrouter.ai/");
      return NextResponse.json(
        {
          error:
            "Historical context generation is not configured. Please check server logs.",
        },
        { status: 500 },
      );
    }

    validateServerEnvironment();
    const apiKey = getOpenRouterApiKey();
    console.error(
      "[API] API Key configured:",
      !!apiKey,
      "Key starts with:",
      apiKey?.substring(0, 7) + "...",
    );

    // Parse request body
    let body;
    try {
      body = await request.json();
      console.error("[API] Request body parsed successfully");
    } catch (parseError) {
      console.error("[API] Failed to parse request body:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    if (!body) {
      console.error("[API] Request body is empty");
      return NextResponse.json(
        { error: "Request body is required" },
        { status: 400 },
      );
    }

    const { year, events } = body;
    console.error(
      "[API] Request data - Year:",
      year,
      "Events count:",
      events?.length,
    );

    // Basic validation
    if (typeof year !== "number" || isNaN(year)) {
      console.error("[API] Invalid year parameter:", year);
      return NextResponse.json(
        { error: "Year parameter is required and must be a number" },
        { status: 400 },
      );
    }

    if (!events || !Array.isArray(events) || events.length === 0) {
      console.error("[API] Invalid events parameter:", events);
      return NextResponse.json(
        { error: "Events parameter is required and must be a non-empty array" },
        { status: 400 },
      );
    }

    // Generate historical context using OpenRouter API
    const eventsText = events.join("; ");
    const prompt = AI_CONFIG.CONTEXT_PROMPT_TEMPLATE.replace(
      "{year}",
      year.toString(),
    ).replace("{events}", eventsText);

    console.error("[API] Prompt constructed, length:", prompt.length);
    console.error("[API] Using model:", AI_CONFIG.MODEL);
    console.error("[API] Max tokens:", AI_CONFIG.MAX_TOKENS);
    console.error("[API] Temperature:", AI_CONFIG.TEMPERATURE);

    // Create timeout signal compatible with all runtimes
    const [timeoutSignal, cleanupTimeout] = createTimeoutSignal(
      AI_CONFIG.REQUEST_TIMEOUT,
    );
    console.error(
      "[API] Timeout configured for:",
      AI_CONFIG.REQUEST_TIMEOUT,
      "ms",
    );

    let openRouterResponse;
    const requestStartTime = Date.now();
    console.error("[API] Calling OpenRouter API...");

    try {
      openRouterResponse = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://chrondle.com", // Optional: Your site URL
            "X-Title": "Chrondle Historical Context", // Optional: Your app name
          },
          body: JSON.stringify({
            model: AI_CONFIG.MODEL,
            messages: [
              {
                role: "system",
                content: AI_CONFIG.SYSTEM_PROMPT,
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: AI_CONFIG.TEMPERATURE,
            max_tokens: AI_CONFIG.MAX_TOKENS,
          }),
          signal: timeoutSignal,
        },
      );

      // Clean up timeout on successful completion
      cleanupTimeout();
      console.error(
        "[API] OpenRouter API call completed in:",
        Date.now() - requestStartTime,
        "ms",
      );
      console.error("[API] Response status:", openRouterResponse.status);
    } catch (fetchError) {
      // Clean up timeout on any error
      cleanupTimeout();
      console.error("[API] OpenRouter fetch error:", fetchError);
      console.error(
        "[API] Request failed after:",
        Date.now() - requestStartTime,
        "ms",
      );
      throw fetchError;
    }

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      console.error("[API] OpenRouter API error:", openRouterResponse.status);
      console.error("[API] Error text:", errorText);
      console.error("[API] Full error details:", {
        status: openRouterResponse.status,
        statusText: openRouterResponse.statusText,
        headers: Object.fromEntries(openRouterResponse.headers.entries()),
      });
      return NextResponse.json(
        { error: "Failed to generate historical context from AI service" },
        { status: 502 },
      );
    }

    console.error("[API] Parsing OpenRouter response...");
    const openRouterData = await openRouterResponse.json();
    console.error("[API] Response structure:", {
      hasChoices: !!openRouterData?.choices,
      choicesLength: openRouterData?.choices?.length,
      hasFirstChoice: !!openRouterData?.choices?.[0],
      hasMessage: !!openRouterData?.choices?.[0]?.message,
      hasContent: !!openRouterData?.choices?.[0]?.message?.content,
    });

    const context = openRouterData.choices?.[0]?.message?.content;

    if (!context || typeof context !== "string") {
      console.error("[API] Invalid response structure from OpenRouter");
      console.error(
        "[API] Full response data:",
        JSON.stringify(openRouterData, null, 2),
      );
      return NextResponse.json(
        { error: "Invalid response from AI service" },
        { status: 502 },
      );
    }

    console.error("[API] Context received, length:", context.length);
    console.error(
      "[API] First 100 chars of context:",
      context.substring(0, 100) + "...",
    );

    // Prepare headers conditionally
    const responseHeaders = rateLimitResult
      ? createRateLimitHeaders(rateLimitResult)
      : {};

    const totalTime = Date.now() - startTime;
    console.error(
      "[API] Request successful, total processing time:",
      totalTime,
      "ms",
    );

    return NextResponse.json(
      {
        context: context.trim(),
        year,
        generatedAt: new Date().toISOString(),
        source: "openrouter-gemini",
      },
      {
        headers: responseHeaders,
      },
    );
  } catch (error) {
    console.error("Historical context API error:", error);

    // Handle timeout errors specifically
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { error: "Request timed out while generating context" },
        { status: 504 },
      );
    }

    return NextResponse.json(
      { error: "Failed to generate historical context" },
      { status: 500 },
    );
  }
}

// Only allow POST method
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST." },
    { status: 405 },
  );
}
