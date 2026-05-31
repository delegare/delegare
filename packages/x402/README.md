# @delegare/x402

**AP2-native x402 + MPP middleware for Express. Dual-rail by default. Auto-discoverable on three directories in one call.**

`@delegare/x402` is the only x402 middleware that ships every production concern in a single drop-in: protocol coverage (x402 v1/v2 + MPP/RFC 7235), payment rails (USDC on Base + Stripe fiat fallback), discovery emission (CDP Bazaar + MPPScan + Delegare Market), and AP2 mandate verification ([Google's Agentic Payment Protocol](https://github.com/google-agentic-commerce/AP2)). One `requireX402Payment({...})` call gets you all of it.

## Why this package

- **AP2-native, not bolted on.** Agents authenticate against bounded SD-JWT-VC mandates issued by the Delegare facilitator. **No private keys, no card details, no raw funds in agent context.** Spending limits, allowed rails, expiry are server-enforced before any settlement.
- **Dual-rail by default.** Crypto path (USDC on Base, EIP-3009 `receiveWithAuthorization`) and fiat path (Stripe-purchased credit bundles via `X-Bundle-Token`) coexist on the same route. Clients with no wallet get a path; corporate-AP buyers get an invoice; the middleware picks the right rail from headers.
- **Multi-protocol discovery in one middleware.** Every 402 response emits Bazaar `PAYMENT-REQUIRED` (x402 v2), MPP `WWW-Authenticate` (RFC 7235), and Delegare Market metadata simultaneously — your service shows up on [agentic.market](https://agentic.market), [mppscan.com](https://mppscan.com), and [market.delegare.dev](https://market.delegare.dev) without separate registration.
- **Multi-facilitator settlement.** The middleware routes v2 `PAYMENT-SIGNATURE` to CDP and v1 `X-PAYMENT` / `X-DELEGARE-MANDATE` to the Delegare facilitator — keep your existing CDP setup, gain everything else.

## Pricing

The middleware itself is MIT-licensed and free. Settlement through the Delegare facilitator (the default `apiUrl`) carries a transaction fee:

| Transaction amount | Fee |
| --- | --- |
| Under $0.17 | $0.005 (floor — covers Base EIP-3009 gas) |
| $0.17 – $1.00 | 3% of amount |
| $1.00 and above | $0.03 (flat cap) |

So a $0.05 USDC call costs you $0.005 in fees, a $0.50 call costs $0.015, and a $10 call costs $0.03. No subscription, no per-seat, no minimum monthly. Settling through CDP directly via `PAYMENT-SIGNATURE` is also supported and uses CDP's fee schedule. Stripe-bundle fallback uses the same percentage-with-bounds model. See [`/.well-known/ap2.json`](https://api.delegare.dev/.well-known/ap2.json) for the live fee declaration.

## Installation

```bash
pnpm install @delegare/x402
```

## Quick Start

```typescript
import express from "express";
import { requireX402Payment } from "@delegare/x402";

const app = express();

app.get(
  "/premium-data",
  requireX402Payment({
    price: "0.05", // 5 cents USDC per call
    payTo: "0xYourWalletAddress", // Your Base wallet
  }),
  (req, res) => {
    res.json({ data: "premium content" });
  },
);

app.listen(4000);
```

## Dual-Rail Payments (Fiat Fallback)

Not all agent developers have a crypto wallet. Configure a **Credit Bundle Fallback** to add a Stripe-backed fiat path alongside the crypto path.

```typescript
app.post(
  "/api/agent",
  requireX402Payment({
    price: "0.02",
    payTo: "0xYourWalletAddress",
    creditBundle: {
      tiers: [
        { name: "Starter", usdCents: 1000, requests: 500 },
        { name: "Pro", usdCents: 5000, requests: 3000 },
      ],
      purchaseUrl: "https://yourapp.com/billing/bundles",
      validateAndDeduct: async (token: string) => {
        return { valid: true, creditsRemaining: 499, tenantId: "org-123" };
      },
    },
  }),
  (req, res) => res.json({ success: true }),
);
```

Clients pay once via Stripe, receive a bundle token, and send it via `X-Bundle-Token` to bypass crypto.

## Agent Discovery (Delegare Market, CDP Bazaar + MPPScan)

Use `declareDiscoveryExtension` to make your endpoint automatically discoverable on [Delegare Market](https://market.delegare.dev), [agentic.market](https://agentic.market), and [mppscan.com](https://mppscan.com). Place it before `requireX402Payment`.

The metadata is embedded in both the `PAYMENT-REQUIRED` header (x402 v2, read by CDP Bazaar) and the `WWW-Authenticate` header (MPP/RFC 7235, read by MPPScan) on every 402 response.

```typescript
import { requireX402Payment, declareDiscoveryExtension } from "@delegare/x402";

app.post(
  "/api/extract",
  declareDiscoveryExtension({
    description:
      "Extract structured financial data from documents. $0.15/page.",
    // CDP Bazaar 2026-05 display fields — surface on agentic.market.
    // Provider-supplied; CDP moderates and re-hosts iconUrl.
    serviceName: "Acme Document Intelligence",
    tags: ["document-extraction", "ocr", "financial-data"],
    iconUrl: "https://acme.example.com/icon-512.png",
    inputSchema: {
      type: "object",
      properties: {
        documentId: { type: "string", description: "Document ID" },
        domain: {
          type: "string",
          enum: ["commercial_loan", "equity_investment"],
        },
      },
      required: ["documentId"],
    },
    bodyType: "json",
    output: {
      example: { extractedData: { gross_income: 1250000 }, costCents: 150 },
      schema: {
        type: "object",
        properties: {
          extractedData: { type: "object" },
          costCents: { type: "number" },
        },
      },
    },
  }),
  requireX402Payment({ price: "0.15", payTo: "0xYourWalletAddress" }),
  async (req, res) => {
    res.json({ data: "..." });
  },
);
```

> **Note:** `output.schema` is required (not just `example`) for CDP Bazaar to accept the index entry. Without it, the validator will report "schema is invalid" even if all other checks pass.
>
> **CDP Bazaar update (2026-05):** the [`/discovery/resources` schema](https://docs.cdp.coinbase.com/api-reference/v2/rest-api/x402-facilitator/list-x402-resources) now surfaces `serviceName`, `tags`, and `iconUrl` directly on indexed resources. Set them on every paid route — without them, the listing on agentic.market is bland and uncategorised.

### How Bazaar Indexing Works

CDP Bazaar indexes your endpoint the **first time a `PAYMENT-SIGNATURE` credential is settled** through their facilitator. The middleware handles this automatically:

1. An agent hits your endpoint with `PAYMENT-SIGNATURE` (x402 v2 credential from `@x402/fetch`)
2. The middleware passes the full payment payload — including your `declareDiscoveryExtension` metadata — directly to CDP's `/settle` endpoint
3. CDP settles on-chain and writes the catalog entry
4. Your endpoint appears on [agentic.market](https://agentic.market) within ~10 minutes

To trigger indexing for existing endpoints without waiting for organic traffic, use the `@x402/fetch` client with your own wallet to make one test payment per endpoint. See the [CDP Bazaar docs](https://docs.cdp.coinbase.com/x402/bazaar) for details.

### Required Environment Variables for Bazaar

```env
COINBASE_API_KEY=your-cdp-key-id       # CDP API key UUID
COINBASE_API_SECRET=your-cdp-secret    # Base64-encoded Ed25519 key (64 bytes)
```

When set, the middleware automatically authenticates CDP settlement calls with a signed JWT — required for Bazaar catalog writes.

## What the 402 Response Emits

Every unauthenticated request receives three parallel discovery headers:

| Header                          | Protocol       | Read by                                                                                 |
| ------------------------------- | -------------- | --------------------------------------------------------------------------------------- |
| `PAYMENT-REQUIRED`              | x402 v2        | [Delegare Market](https://market.delegare.dev), CDP Bazaar, agentic.market, @x402/fetch |
| `WWW-Authenticate: Payment ...` | MPP / RFC 7235 | [Delegare Market](https://market.delegare.dev), MPPScan, MPP-compatible wallets         |
| `BAZAAR-EXTENSION`              | Delegare debug | Custom clients                                                                          |

Plus a JSON body for backward-compatible x402 v1 clients.

## Payment Rails (Priority Order)

The middleware accepts five types of payment credentials in this order:

| Client header            | Rail               | Settlement                  |
| ------------------------ | ------------------ | --------------------------- |
| `X-Bundle-Token`         | Fiat credit bundle | Your backend (Stripe)       |
| `PAYMENT-SIGNATURE`      | x402 v2 USDC       | CDP Facilitator → Base      |
| `X-PAYMENT`              | x402 v1 USDC       | Delegare Facilitator → Base |
| `X-DELEGARE-MANDATE`     | AP2 intent mandate | Delegare Vault              |
| `Authorization: Payment` | MPP/RFC 7235       | Delegare Facilitator        |

## Configuration

```typescript
requireX402Payment({
  // Required
  price: '0.05',                    // Decimal USDC (e.g. "0.05" = 5 cents)
  payTo: '0xYourWallet',            // Base wallet receiving payment

  // Optional
  testMode: true,                   // Use Base Sepolia (default: false)
  apiUrl: 'https://api.sandbox.delegare.dev/v1',
  resource: 'https://yourapi.com/api/endpoint', // Full URL — used as catalog key
  mimeType: 'application/json',
  maxTimeoutSeconds: 300,
  creditBundle: { ... }
});
```

## Accessing Payment Context

```typescript
app.get(
  "/premium-data",
  requireX402Payment({ price: "0.05", payTo: "0xYourWallet" }),
  (req, res) => {
    const payer = (req as any).x402Payer; // Payer's wallet address
    const txHash = (req as any).x402Transaction; // On-chain tx hash
    res.json({ data: "...", paidBy: payer });
  },
);
```

## Testing with Sandbox

```typescript
requireX402Payment({
  price: "0.01",
  payTo: "0xYourTestnetWallet",
  testMode: true,
  apiUrl: "https://api.sandbox.delegare.dev/v1",
});
```

## Related

- [x402 Payments](https://docs.delegare.dev/concepts/x402-payments) — How x402 works end-to-end
- [TypeScript SDK](https://docs.delegare.dev/sdk-tools/typescript-sdk) — Agent-side `delegare.fetch()` for auto-paying 402s
- [MCP Tools](https://docs.delegare.dev/sdk-tools/mcp-tools) — `delegare_fetch` tool for LLM agents
- [CDP Bazaar](https://docs.cdp.coinbase.com/x402/bazaar) — Coinbase discovery catalog
- [MPPScan Discovery](https://mppscan.com/discovery) — MPP discovery spec
