# Chrondle Pro: Annual Subscription Paywall for Puzzle Archive

## Executive Summary

Implement a Stripe-based annual subscription system ($4.99/year) that gates access to Chrondle's historical puzzle archive. Users can play the daily puzzle without authentication or subscription, but accessing past puzzles requires a "Chrondle Pro" subscription. This creates a sustainable revenue model while maintaining the core free daily experience.

## Product Vision & Goals

### Primary Objectives

- **Monetization**: Generate recurring revenue through annual subscriptions
- **User Value**: Provide unlimited access to historical puzzles for dedicated players
- **Simplicity**: Minimal friction subscription flow with clear value proposition
- **Fairness**: Maintain free daily puzzle for all users, regardless of subscription status

### Success Metrics

- Conversion rate: 5-10% of authenticated users subscribe within first month
- Retention rate: 80%+ annual renewal rate
- Payment success rate: 95%+ successful payment processing
- Support tickets: <2% of subscribers require payment support

## User Requirements

### User Stories

#### Free User Journey

1. **As a casual player**, I can play today's puzzle without creating an account or paying
2. **As a free user**, I can see the archive exists but understand it requires subscription
3. **As a curious user**, I can preview archive metadata (dates, completion status) to understand value

#### Subscription Journey

1. **As a potential subscriber**, I can clearly see pricing ($4.99/year) and what I get
2. **As a ready buyer**, I can subscribe with minimal friction using Stripe Checkout
3. **As a subscriber**, I can access any historical puzzle immediately after payment
4. **As a paying customer**, I can manage my subscription through Stripe Customer Portal

#### Edge Cases

1. **As a lapsed subscriber**, I retain my progress data but lose archive access
2. **As a returning subscriber**, I can resubscribe and immediately regain access
3. **As a user with payment issues**, I receive clear error messages and retry options

### Feature Requirements

#### Core Features

- **Paywall UI**: Clear, non-intrusive paywall on archive pages
- **Subscription Flow**: One-click checkout via Stripe Checkout
- **Access Control**: Server-side verification of subscription status
- **Management Portal**: Stripe Customer Portal for self-service management

#### Excluded Features (Explicitly Out of Scope)

- Free trial period
- Multiple subscription tiers
- Team/family plans
- Promotional codes or discounts
- Granular puzzle purchases

## Technical Architecture

### System Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Next.js   │────▶│    Convex    │────▶│   Stripe    │
│  Frontend   │     │   Backend    │     │     API     │
└─────────────┘     └──────────────┘     └─────────────┘
       │                    │                    │
       │                    │                    │
       ▼                    ▼                    ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│    Clerk    │     │   Database   │     │   Webhooks  │
│    Auth     │     │  (Subscr.)   │     │   Handler   │
└─────────────┘     └──────────────┘     └─────────────┘
```

### Technology Stack

#### Payment Infrastructure

- **Stripe Checkout**: Hosted payment page for conversion optimization
- **Stripe Customer Portal**: Self-service subscription management
- **Stripe Webhooks**: Real-time subscription status updates
- **Stripe Test Mode**: Development and testing environment

#### Integration Points

- **Convex Database**: Store subscription status, Stripe customer IDs
- **Clerk Authentication**: Link Stripe customers to authenticated users
- **Next.js 15 App Router**: Server-side subscription verification
- **Edge Middleware**: Route-level access control

### Database Schema Extensions

```typescript
// convex/schema.ts additions
users: defineTable({
  // Existing fields...

  // Subscription fields
  stripeCustomerId: v.optional(v.string()),
  subscriptionStatus: v.optional(
    v.union(
      v.literal("active"),
      v.literal("canceled"),
      v.literal("past_due"),
      v.literal("unpaid"),
      v.literal("trialing"),
    ),
  ),
  subscriptionId: v.optional(v.string()),
  subscriptionCurrentPeriodEnd: v.optional(v.number()), // Unix timestamp
  subscriptionCancelAtPeriodEnd: v.optional(v.boolean()),
});

subscriptionEvents: defineTable({
  userId: v.id("users"),
  stripeEventId: v.string(), // For idempotency
  eventType: v.string(),
  eventData: v.any(),
  createdAt: v.number(),
});
```

### API Design

#### Stripe Endpoints

```typescript
// API Routes
POST / api / stripe / create - checkout - session;
POST / api / stripe / create - portal - session;
POST / api / stripe / webhooks;
GET / api / stripe / subscription - status;

// Server Actions (Alternative)
createCheckoutSession();
createPortalSession();
getSubscriptionStatus();
```

#### Convex Functions

```typescript
// Subscription Management
subscriptions.updateStatus;
subscriptions.checkAccess;
subscriptions.syncWithStripe;
subscriptions.handleWebhook;

// Access Control
archive.canAccessPuzzle;
archive.getAccessiblePuzzles;
```

## Implementation Strategy

### Phase 1: Infrastructure Setup (Day 1)

#### Environment Configuration

```bash
# Required environment variables
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Stripe Dashboard Setup

1. Create "Chrondle Pro" product
2. Set $4.99 annual pricing
3. Configure Customer Portal settings
4. Set up webhook endpoints
5. Enable test mode for development

#### Package Installation

```bash
pnpm add stripe @stripe/stripe-js
pnpm add -D @types/stripe
```

### Phase 2: Backend Implementation (Day 1-2)

#### Convex Schema & Functions

- Extend user schema with subscription fields
- Create subscription management functions
- Implement access control helpers
- Add webhook event logging

#### Stripe Integration

- Initialize Stripe SDK with API version locking
- Create checkout session endpoint
- Implement webhook handler with signature verification
- Add customer portal session creation

#### Security Implementation

- Webhook signature verification
- Rate limiting on payment endpoints
- Proper error handling and logging
- Environment variable validation

### Phase 3: Frontend Implementation (Day 2-3)

#### Paywall Components

```typescript
// Component Structure
<PaywallModal />          // Main subscription pitch
<SubscriptionButton />    // CTA with loading states
<ArchiveGate />          // Wraps archive content
<SubscriptionStatus />   // Shows current status
<ManageSubscription />   // Portal link
```

#### User Flows

1. **Discovery Flow**: User clicks archive → sees paywall → understands value
2. **Purchase Flow**: Click subscribe → Stripe Checkout → success redirect
3. **Management Flow**: Settings → Subscription → Customer Portal

#### Loading & Error States

- Skeleton loaders during subscription checks
- Clear error messages for payment failures
- Retry mechanisms for transient errors
- Offline mode considerations

### Phase 4: Testing & Validation (Day 3-4)

#### Test Scenarios

- New user subscription flow
- Renewal and cancellation flows
- Payment failure handling
- Webhook processing reliability
- Access control verification

#### Stripe Test Cards

```bash
# Success scenarios
4242 4242 4242 4242  # Successful payment
3056 9300 0902 0004  # 3D Secure authentication

# Failure scenarios
4000 0000 0000 0002  # Card declined
4000 0000 0000 9995  # Insufficient funds
```

#### Test Clock Simulation

- Annual renewal cycles
- Grace period handling
- Subscription state transitions

### Phase 5: Production Preparation (Day 4-5)

#### Pre-Launch Checklist

- [ ] Stripe account verification completed
- [ ] Production API keys configured
- [ ] Webhook endpoint verified in production
- [ ] Customer Portal customized with branding
- [ ] Error monitoring configured (Sentry/LogRocket)
- [ ] Support documentation prepared
- [ ] Rollback plan documented

#### Monitoring Setup

- Payment success/failure rates
- Webhook delivery reliability
- Subscription conversion funnel
- Customer support tickets

## Security Requirements

### Payment Security

- **PCI Compliance**: No credit card data stored in our database
- **Stripe Elements/Checkout**: Secure, PCI-compliant payment collection
- **HTTPS Only**: Enforce SSL for all payment flows
- **CSP Headers**: Whitelist Stripe domains for script execution

### Authentication Security

- **Webhook Verification**: Mandatory signature validation
- **API Key Management**: Server-side only, environment variables
- **Rate Limiting**: Prevent abuse of payment endpoints
- **CORS Configuration**: Restrict API access to allowed origins

### Data Protection

- **Encryption**: Sensitive data encrypted at rest (Convex handles this)
- **Audit Logging**: Track all subscription state changes
- **Data Minimization**: Store only necessary Stripe references
- **GDPR Compliance**: User data deletion on account removal

## User Experience Design

### Paywall Presentation

#### Visual Design

```
┌─────────────────────────────────────┐
│        🔒 Unlock the Archive        │
│                                     │
│   Access 1,800+ Historical Puzzles  │
│                                     │
│         Just $4.99/year             │
│      (That's $0.41/month!)          │
│                                     │
│   ✓ Unlimited archive access        │
│   ✓ Track your progress             │
│   ✓ Support Chrondle development    │
│                                     │
│   [  Subscribe Now - $4.99  ]       │
│                                     │
│   Already subscribed? Refresh page  │
└─────────────────────────────────────┘
```

#### Copy Guidelines

- Emphasize value, not restriction
- Clear pricing with no hidden fees
- Highlight community support aspect
- Reassure about daily puzzle remaining free

### Subscription Management UI

#### Account Settings Integration

```
Settings → Subscription
├── Status: Active/Inactive
├── Next billing date / Expiration
├── [Manage Subscription] → Stripe Portal
└── [Resubscribe] (if lapsed)
```

#### Status Indicators

- Green badge for active subscribers
- Clear expiration warnings
- Renewal reminders (30 days before)
- Grace period notifications

## Error Handling & Edge Cases

### Payment Failures

- **Insufficient Funds**: Clear message, retry option
- **Card Declined**: Suggest alternative payment method
- **3D Secure Required**: Handle additional authentication
- **Network Errors**: Offline queue for retry

### Subscription States

- **Active**: Full archive access
- **Canceled**: Access until period end
- **Past Due**: 7-day grace period
- **Unpaid**: Immediate access revocation

### Race Conditions

- **Double-click Prevention**: Disable button during processing
- **Webhook Delays**: Optimistic UI with reconciliation
- **Multiple Tabs**: Shared state synchronization
- **Cache Invalidation**: Force refresh on status change

## Migration & Rollout Strategy

### Rollout Phases

#### Phase 1: Soft Launch (Week 1)

- Enable for 10% of users
- Monitor conversion and support tickets
- A/B test pricing psychology ($4.99 vs $5)

#### Phase 2: General Availability (Week 2)

- Enable for all users
- Launch announcement blog post
- Email campaign to existing users

#### Phase 3: Optimization (Week 3-4)

- Analyze conversion funnel
- Iterate on paywall copy
- Test different CTA placements

### Rollback Plan

1. Feature flag to disable paywall
2. Webhook handler continues processing
3. Existing subscribers retain access
4. Gradual migration if issues arise

## Success Criteria & KPIs

### Launch Success Metrics

- **Day 1**: 50+ successful subscriptions
- **Week 1**: <1% payment failure rate
- **Week 1**: <5 support tickets
- **Month 1**: 5% conversion rate

### Long-term Success Metrics

- **MRR Growth**: 10% month-over-month
- **Churn Rate**: <20% annual
- **LTV:CAC Ratio**: >3:1
- **Support Cost**: <$0.50 per subscriber

## Compliance & Legal

### Regulatory Compliance

- **PCI DSS**: Achieved through Stripe's certified infrastructure
- **GDPR**: Data processing agreement with Stripe
- **CCPA**: California privacy rights respected
- **SCA**: Strong Customer Authentication for EU customers

### Terms of Service Updates

- Add subscription terms
- Clarify refund policy (no refunds for partial periods)
- Define access rights and limitations
- Include auto-renewal disclosure

### Tax Considerations

- Stripe Tax for automatic calculation
- VAT handling for EU customers
- Sales tax for US states
- Invoice generation for business users

## Support & Documentation

### User Documentation

- FAQ section for subscription questions
- Troubleshooting guide for payment issues
- Video walkthrough of subscription process
- Email templates for common inquiries

### Internal Documentation

- Stripe webhook event reference
- Subscription state machine diagram
- Support agent escalation procedures
- Manual intervention playbooks

## Future Enhancements (Post-MVP)

### Potential Features

- Gift subscriptions
- Student discounts with verification
- Referral program with rewards
- Premium features beyond archive access
- Mobile app with subscription sync

### Technical Improvements

- Stripe Elements for embedded checkout
- Subscription pause/resume functionality
- Prorated upgrades/downgrades
- Multiple payment methods per user
- Backup payment method support

## Appendix: Technical Details

### Stripe Webhook Events to Handle

```typescript
// Critical Events (Must Handle)
"checkout.session.completed"; // Initial subscription
"customer.subscription.updated"; // Status changes
"customer.subscription.deleted"; // Cancellations
"invoice.payment_succeeded"; // Renewals
"invoice.payment_failed"; // Failed payments

// Optional Events (Nice to Have)
"customer.updated"; // Email changes
"payment_method.attached"; // New card added
"invoice.upcoming"; // Renewal reminders
```

### Required Stripe CLI Commands

```bash
# Development setup
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhooks

# Create product and price
stripe products create --name="Chrondle Pro"
stripe prices create \
  --unit-amount=499 \
  --currency=usd \
  --recurring[interval]=year \
  --product=prod_xxx

# Test webhook
stripe trigger checkout.session.completed
```

### Environment Variable Template

```bash
# .env.local
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_1...

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUBSCRIPTION_PRICE=4.99
NEXT_PUBLIC_SUBSCRIPTION_CURRENCY=USD

# Feature Flags
NEXT_PUBLIC_PAYWALL_ENABLED=true
NEXT_PUBLIC_STRIPE_TEST_MODE=true
```

---

**Implementation Priority**: HIGH  
**Estimated Timeline**: 5 days  
**Dependencies**: Stripe account verification, Convex deployment access  
**Risk Level**: Medium (payment processing requires careful testing)  
**ROI Expectation**: Break-even at 100 subscribers, profitable at 500+

_Last Updated: 2025-09-02_
