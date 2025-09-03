# Chrondle Pro Subscription Implementation TODO

Generated from TASK.md on 2025-09-02

## 🚨 Manual Prerequisites (Must Complete First)

- [ ] Create/verify Stripe account at stripe.com
  - Success criteria: Account verified and activated
  - Dependencies: None
  - Estimated complexity: SIMPLE
- [ ] Complete Stripe business verification

  - Success criteria: Can accept live payments
  - Dependencies: Stripe account created
  - Estimated complexity: SIMPLE

- [ ] Add bank account for payouts in Stripe Dashboard
  - Success criteria: Bank account verified for deposits
  - Dependencies: Business verification complete
  - Estimated complexity: SIMPLE

## Phase 1: Infrastructure Setup (Critical Path)

### Stripe Configuration

- [ ] Create "Chrondle Pro" product in Stripe Dashboard

  - Success criteria: Product created with ID saved
  - Dependencies: Stripe account verified
  - Estimated complexity: SIMPLE

- [ ] Set $4.99 annual price for product

  - Success criteria: Price ID (price_xxx) obtained and saved
  - Dependencies: Product created
  - Estimated complexity: SIMPLE

- [ ] Configure Stripe Customer Portal settings
  - Success criteria: Portal allows subscription management, branding applied
  - Dependencies: Product and price created
  - Estimated complexity: SIMPLE

### Package Installation

- [ ] Install Stripe dependencies
  - Success criteria: `pnpm add stripe @stripe/stripe-js && pnpm add -D @types/stripe` succeeds
  - Dependencies: None
  - Estimated complexity: SIMPLE

### Environment Configuration

- [ ] Create `.env.local` with Stripe configuration
  - Success criteria: All required environment variables set (keys, price ID, webhook secret)
  - Dependencies: Stripe Dashboard configuration complete
  - Estimated complexity: SIMPLE
  - Template:
    ```
    STRIPE_SECRET_KEY=sk_test_...
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
    STRIPE_WEBHOOK_SECRET=whsec_...
    STRIPE_PRICE_ID=price_...
    NEXT_PUBLIC_APP_URL=http://localhost:3000
    NEXT_PUBLIC_SUBSCRIPTION_PRICE=4.99
    NEXT_PUBLIC_SUBSCRIPTION_CURRENCY=USD
    NEXT_PUBLIC_PAYWALL_ENABLED=true
    NEXT_PUBLIC_STRIPE_TEST_MODE=true
    ```

## Phase 2: Backend Implementation (Critical Path)

### Convex Database Schema

- [ ] Extend user schema with subscription fields

  - Success criteria: Schema includes stripeCustomerId, subscriptionStatus, subscriptionId, subscriptionCurrentPeriodEnd, subscriptionCancelAtPeriodEnd
  - Dependencies: None
  - Estimated complexity: MEDIUM
  - Files: `convex/schema.ts`

- [ ] Create subscriptionEvents table
  - Success criteria: Table tracks webhook events with idempotency
  - Dependencies: User schema extended
  - Estimated complexity: SIMPLE
  - Files: `convex/schema.ts`

### Convex Functions

- [ ] Implement `subscriptions.updateStatus` mutation

  - Success criteria: Updates user subscription status from webhook data
  - Dependencies: Schema updated
  - Estimated complexity: MEDIUM
  - Files: `convex/subscriptions.ts`

- [ ] Implement `subscriptions.checkAccess` query

  - Success criteria: Returns boolean for archive access based on subscription status
  - Dependencies: Schema updated
  - Estimated complexity: SIMPLE
  - Files: `convex/subscriptions.ts`

- [ ] Implement `subscriptions.syncWithStripe` action

  - Success criteria: Fetches and syncs subscription data from Stripe API
  - Dependencies: Stripe SDK configured
  - Estimated complexity: COMPLEX
  - Files: `convex/subscriptions.ts`

- [ ] Implement `subscriptions.createStripeCustomer` action
  - Success criteria: Creates Stripe customer and stores ID in user record
  - Dependencies: Stripe SDK configured
  - Estimated complexity: MEDIUM
  - Files: `convex/subscriptions.ts`

### API Routes

- [ ] Create `/api/stripe/create-checkout-session` route

  - Success criteria: Creates Stripe checkout session, returns URL
  - Dependencies: Stripe SDK configured, Convex functions ready
  - Estimated complexity: COMPLEX
  - Files: `src/app/api/stripe/create-checkout-session/route.ts`

- [ ] Create `/api/stripe/webhooks` route

  - Success criteria: Verifies webhook signature, processes events, updates database
  - Dependencies: Convex subscription functions
  - Estimated complexity: COMPLEX
  - Files: `src/app/api/stripe/webhooks/route.ts`

- [ ] Create `/api/stripe/create-portal-session` route
  - Success criteria: Creates customer portal session for subscription management
  - Dependencies: Stripe customer ID in database
  - Estimated complexity: MEDIUM
  - Files: `src/app/api/stripe/create-portal-session/route.ts`

### Security Implementation

- [ ] Implement webhook signature verification

  - Success criteria: Rejects invalid signatures, accepts valid ones
  - Dependencies: Webhook route created
  - Estimated complexity: MEDIUM
  - Files: `src/app/api/stripe/webhooks/route.ts`

- [ ] Add rate limiting to payment endpoints
  - Success criteria: Limits requests per IP/user
  - Dependencies: API routes created
  - Estimated complexity: MEDIUM
  - Files: `src/middleware.ts`

## Phase 3: Frontend Implementation (Parallel Work Streams)

### Stream A: Paywall Components

- [ ] Create `PaywallModal` component

  - Success criteria: Displays subscription benefits, pricing, CTA
  - Dependencies: None
  - Estimated complexity: MEDIUM
  - Files: `src/components/paywall/PaywallModal.tsx`

- [ ] Create `SubscriptionButton` component

  - Success criteria: Initiates checkout, shows loading states
  - Dependencies: Checkout session API route
  - Estimated complexity: MEDIUM
  - Files: `src/components/paywall/SubscriptionButton.tsx`

- [ ] Create `ArchiveGate` wrapper component
  - Success criteria: Shows paywall to non-subscribers, content to subscribers
  - Dependencies: Access check function
  - Estimated complexity: MEDIUM
  - Files: `src/components/paywall/ArchiveGate.tsx`

### Stream B: Subscription Management UI

- [ ] Create `SubscriptionStatus` component

  - Success criteria: Shows current subscription status, renewal date
  - Dependencies: Subscription query function
  - Estimated complexity: SIMPLE
  - Files: `src/components/subscription/SubscriptionStatus.tsx`

- [ ] Create `ManageSubscription` component

  - Success criteria: Links to Stripe Customer Portal
  - Dependencies: Portal session API route
  - Estimated complexity: SIMPLE
  - Files: `src/components/subscription/ManageSubscription.tsx`

- [ ] Add subscription section to Settings modal
  - Success criteria: Integrates subscription management in existing settings
  - Dependencies: Subscription components created
  - Estimated complexity: MEDIUM
  - Files: `src/components/modals/SettingsModal.tsx`

### Stream C: Archive Access Control

- [ ] Update archive page with paywall

  - Success criteria: Non-subscribers see paywall, subscribers see puzzles
  - Dependencies: ArchiveGate component
  - Estimated complexity: MEDIUM
  - Files: `src/app/archive/page.tsx`

- [ ] Update puzzle detail page access control

  - Success criteria: Historical puzzles require subscription
  - Dependencies: Access check function
  - Estimated complexity: MEDIUM
  - Files: `src/app/puzzle/[date]/page.tsx`

- [ ] Add subscription badge for premium users
  - Success criteria: Visual indicator for active subscribers
  - Dependencies: Subscription status component
  - Estimated complexity: SIMPLE
  - Files: `src/components/ui/UserProfile.tsx`

## Phase 4: Webhook Processing

- [ ] Handle `checkout.session.completed` event

  - Success criteria: Creates/updates subscription on successful payment
  - Dependencies: Webhook route, update functions
  - Estimated complexity: COMPLEX
  - Files: `src/app/api/stripe/webhooks/route.ts`

- [ ] Handle `customer.subscription.updated` event

  - Success criteria: Updates subscription status changes
  - Dependencies: Webhook route, update functions
  - Estimated complexity: MEDIUM
  - Files: `src/app/api/stripe/webhooks/route.ts`

- [ ] Handle `customer.subscription.deleted` event

  - Success criteria: Marks subscription as canceled
  - Dependencies: Webhook route, update functions
  - Estimated complexity: MEDIUM
  - Files: `src/app/api/stripe/webhooks/route.ts`

- [ ] Handle `invoice.payment_succeeded` event

  - Success criteria: Extends subscription period on renewal
  - Dependencies: Webhook route, update functions
  - Estimated complexity: MEDIUM
  - Files: `src/app/api/stripe/webhooks/route.ts`

- [ ] Handle `invoice.payment_failed` event
  - Success criteria: Updates status to past_due/unpaid
  - Dependencies: Webhook route, update functions
  - Estimated complexity: MEDIUM
  - Files: `src/app/api/stripe/webhooks/route.ts`

## Phase 5: Testing & Validation

### Integration Testing

- [ ] Set up Stripe CLI for webhook testing

  - Success criteria: `stripe listen --forward-to localhost:3000/api/stripe/webhooks` works
  - Dependencies: Stripe CLI installed
  - Estimated complexity: SIMPLE

- [ ] Test successful subscription flow

  - Success criteria: User can subscribe with test card 4242424242424242
  - Dependencies: All components integrated
  - Estimated complexity: MEDIUM

- [ ] Test payment failure scenarios

  - Success criteria: Proper error handling for declined cards
  - Dependencies: Error states implemented
  - Estimated complexity: MEDIUM

- [ ] Test subscription cancellation flow

  - Success criteria: User can cancel via Customer Portal, loses access at period end
  - Dependencies: Portal integration complete
  - Estimated complexity: MEDIUM

- [ ] Test webhook idempotency
  - Success criteria: Duplicate webhook events don't create duplicate records
  - Dependencies: Idempotency logic implemented
  - Estimated complexity: MEDIUM

### User Experience Testing

- [ ] Test mobile paywall experience

  - Success criteria: Paywall responsive and functional on mobile
  - Dependencies: Paywall components complete
  - Estimated complexity: SIMPLE

- [ ] Test loading states and skeleton screens

  - Success criteria: No layout shift, smooth transitions
  - Dependencies: Loading states implemented
  - Estimated complexity: SIMPLE

- [ ] Test error recovery flows
  - Success criteria: Clear error messages, retry options work
  - Dependencies: Error handling implemented
  - Estimated complexity: MEDIUM

## Phase 6: Production Preparation

### Configuration

- [ ] Set up production Stripe webhook endpoint

  - Success criteria: Production URL configured in Stripe Dashboard
  - Dependencies: Deployment environment ready
  - Estimated complexity: SIMPLE

- [ ] Configure production environment variables

  - Success criteria: All production keys and secrets set
  - Dependencies: Production Stripe account
  - Estimated complexity: SIMPLE

- [ ] Enable Stripe production mode
  - Success criteria: Live payments can be processed
  - Dependencies: All testing complete
  - Estimated complexity: SIMPLE

### Documentation

- [ ] Create subscription FAQ

  - Success criteria: Common questions answered
  - Dependencies: Feature complete
  - Estimated complexity: SIMPLE
  - Files: `docs/subscription-faq.md`

- [ ] Document webhook event handling

  - Success criteria: All events and their handlers documented
  - Dependencies: Webhook implementation complete
  - Estimated complexity: SIMPLE
  - Files: `docs/stripe-webhooks.md`

- [ ] Create support runbook
  - Success criteria: Common issues and resolutions documented
  - Dependencies: Testing complete
  - Estimated complexity: MEDIUM
  - Files: `docs/support-runbook.md`

### Monitoring

- [ ] Set up payment success/failure monitoring

  - Success criteria: Alerts for payment issues
  - Dependencies: Webhook logging implemented
  - Estimated complexity: MEDIUM

- [ ] Configure subscription metrics dashboard
  - Success criteria: Track MRR, churn, conversion
  - Dependencies: Analytics events implemented
  - Estimated complexity: COMPLEX

## Future Enhancements (BACKLOG.md candidates)

- [ ] Implement gift subscriptions
- [ ] Add student discount verification
- [ ] Create referral program with rewards
- [ ] Migrate to Stripe Elements for embedded checkout
- [ ] Add subscription pause/resume functionality
- [ ] Implement backup payment methods
- [ ] Add team/family plan options
- [ ] Create mobile app subscription sync

## Success Validation Checklist

- [ ] Free users can play daily puzzle without subscription
- [ ] Archive access properly gated behind paywall
- [ ] Subscription checkout completes successfully
- [ ] Webhooks process all critical events
- [ ] Customer Portal allows self-service management
- [ ] Subscription status syncs properly with Stripe
- [ ] Error states handle gracefully
- [ ] Mobile experience works smoothly
- [ ] Performance metrics within acceptable ranges
- [ ] No security vulnerabilities in payment flow

---

**Total Tasks**: 55 core implementation tasks
**Estimated Timeline**: 5 days with parallel work streams
**Critical Path Length**: ~20 tasks that must be sequential
**Risk Areas**: Webhook reliability, payment error handling, subscription state sync
