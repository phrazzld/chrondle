# TODO: Strike Bitcoin Lightning Donations

## Phase 1: Make it Work [✅ COMPLETED]

### Core Infrastructure

- [x] **Convex HTTP router setup** - `/webhooks/strike` endpoint
- [x] **Strike webhook signature verification** - HMAC-SHA256 with constant-time comparison
- [x] **Convex schema updates** - Add `donations` and `webhooks` tables
- [x] **Environment configuration** - `STRIKE_API_KEY`, `STRIKE_WEBHOOK_SECRET`

### Basic Payment Flow

- [x] **Strike API client** - `createReceiveRequest()` with error handling
- [x] **Donation creation mutation** - Server-side Strike call, return invoice
- [x] **Webhook processing** - Store raw event, check idempotency
- [x] **Payment QR component** - Display invoice as QR code with expiration
- [x] **Donation modal** - Amount selection and payment flow UI
- [x] **Real-time status** - Payment confirmation via Convex reactive queries

## Phase 2: Make it Right [Tomorrow]

### Resilience & UX

- [x] **Expiration handling** - Countdown timer, regenerate on expire
- [x] **Payment confirmation** - Real-time status updates via Convex
- [x] **Amount selection UI** - Fixed amounts + custom input
- [x] **Error boundaries** - Handle Strike API failures gracefully

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

**Phase 1 Complete When:** ✅ **DONE**

- ✅ Can generate Lightning invoice via UI
- ✅ Invoice displays as QR code with expiration timer
- ✅ Webhook endpoint receives Strike events with signature verification
- ✅ Payment state updates in database with real-time UI updates
- ✅ Complete donation flow: amount selection → payment → success confirmation

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
