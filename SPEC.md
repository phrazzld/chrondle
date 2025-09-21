# SPEC: Strike Bitcoin Lightning Donation System

_"Simplicity is prerequisite for reliability." - Edsger W. Dijkstra_

## Requirements

### Functional (What it MUST do)

- [ ] **Invariant 1**: Every donation request MUST produce exactly one payment entity (Invoice OR ReceiveRequest)
- [ ] **Invariant 2**: Every webhook signature MUST be verified using constant-time HMAC-SHA256 comparison
- [ ] **Invariant 3**: Every payment state transition MUST be idempotent (duplicate webhooks cause no double-processing)
- [ ] **Invariant 4**: Lightning invoices MUST be presented as QR codes within 2 seconds of creation
- [ ] **Invariant 5**: Expired invoices MUST be regeneratable without losing donation context
- [ ] **Invariant 6**: Payment confirmation MUST update UI within 30 seconds of successful payment
- [ ] **Invariant 7**: BTC settlement MUST be configured for all payment flows

### Non-Functional (How well it must do it)

**Performance:**

- Invoice generation: < 2000ms end-to-end
- QR code rendering: < 100ms
- Webhook response: < 500ms (must return 200 before processing)
- Database write: < 50ms per donation record

**Security:**

- Zero API key exposure to frontend
- All webhooks verified before processing
- No sensitive data in client localStorage
- HTTPS-only webhook endpoints

**Reliability:**

- 99.9% webhook processing success rate
- Automatic retry on transient failures (429, 5xx)
- Graceful degradation on Strike API unavailability
- Zero data loss on concurrent webhook delivery

## Constraints

### Technical

- Next.js 15 App Router architecture
- Convex for database and backend logic (no direct DB access from Next.js)
- TypeScript strict mode compliance
- React 19 patterns (no class components)
- Existing Clerk webhook pattern as reference

### Resource

- Strike API rate limits (handle 429 gracefully)
- Quote expiration: 30s for cross-currency, 1h for BTC
- Receive request default expiration: 24h
- Maximum payload size: 10KB for webhooks

### Business

- BTC settlement only (no fiat settlement)
- Donations only (no goods/services exchange)
- Anonymous donors (no KYC requirements)
- Global accessibility (Lightning primary, on-chain fallback)

## Data Model

```typescript
// Convex schema additions
donations: defineTable({
  // Identity
  id: v.id("donations"),
  kind: v.union(v.literal("receive_request"), v.literal("invoice")),
  strikeEntityId: v.string(), // receiveRequestId or invoiceId

  // Payment Details
  lnInvoice: v.optional(v.string()), // Bolt11 string
  btcAddress: v.optional(v.string()), // On-chain fallback
  requestedAmount: v.optional(v.number()), // Can be null for open-amount
  requestedCurrency: v.union(v.literal("BTC"), v.literal("USD")),
  settlementCurrency: v.literal("BTC"),

  // State Machine
  state: v.union(
    v.literal("CREATED"),
    v.literal("PENDING"),
    v.literal("PAID"),
    v.literal("EXPIRED"),
    v.literal("FAILED")
  ),

  // Metadata
  correlationId: v.string(), // For idempotency
  payerNote: v.optional(v.string()),
  expiresAt: v.number(), // Unix timestamp
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_strike_id", ["strikeEntityId"])
  .index("by_correlation", ["correlationId"])
  .index("by_state", ["state"])
  .index("by_expiry", ["expiresAt"]),

webhooks: defineTable({
  eventId: v.string(), // Strike's event ID
  eventType: v.string(), // e.g., "invoice.updated"
  entityId: v.string(), // Related Strike entity
  payload: v.string(), // Raw JSON for replay
  signature: v.string(), // For audit
  processedAt: v.optional(v.number()),
  attempts: v.number(),
  status: v.union(v.literal("pending"), v.literal("processed"), v.literal("failed")),
})
  .index("by_event", ["eventId"]) // For idempotency
  .index("by_entity", ["entityId"])
  .index("by_status", ["status"])
```

## Implementation Strategy

### Phase 1: Core Functionality

#### 1.1 Convex HTTP Endpoints

```typescript
// convex/http.ts
import { httpRouter } from "convex/server";
import { strikeWebhook } from "./strikeWebhook";

const http = httpRouter();
http.route({
  path: "/webhooks/strike",
  method: "POST",
  handler: strikeWebhook,
});

export default http;
```

#### 1.2 Webhook Verification

```typescript
// convex/strikeWebhook.ts
export const strikeWebhook = httpAction(async (ctx, request) => {
  // 1. Extract raw body BEFORE parsing
  const rawBody = await request.text();

  // 2. Verify signature immediately
  const signature = request.headers.get("X-Webhook-Signature");
  if (!verifyStrikeSignature(rawBody, signature)) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 3. Parse and validate
  const event = JSON.parse(rawBody);

  // 4. Check idempotency
  const existing = await ctx.runQuery(internal.webhooks.getByEventId, {
    eventId: event.id,
  });

  if (existing) {
    return new Response("Already processed", { status: 200 });
  }

  // 5. Store for async processing
  await ctx.runMutation(internal.webhooks.enqueue, {
    eventId: event.id,
    eventType: event.type,
    entityId: event.entityId,
    payload: rawBody,
    signature,
  });

  // 6. Return immediately
  return new Response("Accepted", { status: 200 });
});
```

#### 1.3 Payment Flow Implementation

```typescript
// convex/donations.ts
export const createDonation = mutation({
  args: {
    amount: v.optional(v.number()),
    currency: v.union(v.literal("BTC"), v.literal("USD")),
    railPreference: v.union(v.literal("LN"), v.literal("ONCHAIN"), v.literal("BOTH")),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Generate correlation ID
    const correlationId = generateCorrelationId();

    // 2. Call Strike API (server-side only)
    const strikeResponse = await createReceiveRequest({
      amount: args.amount ? { currency: args.currency, amount: String(args.amount) } : undefined,
      bolt11: args.railPreference !== "ONCHAIN" ? {} : undefined,
      onchain: args.railPreference !== "LN" ? {} : undefined,
    });

    // 3. Store donation record
    const donationId = await ctx.db.insert("donations", {
      kind: "receive_request",
      strikeEntityId: strikeResponse.receiveRequestId,
      lnInvoice: strikeResponse.bolt11?.lnInvoice,
      btcAddress: strikeResponse.onchain?.address,
      requestedAmount: args.amount,
      requestedCurrency: args.currency,
      settlementCurrency: "BTC",
      state: "CREATED",
      correlationId,
      payerNote: args.note,
      expiresAt: strikeResponse.expiresAt,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return {
      donationId,
      lnInvoice: strikeResponse.bolt11?.lnInvoice,
      btcAddress: strikeResponse.onchain?.address,
      expiresAt: strikeResponse.expiresAt,
    };
  },
});
```

### Phase 2: Hardening

#### 2.1 Webhook Processing

```typescript
// convex/webhooks.ts
export const processWebhook = internalMutation({
  args: { webhookId: v.id("webhooks") },
  handler: async (ctx, args) => {
    const webhook = await ctx.db.get(args.webhookId);
    if (!webhook || webhook.status !== "pending") return;

    try {
      const event = JSON.parse(webhook.payload);

      // Handle based on event type
      if (event.type === "invoice.updated") {
        // Fetch latest state from Strike
        const invoice = await getInvoice(event.entityId);

        // Update donation state
        await ctx.db.patch(
          // Find by strikeEntityId
          await ctx.db
            .query("donations")
            .withIndex("by_strike_id", (q) => q.eq("strikeEntityId", event.entityId))
            .first()._id,
          {
            state: mapStrikeStateToInternal(invoice.state),
            updatedAt: Date.now(),
          },
        );
      }

      // Mark webhook processed
      await ctx.db.patch(webhook._id, {
        processedAt: Date.now(),
        status: "processed",
      });
    } catch (error) {
      // Increment attempts, mark failed after 3
      await ctx.db.patch(webhook._id, {
        attempts: webhook.attempts + 1,
        status: webhook.attempts >= 2 ? "failed" : "pending",
      });
      throw error; // For monitoring
    }
  },
});
```

#### 2.2 Strike Client Module

```typescript
// lib/strike-client.ts
import { z } from "zod";

const ReceiveRequestSchema = z.object({
  receiveRequestId: z.string(),
  bolt11: z
    .object({
      lnInvoice: z.string(),
      expiresAt: z.number(),
    })
    .optional(),
  onchain: z
    .object({
      address: z.string(),
    })
    .optional(),
});

class StrikeClient {
  constructor(
    private apiKey: string,
    private webhookSecret: string,
    private baseUrl = "https://api.strike.me",
  ) {}

  async createReceiveRequest(params: CreateReceiveRequestParams) {
    const response = await fetch(`${this.baseUrl}/v1/receive-requests`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new RateLimitError();
      }
      throw new StrikeAPIError(response.status, await response.text());
    }

    return ReceiveRequestSchema.parse(await response.json());
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const expectedSig = crypto
      .createHmac("sha256", this.webhookSecret)
      .update(payload, "utf8")
      .digest("hex");

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
  }
}
```

#### 2.3 Frontend Components

```typescript
// components/donation-modal.tsx
export function DonationModal() {
  const { mutate: createDonation, isLoading } = useConvexMutation(
    api.donations.createDonation
  );

  const [invoice, setInvoice] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);

  const handleDonate = async (amount?: number) => {
    const result = await createDonation({
      amount,
      currency: "USD",
      railPreference: "LN",
    });

    setInvoice(result.lnInvoice);
    setExpiresAt(result.expiresAt);
  };

  return (
    <>
      {!invoice ? (
        <DonationAmountSelector onSelect={handleDonate} />
      ) : (
        <PaymentQRCode
          invoice={invoice}
          expiresAt={expiresAt}
          onExpired={() => setInvoice(null)}
        />
      )}
    </>
  );
}

// components/payment-qr-code.tsx
export function PaymentQRCode({
  invoice,
  expiresAt
}: PaymentQRCodeProps) {
  const timeLeft = useCountdown(expiresAt);

  if (timeLeft <= 0) {
    return <ExpiredInvoice onRefresh={onExpired} />;
  }

  return (
    <div>
      <QRCodeCanvas value={invoice} size={256} />
      <CopyButton text={invoice} />
      <Timer seconds={timeLeft} />
    </div>
  );
}
```

## Success Criteria

### Correctness

- [ ] All webhook signatures pass verification
- [ ] No duplicate payment processing
- [ ] Expired invoices regenerate correctly
- [ ] State transitions are atomic and consistent

### Performance

- [ ] Invoice generation < 2s (p95)
- [ ] QR render < 100ms (p95)
- [ ] Webhook response < 500ms (p99)
- [ ] Zero dropped webhooks under normal load

### Security

- [ ] Zero API key exposure in client bundles
- [ ] All webhooks verified before processing
- [ ] No payment data in browser storage
- [ ] Constant-time signature comparison

### Reliability

- [ ] Handles Strike API 429/5xx gracefully
- [ ] Recovers from transient network failures
- [ ] Processes delayed webhooks correctly
- [ ] Maintains consistency under concurrent webhooks

## Validation Questions

**Can this fail silently?**

- Webhook verification failures log and alert
- Payment state transitions are auditable
- Expired invoices provide clear user feedback

**What happens at the boundaries?**

- Zero-amount invoices handled correctly
- Maximum amount limits enforced
- Expiration edge cases (clock skew) handled
- Concurrent webhook delivery maintains consistency

**Is this the simplest solution that works?**

- Single payment flow (receive requests) covers both use cases
- Webhook processing separate from response (fast ACK)
- State machine has minimal states
- No unnecessary abstractions

**Would Dijkstra approve?**

- Clear invariants that must hold
- Provable idempotency through correlation IDs
- Separation of concerns (webhook verification, processing, UI)
- No clever code, only correct code

---

_"Testing shows the presence, not the absence of bugs." - Edsger W. Dijkstra_

This specification defines precisely what must work, not what we wish would work.
