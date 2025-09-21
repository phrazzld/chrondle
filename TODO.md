# TODO: Strike Bitcoin Lightning Donations

## Phase 1: Make it Work [Today]

### Core Infrastructure (Ship in 4 hours)

- [ ] **Convex HTTP router setup** - `/webhooks/strike` endpoint
- [ ] **Strike webhook signature verification** - HMAC-SHA256 with constant-time comparison
- [ ] **Convex schema updates** - Add `donations` and `webhooks` tables
- [ ] **Environment configuration** - `STRIKE_API_KEY`, `STRIKE_WEBHOOK_SECRET`

### Basic Payment Flow (Ship in 4 hours)

- [ ] **Strike API client** - `createReceiveRequest()` with error handling
- [ ] **Donation creation mutation** - Server-side Strike call, return invoice
- [ ] **Webhook processing** - Store raw event, check idempotency
- [ ] **Basic QR component** - Display invoice as QR code

## Phase 2: Make it Right [Tomorrow]

### Resilience & UX

- [ ] **Expiration handling** - Countdown timer, regenerate on expire
- [ ] **Payment confirmation** - Real-time status updates via Convex
- [ ] **Amount selection UI** - Fixed amounts + custom input
- [ ] **Error boundaries** - Handle Strike API failures gracefully

### Testing & Validation

- [ ] **Webhook signature tests** - Verify HMAC implementation
- [ ] **Idempotency tests** - Duplicate webhook handling
- [ ] **Integration test** - Full payment flow in sandbox
- [ ] **Load test** - Concurrent webhook processing

## Phase 3: Make it Fast [If Needed]

### Optimization

- [ ] QR code memoization for performance
- [ ] Webhook queue with retry logic
- [ ] Response caching for rate limit handling
- [ ] Bundle size optimization for QR library

## Success Criteria

**Phase 1 Complete When:**

- Can generate Lightning invoice via UI
- Invoice displays as QR code
- Webhook endpoint receives Strike events
- Payment state updates in database

**Phase 2 Complete When:**

- Expired invoices auto-regenerate
- Users see payment confirmation < 30s
- All webhook signatures verified
- No duplicate payment processing

**Phase 3 Complete When:**

- QR renders < 100ms
- Webhook response < 500ms
- Handles 100 concurrent donations
- Bundle size impact < 50KB
