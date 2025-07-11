// Rate Limiter for API Endpoints
// Prevents abuse and cost overruns for OpenRouter API

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string; // Custom error message
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (simple implementation)
// For production scale, consider Redis or database storage
const rateLimitStore = new Map<string, RateLimitEntry>();

// Default configuration: 10 requests per 10 minutes per IP
const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 10 * 60 * 1000, // 10 minutes
  maxRequests: 10,
  message: "Too many requests. Please try again later.",
};

/**
 * Check if a request should be rate limited
 * @param identifier - Usually IP address or user identifier
 * @param config - Rate limiting configuration
 * @returns Object with isAllowed flag and remaining count
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG,
): {
  isAllowed: boolean;
  remaining: number;
  resetTime: number;
  message?: string;
} {
  const now = Date.now();
  const resetTime = now + config.windowMs;

  // Clean up expired entries periodically
  cleanupExpiredEntries(now);

  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    // No entry or window expired - create new entry
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime,
    };
    rateLimitStore.set(identifier, newEntry);

    return {
      isAllowed: true,
      remaining: config.maxRequests - 1,
      resetTime,
    };
  }

  // Entry exists and window is still active
  if (entry.count >= config.maxRequests) {
    // Rate limit exceeded
    return {
      isAllowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      message: config.message,
    };
  }

  // Increment count and allow request
  entry.count++;
  rateLimitStore.set(identifier, entry);

  return {
    isAllowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Get the client IP address from a request
 * Handles various proxy scenarios
 */
export function getClientIP(request: Request): string {
  // Check for forwarded IP from reverse proxy
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(",")[0].trim();
  }

  // Check for real IP header
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP.trim();
  }

  // Check for CF-Connecting-IP (Cloudflare)
  const cfIP = request.headers.get("cf-connecting-ip");
  if (cfIP) {
    return cfIP.trim();
  }

  // Fallback to a generic identifier
  return "unknown";
}

/**
 * Create rate limit headers for HTTP response
 */
export function createRateLimitHeaders(
  result: ReturnType<typeof checkRateLimit>,
): Record<string, string> {
  return {
    "X-RateLimit-Limit": DEFAULT_CONFIG.maxRequests.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": Math.ceil(result.resetTime / 1000).toString(), // Unix timestamp
  };
}

/**
 * Clean up expired rate limit entries to prevent memory leaks
 */
function cleanupExpiredEntries(now: number): void {
  // Run cleanup only occasionally to avoid performance impact
  if (Math.random() > 0.1) return; // 10% chance

  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Specialized rate limiter for historical context API
 * More restrictive limits due to AI service costs
 */
export const HISTORICAL_CONTEXT_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 60 * 1000, // 1 hour window
  maxRequests: 5, // Only 5 requests per hour per IP
  message:
    "Historical context rate limit exceeded. Please try again in an hour.",
};
