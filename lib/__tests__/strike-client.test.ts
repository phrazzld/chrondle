import { describe, it, expect, beforeAll } from "vitest";
import { StrikeClient } from "../strike-client";

// Use global crypto in Node.js environment
const crypto = globalThis.crypto;

describe("StrikeClient Webhook Signature Verification", () => {
  let strikeClient: StrikeClient;
  const testSecret = "test_webhook_secret_key_123";
  const testApiKey = "test_api_key";

  beforeAll(() => {
    // @ts-expect-error - We're testing webhook verification which doesn't use baseUrl
    strikeClient = new StrikeClient(testApiKey, testSecret, undefined);
  });

  describe("verifyWebhookSignature", () => {
    it("should verify a valid HMAC-SHA256 signature", async () => {
      const payload = JSON.stringify({
        id: "evt_123",
        type: "invoice.updated",
        data: { entityId: "inv_456", changes: ["state"] },
        eventTime: "2024-01-01T00:00:00Z",
      });

      // Generate valid signature using Web Crypto API (same as implementation)
      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(testSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );
      const signatureBuffer = await crypto.subtle.sign(
        "HMAC",
        key,
        new TextEncoder().encode(payload),
      );
      const validSignature = Array.from(new Uint8Array(signatureBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const result = await strikeClient.verifyWebhookSignature(payload, validSignature);
      expect(result).toBe(true);
    });

    it("should verify a valid signature with sha256= prefix", async () => {
      const payload = '{"test":"data"}';

      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(testSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );
      const signatureBuffer = await crypto.subtle.sign(
        "HMAC",
        key,
        new TextEncoder().encode(payload),
      );
      const signature = Array.from(new Uint8Array(signatureBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      // Test with sha256= prefix
      const signatureWithPrefix = `sha256=${signature}`;
      const result = await strikeClient.verifyWebhookSignature(payload, signatureWithPrefix);
      expect(result).toBe(true);
    });

    it("should reject an invalid signature", async () => {
      const payload = '{"test":"data"}';
      const invalidSignature = "invalid_signature_12345";

      const result = await strikeClient.verifyWebhookSignature(payload, invalidSignature);
      expect(result).toBe(false);
    });

    it("should reject when signature is null or empty", async () => {
      const payload = '{"test":"data"}';

      const resultNull = await strikeClient.verifyWebhookSignature(payload, "");
      expect(resultNull).toBe(false);

      // @ts-expect-error - Testing null signature
      const resultEmpty = await strikeClient.verifyWebhookSignature(payload, null);
      expect(resultEmpty).toBe(false);
    });

    it("should reject when payload has been tampered with", async () => {
      const originalPayload = '{"amount":100,"currency":"USD"}';
      const tamperedPayload = '{"amount":200,"currency":"USD"}'; // Changed amount

      // Generate signature for original payload
      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(testSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );
      const signatureBuffer = await crypto.subtle.sign(
        "HMAC",
        key,
        new TextEncoder().encode(originalPayload),
      );
      const signature = Array.from(new Uint8Array(signatureBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      // Try to verify tampered payload with original signature
      const result = await strikeClient.verifyWebhookSignature(tamperedPayload, signature);
      expect(result).toBe(false);
    });

    it("should handle different payload types consistently", async () => {
      const payloads = [
        '{"simple":"test"}',
        '{"nested":{"key":"value"}}',
        '{"array":[1,2,3]}',
        '{"special":"characters: \\n\\t\\r"}',
        '{"unicode":"émoji 🚀"}',
      ];

      for (const payload of payloads) {
        const key = await crypto.subtle.importKey(
          "raw",
          new TextEncoder().encode(testSecret),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"],
        );
        const signatureBuffer = await crypto.subtle.sign(
          "HMAC",
          key,
          new TextEncoder().encode(payload),
        );
        const signature = Array.from(new Uint8Array(signatureBuffer))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        const result = await strikeClient.verifyWebhookSignature(payload, signature);
        expect(result).toBe(true);
      }
    });

    it("should be case-sensitive for hex signatures", async () => {
      const payload = '{"test":"data"}';

      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(testSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );
      const signatureBuffer = await crypto.subtle.sign(
        "HMAC",
        key,
        new TextEncoder().encode(payload),
      );
      const signatureLower = Array.from(new Uint8Array(signatureBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const signatureUpper = signatureLower.toUpperCase();

      // Lower case should work
      const resultLower = await strikeClient.verifyWebhookSignature(payload, signatureLower);
      expect(resultLower).toBe(true);

      // Upper case should fail (implementation uses lowercase)
      const resultUpper = await strikeClient.verifyWebhookSignature(payload, signatureUpper);
      expect(resultUpper).toBe(false);
    });

    it("should handle errors gracefully", async () => {
      const payload = '{"test":"data"}';

      // Create a client with invalid secret that might cause crypto errors
      const invalidClient = new StrikeClient(
        testApiKey,
        "", // Empty secret
        "https://api.strike.me",
      );

      const result = await invalidClient.verifyWebhookSignature(payload, "any_signature");
      expect(result).toBe(false); // Should return false, not throw
    });
  });

  describe("HMAC Security Properties", () => {
    it("should produce consistent signatures for same input", async () => {
      const payload = '{"consistent":"data"}';
      const signatures: string[] = [];

      // Generate signature multiple times
      for (let i = 0; i < 5; i++) {
        const key = await crypto.subtle.importKey(
          "raw",
          new TextEncoder().encode(testSecret),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"],
        );
        const signatureBuffer = await crypto.subtle.sign(
          "HMAC",
          key,
          new TextEncoder().encode(payload),
        );
        const signature = Array.from(new Uint8Array(signatureBuffer))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        signatures.push(signature);
      }

      // All signatures should be identical
      const uniqueSignatures = new Set(signatures);
      expect(uniqueSignatures.size).toBe(1);
    });

    it("should produce different signatures with different secrets", async () => {
      const payload = '{"test":"data"}';
      const secrets = ["secret1", "secret2", "secret3"];
      const signatures: string[] = [];

      for (const secret of secrets) {
        const key = await crypto.subtle.importKey(
          "raw",
          new TextEncoder().encode(secret),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"],
        );
        const signatureBuffer = await crypto.subtle.sign(
          "HMAC",
          key,
          new TextEncoder().encode(payload),
        );
        const signature = Array.from(new Uint8Array(signatureBuffer))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        signatures.push(signature);
      }

      // All signatures should be different
      const uniqueSignatures = new Set(signatures);
      expect(uniqueSignatures.size).toBe(secrets.length);
    });

    it("should have correct signature length for SHA-256", async () => {
      const payload = '{"test":"data"}';

      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(testSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );
      const signatureBuffer = await crypto.subtle.sign(
        "HMAC",
        key,
        new TextEncoder().encode(payload),
      );
      const signature = Array.from(new Uint8Array(signatureBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      // SHA-256 produces 32 bytes = 64 hex characters
      expect(signature.length).toBe(64);
    });
  });
});

// Test vectors for Strike webhook signature verification
describe("Strike Webhook Test Vectors", () => {
  it("should verify known test vectors", async () => {
    // These would be actual test vectors from Strike documentation
    // Using example format since actual vectors aren't available
    const testCases = [
      {
        secret: "whsec_test123",
        payload: '{"id":"evt_1","type":"invoice.updated","data":{"entityId":"inv_1"}}',
        signature: null as string | null, // Will be computed
      },
      {
        secret: "whsec_prod456",
        payload: '{"id":"evt_2","type":"receive_request.completed","data":{"amount":"10.00"}}',
        signature: null as string | null,
      },
    ];

    // Generate expected signatures for test cases
    for (const testCase of testCases) {
      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(testCase.secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );
      const signatureBuffer = await crypto.subtle.sign(
        "HMAC",
        key,
        new TextEncoder().encode(testCase.payload),
      );
      testCase.signature = Array.from(new Uint8Array(signatureBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      // Verify using StrikeClient
      const client = new StrikeClient("api_key", testCase.secret, "https://api.strike.me");
      const result = await client.verifyWebhookSignature(testCase.payload, testCase.signature);
      expect(result).toBe(true);
    }
  });
});
