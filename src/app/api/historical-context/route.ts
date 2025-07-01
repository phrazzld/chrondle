// API Route for Historical Context Generation
// Next.js 13+ App Router API Route
// Integrates with OpenRouter service for actual AI context generation

import { NextRequest, NextResponse } from 'next/server';
import { validateServerEnvironment, getOpenRouterApiKey } from '@/lib/env';
import { AI_CONFIG } from '@/lib/constants';
import { validateHistoricalContext, createQualityReport } from '@/lib/aiValidation';

export async function POST(request: NextRequest) {
  try {
    // Validate environment first
    validateServerEnvironment();
    const apiKey = getOpenRouterApiKey();
    
    // Parse request body
    const body = await request.json();
    const { year, events } = body;
    
    // Basic validation
    if (!year || typeof year !== 'number') {
      return NextResponse.json(
        { error: 'Year parameter is required and must be a number' },
        { status: 400 }
      );
    }
    
    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: 'Events parameter is required and must be a non-empty array' },
        { status: 400 }
      );
    }
    
    // Generate historical context using OpenRouter API
    const eventsText = events.join('; ');
    const prompt = AI_CONFIG.CONTEXT_PROMPT_TEMPLATE
      .replace('{year}', year.toString())
      .replace('{events}', eventsText);
    
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://chrondle.com', // Optional: Your site URL
        'X-Title': 'Chrondle Historical Context', // Optional: Your app name
      },
      body: JSON.stringify({
        model: AI_CONFIG.MODEL,
        messages: [
          {
            role: 'system',
            content: AI_CONFIG.SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: AI_CONFIG.TEMPERATURE,
        max_tokens: AI_CONFIG.MAX_TOKENS,
      }),
      signal: AbortSignal.timeout(AI_CONFIG.REQUEST_TIMEOUT)
    });
    
    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      console.error(`OpenRouter API error: ${openRouterResponse.status} - ${errorText}`);
      return NextResponse.json(
        { error: 'Failed to generate historical context from AI service' },
        { status: 502 }
      );
    }
    
    const openRouterData = await openRouterResponse.json();
    const context = openRouterData.choices?.[0]?.message?.content;
    
    if (!context || typeof context !== 'string') {
      console.error('Invalid response from OpenRouter:', openRouterData);
      return NextResponse.json(
        { error: 'Invalid response from AI service' },
        { status: 502 }
      );
    }
    
    // Validate content quality
    const validation = validateHistoricalContext(context);
    
    // Log quality metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log('AI Content Quality Report:');
      console.log(createQualityReport(validation));
    }
    
    // Accept content if it meets basic standards, even if not perfect
    // This allows for some AI variability while maintaining quality
    if (validation.score < 50) {
      console.warn(`Low quality AI content (score: ${validation.score}):`, validation.issues);
      return NextResponse.json(
        { error: 'Generated content does not meet quality standards' },
        { status: 502 }
      );
    }
    
    return NextResponse.json({
      context: context.trim(),
      year,
      generatedAt: new Date().toISOString(),
      source: 'openrouter-gemini',
      // Include quality metrics in development
      ...(process.env.NODE_ENV === 'development' && {
        qualityScore: validation.score,
        validation: validation.metrics
      })
    });
    
  } catch (error) {
    console.error('Historical context API error:', error);
    
    // Handle timeout errors specifically
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json(
        { error: 'Request timed out while generating context' },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to generate historical context' },
      { status: 500 }
    );
  }
}

// Only allow POST method
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}