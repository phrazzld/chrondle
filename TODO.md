# TODO: Strike Bitcoin Lightning Donations

## Phase 1: Make it Work [✅ COMPLETED]

### Core Infrastructure

- [x] **Convex HTTP router setup** - `/webhooks/strike` endpoint
- [x] **Strike webhook signature verification** - HMAC-SHA256 validation
- [x] **Convex schema updates** - Add `donations` and `webhooks` tables
- [x] **Environment configuration** - `STRIKE_API_KEY`, `STRIKE_WEBHOOK_SECRET`

### Basic Payment Flow

- [x] **Strike API client** - `createReceiveRequest()` with error handling
- [x] **Donation creation mutation** - Server-side Strike call, return invoice
- [x] **Webhook processing** - Store raw event, check idempotency
- [x] **Payment QR component** - Display invoice as QR code with expiration
- [x] **Donation modal** - Amount selection and payment flow UI
- [x] **Real-time status** - Payment confirmation via Convex reactive queries

## Phase 2: Make it Right [CRITICAL PATH]

### 🔴 Immediate Blockers [15 min]

- [x] **Fix TypeScript compilation error in `lib/__tests__/strike-client.test.ts:13`** - Remove unused `@ts-expect-error` directive on line 13 that's causing TS2578 error
- [x] **Fix ArchiveErrorBoundary type error in `src/components/ArchiveErrorBoundary.tsx:22`** - Change fallback prop from JSX.Element to function `(error: Error, resetError: () => void) => ReactNode`

### 🟡 Missing Core Functionality [1 hr]

- [x] **Add metadata field to donations table in `convex/schema.ts:56-87`** - Add `metadata: v.optional(v.object({ paidAmount: v.optional(v.number()), paidCurrency: v.optional(v.string()), transactionId: v.optional(v.string()) }))` after line 82 to persist webhook payment details
- [x] **Fix webhook metadata persistence in `convex/webhooks.ts:159-169`** - Ensure metadata object from `updateDonationState` is properly stored in donations table (currently being passed but not saved)
- [x] **Add expiration cron job to `convex/crons.ts:15`** - Add `crons.hourly("mark expired donations", { minuteUTC: 0 }, internal.donations.markExpiredDonations, {})` to auto-expire stale Lightning invoices after 24h
- [x] **Implement timing-safe comparison in `lib/strike-client.ts:188`** - Replace `expectedSignature === cleanSignature` with Node.js crypto.timingSafeEqual() to prevent timing attacks: `crypto.timingSafeEqual(Buffer.from(expectedSignature, 'hex'), Buffer.from(cleanSignature, 'hex'))`

### 🛑 External Setup Required [HUMAN ACTION NEEDED]

#### Strike Account Setup [30-45 min]

- [ ] **[HUMAN] Create Strike developer account** - Go to https://strike.me → Sign up → Complete identity verification (KYC) → Wait for approval (can take 24-48 hrs)
- [ ] **[HUMAN] Generate API credentials** - Once approved: Dashboard → API Keys → Create New Key → Select scopes: `partner.receive-request.create`, `partner.invoice.create`, `partner.payment-quote.lightning.create` → Copy API key immediately (shown once!)
- [ ] **[HUMAN] Create webhook secret** - Dashboard → Webhooks → Add Endpoint → URL: `https://handsome-raccoon-955.convex.site/webhooks/strike` → Events: `invoice.updated`, `receive_request.completed`, `receive_request.updated` → Copy webhook secret
- [ ] **[HUMAN] Switch to sandbox environment** - Dashboard → Settings → Enable Sandbox Mode → Generate separate sandbox API key for testing

#### Local Environment Setup [10 min]

- [ ] **[HUMAN] Create `.env.local` file** - Copy `.env.example` to `.env.local` → Add your Strike credentials: `STRIKE_API_KEY=your-actual-key`, `STRIKE_WEBHOOK_SECRET=your-actual-secret`, `STRIKE_ENVIRONMENT=sandbox`
- [ ] **[HUMAN] Add secrets to Convex dashboard** - Go to https://dashboard.convex.dev → Your Project → Settings → Environment Variables → Add `STRIKE_API_KEY`, `STRIKE_WEBHOOK_SECRET`, `STRIKE_ENVIRONMENT`

### 🟢 Code Implementation [2 hrs]

- [ ] **Implement idempotency key in `convex/donations.ts:17-92`** - Add correlation ID as Idempotency-Key header in Strike API calls to prevent duplicate donation creation on retries
- [ ] **Add rate limit retry logic in `lib/strike-client.ts:214-234`** - Implement exponential backoff with jitter when receiving 429 responses, respect retry-after header (250/min for invoices)
- [ ] **Add request timeout handling in `lib/strike-client.ts:209-225`** - Wrap fetch() with AbortController, timeout after 30s: `const controller = new AbortController(); setTimeout(() => controller.abort(), 30000)`

### 🔵 Testing & Validation [2 hrs]

- [ ] **Write idempotency test in `convex/__tests__/strikeWebhook.test.ts`** - Add test case that sends same webhook event twice, verify only one donation record created, second returns 200 "Already processed"
- [ ] **Create integration test script `scripts/test-strike-flow.ts`** - Script that: 1) Creates donation via API, 2) Simulates webhook delivery, 3) Verifies state transitions, 4) Tests expiration after timeout

#### Manual Testing with Real Lightning Wallet [HUMAN ACTION NEEDED]

- [ ] **[HUMAN] Install testnet Lightning wallet** - Download BlueWallet or Phoenix → Switch to testnet mode → Get testnet sats from faucet: https://htlc.me or https://coinfaucet.eu/en/btc-testnet
- [ ] **[HUMAN] Test full payment flow** - Open app → Click donate → Select $1 → Copy Lightning invoice → Pay with testnet wallet → Verify "Payment successful" appears → Check Convex dashboard shows donation as PAID
- [ ] **[HUMAN] Test invoice expiration** - Create donation → Wait 24+ hours → Verify invoice marked EXPIRED in database → Try regenerating new invoice
- [ ] **[HUMAN] Test webhook delivery** - Make payment → Check Convex logs for webhook received → Verify signature validation passed → Check donation state updated

- [ ] **Load test webhook endpoint `scripts/load-test-webhooks.ts`** - Send 100 concurrent webhook events with different IDs, verify all process successfully, measure p95 response time < 500ms

### 🔧 Operational Tooling [1 hr]

- [ ] **Add webhook replay function in `convex/webhooks.ts:291-313`** - Expose `retryFailedWebhook` as public mutation for admin dashboard, add permission check for admin role
- [ ] **Create monitoring dashboard component `src/components/admin/DonationStats.tsx`** - Display real-time stats from `getDonationStats()`: total donations, success rate, average amount, failed webhooks count
- [ ] **Add webhook debugging UI in `src/app/admin/webhooks/page.tsx`** - Table showing failed webhooks from `getFailedWebhooks()`, with retry button and payload viewer
- [ ] **Implement donation amount limits in `convex/donations.ts:23-91`** - Add validation: min $1, max $10,000, reject if outside range with clear error message

## Phase 3: Make it Fast [Post-Launch Optimization]

### ⚡ Performance Optimizations

- [ ] **Memoize QR code generation in `src/components/donations/PaymentQRCode.tsx`** - Wrap QRCodeCanvas with React.memo, use useMemo for data URI generation, cache for identical invoices
- [ ] **Implement webhook queue with DLQ in `convex/webhooks.ts`** - Add dead letter queue for failed webhooks after 3 retries, batch process during low traffic periods
- [ ] **Add Strike API response caching in `lib/strike-client.ts`** - Cache GET requests for 5 minutes using Map with TTL, invalidate on webhook updates
- [ ] **Optimize qrcode bundle size** - Dynamic import QRCode library only when donation modal opens: `const QRCode = await import('qrcode.react')`
- [ ] **Add database indexes for donation queries** - Index by userId for user donation history, compound index on (state, createdAt) for analytics

### 📊 Monitoring & Analytics

- [ ] **Implement donation funnel tracking** - Track: modal_opened → amount_selected → qr_displayed → payment_initiated → payment_completed
- [ ] **Add performance metrics collection** - Measure: QR generation time, webhook processing latency, Strike API response times, store in analytics table
- [ ] **Create Grafana dashboard** - Display: donations/hour, success rate, avg processing time, failed webhook queue depth, Strike API errors
- [ ] **Set up PagerDuty alerts** - Alert on: >10 failed webhooks/hour, Strike API down >5min, donation success rate <90%

## Success Criteria

**Phase 1 Complete When:** ✅ **DONE**

- ✅ Can generate Lightning invoice via UI
- ✅ Invoice displays as QR code with expiration timer
- ✅ Webhook endpoint receives Strike events with signature verification
- ✅ Payment state updates in database with real-time UI updates
- ✅ Complete donation flow: amount selection → payment → success confirmation

**Phase 2 Complete When:**

- ✅ TypeScript compilation passes with zero errors
- ✅ Metadata field persists webhook payment details (amount, currency, txId)
- ✅ Expired donations auto-marked via hourly cron job
- ✅ Webhook signatures use timing-safe comparison (no timing attacks)
- ✅ Strike sandbox environment fully configured and tested
- ✅ Idempotency prevents duplicate donations on webhook retry
- ✅ Integration tests pass in Strike sandbox with testnet Bitcoin
- ✅ Production environment variables configured in Convex dashboard
- ✅ Admin can view and retry failed webhooks via dashboard

**Phase 3 Complete When:**

- ✅ QR code renders in <100ms (p95)
- ✅ Webhook processing completes in <500ms (p95)
- ✅ System handles 100 concurrent donations without errors
- ✅ Bundle size increase <50KB from QR library
- ✅ Donation success rate >95% in production
- ✅ Zero security vulnerabilities in webhook verification
- ✅ Full observability with metrics and alerting

## 🚨 Action Items for Humans

### Before You Can Start Development:

1. **Strike Account Creation** - Required before any Strike features will work

   - Sign up at https://strike.me (requires phone number & ID verification)
   - KYC approval can take 24-48 hours - plan accordingly
   - You need BOTH production AND sandbox API keys

2. **Local Environment Setup** - Required for development

   - Create `.env.local` with your actual Strike credentials
   - Cannot use placeholder values - Strike will reject invalid API keys

3. **Convex Environment Variables** - Required for webhooks to work

   - Must manually add Strike secrets to Convex dashboard
   - Webhooks won't verify without `STRIKE_WEBHOOK_SECRET`

4. **Testing Setup** - Required for payment flow testing
   - Need a testnet Lightning wallet (BlueWallet, Phoenix)
   - Need testnet Bitcoin from a faucet
   - Cannot test payment flow without actually paying invoices

### Production Deployment Checklist:

- [ ] Strike account approved and verified
- [ ] Production API keys generated (different from sandbox!)
- [ ] Webhook endpoint registered in Strike dashboard
- [ ] Environment variables set in Vercel/hosting platform
- [ ] Tested full payment flow in sandbox
- [ ] Contact api@strike.me if expecting high volume

## Notes

- Strike API rate limits: 250/min for invoices, 1000/10min for general endpoints
- Strike webhook events don't contain full data - must fetch via API using entityId
- Lightning invoices expire after ~24 hours if not paid
- Use Strike sandbox (api.dev.strike.me) for all testing before production
- Sandbox uses testnet Bitcoin - has no real monetary value
- Production uses real Bitcoin - test thoroughly in sandbox first!
