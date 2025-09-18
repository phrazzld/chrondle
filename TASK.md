# Bitcoin Donation Feature Specification

## Task

Configure BTCPayServer or Bitcoin donations in footer | Impact: 4

## Requirements

### Functional (What it MUST do)

- [ ] Display Bitcoin donation option in footer next to GitHub link
- [ ] Generate unique Bitcoin address for each donation session
- [ ] Support both on-chain Bitcoin and Lightning Network payments
- [ ] Show QR code with BIP21 URI for mobile wallet scanning
- [ ] Provide one-click address copy functionality
- [ ] Display donation confirmation after payment received

### Non-Functional (How well it must do it)

- **Performance**: < 50KB additional bundle size, lazy-loaded
- **Security**: No private keys in client code, address validation
- **Reliability**: Fallback to static address if BTCPay unavailable
- **Accessibility**: WCAG 2.1 AA compliant, keyboard navigable

## Constraints

### Technical

- Next.js 15 App Router architecture
- TypeScript strict mode compliance
- Existing button component system (shadcn/ui)
- Mobile-first responsive design requirement
- CSP headers must allow BTCPay Server domain

### Resource

- Bundle size impact < 50KB
- No additional runtime dependencies in critical path
- Must work offline (show static address)

### Business

- No KYC/AML requirements (donations only, no rewards)
- Anonymous donations allowed
- No transaction fees to donor
- USD equivalent display optional

## Implementation Strategy

### Phase 1: Static Bitcoin Address (Minimal Viable Solution)

```typescript
// Simple, secure, works offline
interface BitcoinDonationConfig {
  address: string; // From env variable
  lightning?: string; // BOLT11 invoice or LNURL
}

// Components needed:
// 1. BitcoinButton in Footer.tsx
// 2. BitcoinModal with QR + copy
// 3. No external dependencies initially
```

**Invariants:**

- Bitcoin address MUST be valid mainnet format
- Address MUST come from environment variable
- Modal MUST be keyboard accessible
- QR code MUST include BIP21 URI

### Phase 2: BTCPay Server Integration (Production Hardening)

```typescript
interface BTCPayInvoice {
  id: string;
  checkoutLink: string;
  btcAddress: string;
  lightningInvoice?: string;
  amount?: number;
  status: "New" | "Processing" | "Paid" | "Expired";
}

// Server-side API route for invoice creation
// Client-side monitoring for payment status
// Webhook handler for confirmations
```

**Additional Invariants:**

- API key MUST never reach client
- Invoice creation MUST be rate-limited
- Payment monitoring MUST timeout after 1 hour
- Failed BTCPay requests MUST fallback to static address

## File Structure

```
src/
├── components/
│   ├── Footer.tsx (modified - add BitcoinButton)
│   └── BitcoinDonation/
│       ├── BitcoinButton.tsx
│       ├── BitcoinModal.tsx
│       ├── QRCode.tsx
│       └── index.ts
├── lib/
│   └── bitcoin/
│       ├── validation.ts (address format validation)
│       ├── constants.ts (addresses, URIs)
│       └── btcpay.ts (Phase 2 - API integration)
└── app/
    └── api/
        └── bitcoin/
            └── invoice/
                └── route.ts (Phase 2)
```

## Success Criteria

### Phase 1 (Static Address)

- [ ] Bitcoin button appears in footer
- [ ] Modal opens with QR code on click
- [ ] Address copies successfully on button click
- [ ] QR code scannable by major wallets (Sparrow, Blue, Phoenix)
- [ ] Works offline without errors
- [ ] Passes accessibility audit
- [ ] Bundle size increase < 25KB

### Phase 2 (BTCPay Integration)

- [ ] Dynamic invoice generation works
- [ ] Lightning payments supported
- [ ] Payment confirmation displayed
- [ ] Graceful fallback on BTCPay failure
- [ ] No security vulnerabilities in API
- [ ] Bundle size increase < 50KB total
- [ ] Response time < 500ms for invoice creation

## Security Checklist

- [ ] Bitcoin address validated before display
- [ ] No private keys or seeds in codebase
- [ ] Environment variables for all addresses
- [ ] Content Security Policy allows QR library
- [ ] No user input in Bitcoin URIs
- [ ] API routes protected against abuse
- [ ] Webhook signatures verified (Phase 2)

## Testing Requirements

### Unit Tests

```typescript
describe("BitcoinDonation", () => {
  test("validates Bitcoin address format");
  test("generates correct BIP21 URI");
  test("handles copy failure gracefully");
  test("renders accessible modal");
});
```

### Integration Tests

```typescript
describe("Donation Flow", () => {
  test("opens modal from footer button");
  test("copies address to clipboard");
  test("closes modal on escape key");
  test("fallback to static on API failure");
});
```

### Manual Testing

- [ ] Test with Testnet addresses first
- [ ] Verify QR scanning with 3+ wallet apps
- [ ] Test on mobile devices (iOS/Android)
- [ ] Verify keyboard navigation
- [ ] Test with screen readers

## Configuration

### Environment Variables

```bash
# Phase 1 - Static
NEXT_PUBLIC_BITCOIN_ADDRESS=bc1q... # Native SegWit preferred
NEXT_PUBLIC_LIGHTNING_ADDRESS=lnbc... # Optional static invoice

# Phase 2 - BTCPay
BTCPAY_URL=https://btcpay.chrondle.app
BTCPAY_STORE_ID=...
BTCPAY_API_KEY=... # Server-side only
```

## Risk Mitigation

| Risk                      | Impact | Mitigation                    |
| ------------------------- | ------ | ----------------------------- |
| Invalid address displayed | High   | Client & server validation    |
| BTCPay server downtime    | Medium | Static address fallback       |
| Bundle size bloat         | Low    | Lazy load, minimal deps       |
| Accessibility issues      | Medium | ARIA labels, focus management |
| Security vulnerability    | High   | No private keys, CSP headers  |

## Dependencies

### Phase 1 (Minimal)

- `qrcode` - 30KB, generates QR codes
- No other external dependencies

### Phase 2 (Full)

- `qrcode` - QR generation
- BTCPay Greenfield API (server-side only)

## Validation Questions

**The Dijkstra Test:**

- Can this fail silently? No - all errors shown to user
- What happens at boundaries? Fallback to static address
- Is this the simplest solution? Yes - static first, enhance later
- Would Dijkstra approve? Focus on correctness over features ✓

## Decision Log

1. **Why BTCPay over direct wallet?**

   - Zero fees, self-sovereign, production-ready
   - Handles complexity of payment monitoring
   - Lightning Network support built-in

2. **Why Native SegWit addresses?**

   - Lower fees than legacy
   - Wide wallet support in 2025
   - Better error detection via Bech32

3. **Why phase approach?**

   - Phase 1 ships value immediately
   - Phase 2 adds complexity only if needed
   - Fallback ensures reliability

4. **Why lazy loading?**
   - Bitcoin features not critical path
   - Reduces initial bundle size
   - Better Core Web Vitals

---

_"Simplicity is prerequisite for reliability." - E.W. Dijkstra_

This specification provides the minimal correct solution that can be enhanced incrementally without breaking existing functionality.
