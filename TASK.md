# 1) Objective & Scope

**Goal.** Let visitors send you donations/tips over the Bitcoin Lightning Network (and optionally on-chain) via Strike. Support both:

- **Fixed-amount** flows (e.g., “Buy me a coffee – \$5, \$10, \$20”) using **Invoices** (amount required). ([Strike API Documentation][1])
- **Pay-what-you-want** flows using **Receive Requests** (amount optional, enables “zero-amount” invoices suitable for tips). ([Strike API Documentation][1])

**Settlement.** Funds settle to your Strike account in **BTC or fiat** per your account’s capabilities; invoices/receive-requests support BTC or cash balances by region. We’ll configure for **BTC settlement** to match your preference. ([Strike API Documentation][1])

**Out of scope.** Card rails; non-Strike PSPs; recurring subscriptions.

---

# 2) Key Concepts (Strike)

- **Invoice** (Lightning only). Requires an amount; prevents over/under-payment; best for fixed buttons. Flow = _Create Invoice → Create Quote → show `lnInvoice` (Bolt11) QR → wait for `PAID` webhook → verify & grant entitlement_. Quote expiry: **\~30s** for cross-currency, **1h** for BTC-denominated. ([Strike API Documentation][1])
- **Receive Request** (Lightning and/or on-chain). Amount optional; can return a **zero-amount Lightning invoice** and/or a **Bitcoin address**; suitable for donations. Default Lightning expiration can be set (24h default if omitted). ([Strike API Documentation][1])
- **Lightning Address** (e.g., `yourhandle@strike.me`). Optional vanity entry point; Strike supports sending to Lightning addresses and Strike issues one for each user. We’ll expose this for power users, while the primary UX uses invoices/receive-requests. ([Strike][2])
- **Webhooks**. Strike posts events (e.g., `invoice.updated`) to your endpoint. **HMAC-SHA256** signature is in `X-Webhook-Signature`; verify with your webhook secret using raw body. Retries may occur; your handler must be idempotent. ([Strike API Documentation][3])
- **API Auth & Scopes**. Create an API key in the Strike Dashboard; add it as `Authorization: Bearer <API_KEY>`. Use minimal scopes:

  - `partner.receive-request.create` (donations/tips)
  - `partner.invoice.create` (fixed buttons)
  - `partner.payment-quote.lightning.create` (quotes)
    (Plus read endpoints to `GET`/find objects). ([Strike API Documentation][4])

- **Sandbox/Testnet**. Use the **Strike Sandbox** (testnet LN/BTC) at `https://api.dev.strike.me` with a sandbox API key; note **lower rate limits**. ([Strike API Documentation][5])
- **HTTP/Errors/Rate limits**. API returns standard 2xx/4xx/5xx; 429 for rate limit exceeded. Use backoff and caching to minimize polling. ([Strike API Documentation][6])

---

# 3) User Stories

1. As an anonymous visitor, I can pick **\$5 / \$10 / \$20** or type a custom amount and pay via **Lightning** (QR scan) or on-chain (optional), and see a clear success state when confirmed.

2. As the site owner, I can view donation records with **amount, currency, payment rail (LN/on-chain), invoice/receive-request IDs, payer note**, and webhook status; and reconcile with Strike.

3. As a power user, I can click “Pay to **Lightning Address**” and paste `yourhandle@strike.me` into my wallet. ([Strike][2])

---

# 4) Architecture & Flows

## 4.1 Components

- **Frontend (Next.js)**: Donation UI, amount entry, payment method choice, QR rendering from `lnInvoice` (Bolt11).
- **Backend API (Convex or Next API routes)**:

  - `POST /api/donations/create` → creates **Receive Request** (preferred) or **Invoice**, stores DB record.
  - `GET /api/donations/:id/status` → returns authoritative state.
  - `POST /api/strike/webhook` → verifies HMAC signature; enqueues reconciliation; updates donation state.

- **DB**: `donations`, `webhooks`, `payouts` (future), `audit_logs`.
- **Strike**: API + Webhooks.

## 4.2 Preferred flow: **Pay-what-you-want** (Receive Request – Lightning first, on-chain optional)

1. **Client → Backend**: `amount` (optional), `message`, `railPreference` (LN / on-chain / both), `settlementCurrency: BTC`.
2. **Backend → Strike**: `POST /v1/receive-requests` with `{ bolt11: {}, onchain?: {}, amount?: {currency, amount} }`.

   - If `amount` omitted → zero-amount Lightning invoice (payer sets amount in wallet).
   - Response includes `bolt11.lnInvoice` and/or `onchain.onchainAddress` plus expirations. ([Strike API Documentation][7])

3. **Backend**: Persist record with `receiveRequestId`, `lnInvoice`, expiration, correlation key.
4. **Frontend**: Render QR for `lnInvoice` (and “Copy invoice” fallback). For BTC address fallback, present as copyable string + QR. (Strike notes Bolt11 is scannable; use `qrcode.react` or similar). ([Strike API Documentation][1])
5. **Wallet pays** before expiration; if expired, client polls `status` and requests a fresh request.
6. **Webhook**: Listen for success events (see below).
7. **Backend**: On webhook, `GET` the entity for authoritative state and mark donation `CONFIRMED`. ([Strike API Documentation][1])

> Receive-request benefits vs invoices: amount can be omitted; can include both **LN** and **on-chain** in one call; best for donations. ([Strike API Documentation][1])

## 4.3 Fixed buttons (Invoice)

For “\$5/10/20” quick-pay:

1. **Backend**: `POST /v1/invoices` with `{ amount: { currency: BTC (or USD per your preference), amount }, correlationId, description }`. ([Strike API Documentation][8])
2. **Backend**: `POST /v1/invoices/{invoiceId}/quote` → returns `lnInvoice` + expiration (30s for cross-currency, 1h for BTC). Show QR. ([Strike API Documentation][1])
3. **Webhook**: listen for `invoice.updated` where `state` transitions to `PAID`; then `GET /v1/invoices/{id}` to confirm state. ([Strike API Documentation][1])

## 4.4 Webhooks (authoritative completion)

- Subscribe to `invoice.updated` (for invoice flow) and any receive-request completion events. Strike notifies via `POST` to your endpoint; actual new state must be retrieved with `GET` by entity ID. ([Strike API Documentation][1])
- **Verify signature**: compute HMAC-SHA256 over the **raw** JSON payload using your webhook secret; compare with `X-Webhook-Signature` using constant-time compare. Reject if missing/invalid. ([Strike API Documentation][9])
- **Delivery semantics**: duplicate deliveries possible; design idempotent handler keyed by webhook event `id` / entity ID. ([Strike API Documentation][10])

---

# 5) API Surface (Backend)

> All requests include `Authorization: Bearer <API_KEY>`; base URL is `https://api.strike.me` (or `https://api.dev.strike.me` for sandbox). ([Strike API Documentation][11])

## 5.1 Create Donation (Receive Request)

**Request (server → Strike)**
`POST /v1/receive-requests`
Body (examples):

- **Zero-amount Lightning only**:

```json
{
  "bolt11": {},
  "onchain": null
}
```

- **LN + on-chain with suggested USD amount**:

```json
{
  "bolt11": { "amount": { "currency": "USD", "amount": "10.00" } },
  "onchain": { "amount": { "currency": "USD", "amount": "10.00" } }
}
```

Returns `receiveRequestId`, `bolt11.lnInvoice`, `onchain.onchainAddress`, expirations. ([Strike API Documentation][7])

**DB fields**: `id`, `type="receive_request"`, `rr_id`, `ln_invoice`, `btc_address`, `requested_amount`, `requested_currency`, `expires_at`, `state=CREATED`, `webhook_state`, `correlation_id`, `payer_note`, `created_at`.

## 5.2 Create Fixed Invoice

`POST /v1/invoices` → `invoiceId` in `UNPAID` state. Then:
`POST /v1/invoices/{invoiceId}/quote` → returns `lnInvoice` + `expiration`. Use `idempotency-key` header where supported to avoid duplicate quote creation. ([Strike API Documentation][1])

## 5.3 Poll/Fetch

- `GET /v1/invoices/{id}` to read `state` (`UNPAID`→`PAID`). ([Strike API Documentation][12])
- Public profile capabilities (which currencies are invoiceable): `GET /v1/accounts/handle/{handle}/profile` (to ensure BTC invoiceability). ([Strike API Documentation][1])

## 5.4 Webhook Endpoint

`POST /api/strike/webhook`

- Read **raw** body (don’t JSON-parse before HMAC). Verify signature per Strike doc.
- Handle `invoice.updated` etc.; then call `GET` on relevant entity to confirm state; update `donations`. ([Strike API Documentation][9])

---

# 6) Frontend UX / UI

- **Donate modal**: amount presets + custom input; “Lightning (recommended)” primary action; optional “On-chain” tab.
- **Show QR** from returned `lnInvoice` (Bolt11). Provide “Copy” & “Open in wallet (lightning:…)” deeplink. (Strike docs explicitly note presenting as QR/string; libraries like `qrcode.react` are fine.) ([Strike API Documentation][1])
- **Timer** (quote/invoice expiration indicator); “Refresh” regenerates (server round-trip). Expiration semantics: **30s for cross-currency quotes, 1h for BTC** on invoice quotes; receive-requests allow custom/default (24h) Lightning expirations. ([Strike API Documentation][1])
- **Success state**: real-time via webhook → server push (SSE/websocket) or client polling of `/status`.
- **Lightning Address**: reveal as advanced option (`yourhandle@strike.me`). ([Strike][2])

---

# 7) Security & Reliability

- **Secrets**: store API key & webhook secret in Vercel env vars. Backend only. ([Strike API Documentation][11])
- **Webhook signature**: HMAC-SHA256 over raw body with webhook subscription secret; compare to `X-Webhook-Signature`. Reject invalid; log attempts. ([Strike API Documentation][9])
- **Idempotency**:

  - Use `idempotency-key` on quote creation endpoints supporting it. ([Strike API Documentation][13])
  - Webhook processing keyed by event `id` or `entityId` + change set to avoid duplicates. ([Strike API Documentation][1])

- **Rate limits**: handle `429` with exponential backoff and jitter. ([Strike API Documentation][6])
- **Failure modes**: quote expiration → regenerate; webhook delivery duplication; transient 5xx → retry; LN invoice expired → show “Refresh Invoice”.

---

# 8) Data Model

**donations**

- `id` (ULID)
- `kind` (`receive_request` | `invoice`)
- `strike_entity_id` (`receiveRequestId` or `invoiceId`)
- `ln_invoice` (text), `btc_address` (text)
- `requested_amount` (decimal), `requested_currency` (enum)
- `settlement_currency` (`BTC`)
- `state` (`CREATED`, `PENDING`, `PAID`, `EXPIRED`, `CANCELED`, `FAILED`)
- `webhook_last_event_id`, `webhook_attempts`, `signature_valid`
- `payer_note` (text)
- Timestamps

**webhooks**

- `id`, `event_id`, `event_type`, `entity_id`, `payload_raw`, `sig_valid`, `processed_at`, `status`.

---

# 9) Admin & Reconciliation

- Dashboard page: filter by date/state; link to entity on Strike; manual “Mark Resolved”.
- Export CSV; compare totals with Strike Dashboard reports. (Strike Dashboard/API provides invoice lists.) ([Strike API Documentation][14])

---

# 10) Environments & Testing

- **Sandbox**: `https://api.dev.strike.me`; test using **testnet** Lightning wallets; expect lower rate limits. ([Strike API Documentation][5])
- Use a **sandbox webhook endpoint** (ngrok → Vercel dev) and a **prod endpoint**; don’t mix secrets.
- Unit tests for signature verification using canned payloads and your secret (HMAC-SHA256). ([Strike API Documentation][9])

---

# 11) Implementation Plan (Technical)

**Backend (Node/TypeScript)**

1. **Client → Server contract**

   - `POST /api/donations/create`:

     - Body: `{ amount?: {currency: 'BTC'|'USD', amount: string}, railPreference?: 'LN'|'ONCHAIN'|'BOTH', note?: string, mode: 'RECEIVE_REQUEST'|'INVOICE' }`
     - Returns: `{ donationId, lnInvoice?, btcAddress?, expiresAt }`

2. **Strike client module**

   - `createReceiveRequest(params)` → `receiveRequestId`, `lnInvoice`, `onchainAddress`. ([Strike API Documentation][7])
   - `issueInvoice(params)` → `invoiceId` (UNPAID). ([Strike API Documentation][8])
   - `createInvoiceQuote(invoiceId)` → `lnInvoice`, `expiration`. ([Strike API Documentation][15])
   - `getInvoice(id)` (state), `getSomethingForReceiveRequest(id)` (if needed per webhook’s entity)

3. **Webhook endpoint** (`/api/strike/webhook`)

   - Read **raw** body buffer; compute HMAC SHA-256 with stored secret; compare to header `X-Webhook-Signature`. ([Strike API Documentation][9])
   - Parse event; for `invoice.updated` (with `changes: ["state"]`), `GET invoice` to fetch state; set donation `PAID` when state=`PAID`. (Strike’s webhook “change” does **not** include the new state; you must fetch it.) ([Strike API Documentation][1])
   - Ensure idempotency with event `id`.

4. **QR rendering**

   - Frontend renders `lnInvoice` as QR; also show alphanumeric invoice for copy; optionally provide `lightning:<lnInvoice>` deeplink. (Strike recommends QR and provides example libs.) ([Strike API Documentation][1])

5. **Expiration handling**

   - Show countdown; on expiry, call server to regenerate.

6. **Observability**

   - Structured logs (JSON), webhook error alerts, DLQ for failed events.

**Security hardening**

- Vercel env secrets; rate limit `/api/donations/create`; CORS locked to your domain; bot-guard on donation creation.

---

# 12) Edge Cases & Policy

- **Zero-amount LN**: Payer can choose any amount in wallet; your server should enforce a **minimum** if you require it (reject tiny amounts before recording fulfillment). ([Strike API Documentation][1])
- **Over/under-pay**: Invoices prevent it; receive-requests permit it – treat anything ≥ your min as valid donation. ([Strike API Documentation][1])
- **Cross-currency**: If you ever invoice in USD but want BTC settlement, a **quote** encapsulates the temporary FX; pay within quote expiration (30s). For BTC-denominated invoices, expiration is 1h. ([Strike API Documentation][1])
- **On-chain fallback**: Receive-request can return **both** a Bolt11 and an on-chain address; on-chain has no enforced amount (suggested amount only). ([Strike API Documentation][1])

---

# 13) Compliance Notes

- This design keeps you within **donations/tips** received to your **own Strike account** via API. The only user identity you handle is optional `payer_note`; Strike handles custody/rails. (Strike Business may have regional constraints and KYC; capabilities (e.g., invoiceable currencies) are discoverable via profile endpoints.) ([Strike API Documentation][1])

---

# 14) Performance & Limits

- Backoff on `429`; cache stable reads; avoid polling by relying on webhooks for confirmation. ([Strike API Documentation][6])
- Use **idempotency-keys** where supported (e.g., creating lightning payment quotes) to avoid duplicates in retries. ([Strike API Documentation][13])

---

# 15) Cut-List / Variants

- **MVP**: Receive-Request (LN only), webhook confirm, admin list.
- **Phase 2**: Add on-chain address fallback; Lightning Address reveal; donor messages; email receipts; Slack alert on `PAID`.
- **Phase 3**: Multi-currency UI; named campaigns; public donor wall (hash/anonymized).

---

# 16) References (Strike docs)

- **Receiving payments (Invoices vs Receive Requests; flows, expirations, QR)**. ([Strike API Documentation][1])
- **Issue Invoice (scope, payload)**. ([Strike API Documentation][8])
- **Create Lightning Payment Quote (idempotency-key)**. ([Strike API Documentation][13])
- **Create Receive Request (zero-amount LN, optional on-chain; expirations)**. ([Strike API Documentation][7])
- **Webhooks Overview / Setup / Duplicates**. ([Strike API Documentation][3])
- **Webhook Signature Verification (HMAC-SHA256; `X-Webhook-Signature`)**. ([Strike API Documentation][9])
- **API Keys (create & use); Authorization header**. ([Strike API Documentation][4])
- **Sandbox (testnet, base URL, lower limits)**. ([Strike API Documentation][5])
- **Lightning Address (Strike FAQ)**. ([Strike][2])

---

## Quick “Known-Good” Endpoint Set (for infra tickets)

- `POST /v1/receive-requests` (scope: `partner.receive-request.create`) – donations/tips. ([Strike API Documentation][7])
- `POST /v1/invoices` (scope: `partner.invoice.create`) – fixed tips. ([Strike API Documentation][8])
- `POST /v1/invoices/{id}/quote` – obtain `lnInvoice` (Bolt11) + expiration. ([Strike API Documentation][15])
- `GET /v1/invoices/{id}` – read state after webhook “updated”. ([Strike API Documentation][12])
- **Webhooks**: subscribe to `invoice.updated`; verify HMAC in `X-Webhook-Signature`. ([Strike API Documentation][1])

---

If you want, I can drop in a **skeletal Next.js/Convex implementation** with typed clients, webhook verifier, and a minimal donations UI that follows this PRD.

[1]: https://docs.strike.me/walkthrough/receiving-payments/ "Receiving payments | Strike API Documentation"
[2]: https://strike.me/en/faq/how-do-i-send-or-receive-payments-using-a-lightning-address/?utm_source=chatgpt.com "Sending to a Lightning address"
[3]: https://docs.strike.me/webhooks/overview/?utm_source=chatgpt.com "Overview | Strike API Documentation"
[4]: https://docs.strike.me/api-keys/overview/?utm_source=chatgpt.com "Overview | Strike API Documentation"
[5]: https://docs.strike.me/sandbox/?utm_source=chatgpt.com "Sandbox | Strike API Documentation"
[6]: https://docs.strike.me/api/?utm_source=chatgpt.com "Introduction | Strike API Documentation"
[7]: https://docs.strike.me/api/create-a-receive-request/?utm_source=chatgpt.com "Create a receive request | Strike API Documentation"
[8]: https://docs.strike.me/api/issue-invoice/?utm_source=chatgpt.com "Issue invoice | Strike API Documentation"
[9]: https://docs.strike.me/webhooks/signature-verification/?utm_source=chatgpt.com "Signature verification | Strike API Documentation"
[10]: https://docs.strike.me/webhooks/setting-up-webhooks/?utm_source=chatgpt.com "Setting up webhooks | Strike API Documentation"
[11]: https://docs.strike.me/api-keys/authorization/?utm_source=chatgpt.com "Authorization | Strike API Documentation"
[12]: https://docs.strike.me/api/find-invoice-by-id/?utm_source=chatgpt.com "Find invoice by ID | Strike API Documentation"
[13]: https://docs.strike.me/api/create-lightning-payment-quote/?utm_source=chatgpt.com "Create lightning payment quote | Strike API Documentation"
[14]: https://docs.strike.me/api/get-invoices/?utm_source=chatgpt.com "Get invoices | Strike API Documentation"
[15]: https://docs.strike.me/walkthrough/receiving-payments/?utm_source=chatgpt.com "Receiving payments | Strike API Documentation"
