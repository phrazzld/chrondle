import { z } from "zod";

// Strike API response schemas
const ReceiveRequestResponseSchema = z.object({
  receiveRequestId: z.string(),
  bolt11: z
    .object({
      lnInvoice: z.string(),
      expiresAt: z.string().transform((str) => new Date(str).getTime()),
    })
    .optional(),
  onchain: z
    .object({
      address: z.string(),
    })
    .optional(),
});

const InvoiceResponseSchema = z.object({
  invoiceId: z.string(),
  state: z.enum(["UNPAID", "PAID", "CANCELLED"]),
  amount: z.object({
    currency: z.string(),
    amount: z.string(),
  }),
  correlationId: z.string().optional(),
});

const QuoteResponseSchema = z.object({
  lnInvoice: z.string(),
  expiration: z.string().transform((str) => new Date(str).getTime()),
});

// Request parameter types
export interface CreateReceiveRequestParams {
  amount?: {
    currency: "BTC" | "USD";
    amount: string;
  };
  bolt11?: object; // {} for Lightning support
  onchain?: object; // {} for on-chain support
}

export interface CreateInvoiceParams {
  amount: {
    currency: "BTC" | "USD";
    amount: string;
  };
  correlationId?: string;
  description?: string;
}

// Custom error types
export class StrikeAPIError extends Error {
  constructor(
    public status: number,
    public response: string,
    message = `Strike API error: ${status}`,
  ) {
    super(message);
    this.name = "StrikeAPIError";
  }
}

export class RateLimitError extends StrikeAPIError {
  constructor() {
    super(429, "Rate limited", "Strike API rate limit exceeded");
    this.name = "RateLimitError";
  }
}

/**
 * Strike API client for Bitcoin Lightning payments
 * Handles rate limits, errors, and response validation
 */
export class StrikeClient {
  constructor(
    private apiKey: string,
    private webhookSecret: string,
    private baseUrl = "https://api.strike.me",
  ) {
    if (!apiKey) {
      throw new Error("Strike API key is required");
    }
    // Allow empty webhook secret for webhook verification testing
    // The verification method will handle empty secrets gracefully
  }

  /**
   * Create a receive request for Lightning donations
   * Supports both fixed amounts and open-amount (pay-what-you-want)
   */
  async createReceiveRequest(params: CreateReceiveRequestParams) {
    const response = await this.makeRequest("/v1/receive-requests", {
      method: "POST",
      body: JSON.stringify(params),
    });

    return ReceiveRequestResponseSchema.parse(response);
  }

  /**
   * Create an invoice for fixed-amount payments
   */
  async createInvoice(params: CreateInvoiceParams) {
    const response = await this.makeRequest("/v1/invoices", {
      method: "POST",
      body: JSON.stringify(params),
    });

    return InvoiceResponseSchema.parse(response);
  }

  /**
   * Create a quote to get Lightning invoice for an existing invoice
   */
  async createInvoiceQuote(invoiceId: string, idempotencyKey?: string) {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }

    const response = await this.makeRequest(`/v1/invoices/${invoiceId}/quote`, {
      method: "POST",
      headers,
    });

    return QuoteResponseSchema.parse(response);
  }

  /**
   * Get invoice details and current state
   */
  async getInvoice(invoiceId: string) {
    const response = await this.makeRequest(`/v1/invoices/${invoiceId}`, {
      method: "GET",
    });

    return InvoiceResponseSchema.parse(response);
  }

  /**
   * Verify webhook signature using HMAC-SHA256
   * Uses Web Crypto API (polyfilled in Node.js environments)
   */
  async verifyWebhookSignature(payload: string, signature: string): Promise<boolean> {
    if (!signature) {
      return false;
    }

    // Handle missing webhook secret gracefully
    if (!this.webhookSecret) {
      console.error("Missing webhook secret for signature verification");
      return false;
    }

    try {
      // Remove 'sha256=' prefix if present
      const cleanSignature = signature.replace(/^sha256=/, "");

      // Validate hex string format (must be lowercase)
      if (!/^[a-f0-9]+$/.test(cleanSignature)) {
        return false;
      }

      // Use Web Crypto API (works in browser and Node.js with polyfill)
      const key = await globalThis.crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(this.webhookSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );

      // Compute HMAC signature
      const signatureBuffer = await globalThis.crypto.subtle.sign(
        "HMAC",
        key,
        new TextEncoder().encode(payload),
      );

      // Convert to hex string
      const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      // Simple comparison (timing-safe comparison would be better for production)
      return expectedSignature === cleanSignature;
    } catch (error) {
      console.error("Error verifying Strike webhook signature:", error);
      return false;
    }
  }

  /**
   * Internal method to make HTTP requests to Strike API
   * Handles authentication, rate limits, and error responses
   */
  private async makeRequest(endpoint: string, options: RequestInit) {
    const url = `${this.baseUrl}${endpoint}`;

    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle rate limiting
      if (response.status === 429) {
        throw new RateLimitError();
      }

      // Handle other HTTP errors
      if (!response.ok) {
        const errorText = await response.text();
        throw new StrikeAPIError(response.status, errorText);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof StrikeAPIError || error instanceof RateLimitError) {
        throw error;
      }

      // Network or other errors
      throw new Error(`Strike API request failed: ${error}`);
    }
  }
}

/**
 * Create Strike client instance from environment variables
 * Used by Convex backend functions
 */
export function createStrikeClient(): StrikeClient {
  const apiKey = process.env.STRIKE_API_KEY;
  const webhookSecret = process.env.STRIKE_WEBHOOK_SECRET;
  const environment = process.env.STRIKE_ENVIRONMENT || "production";

  if (!apiKey) {
    throw new Error("STRIKE_API_KEY environment variable is required");
  }

  if (!webhookSecret) {
    throw new Error("STRIKE_WEBHOOK_SECRET environment variable is required");
  }

  const baseUrl = environment === "sandbox" ? "https://api.dev.strike.me" : "https://api.strike.me";

  return new StrikeClient(apiKey, webhookSecret, baseUrl);
}
