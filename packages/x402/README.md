# @delegare/x402

Gate your API routes behind USDC micropayments using **Google's AP2 protocol** alongside multi-protocol discovery — CDP Bazaar, MPPScan, and Delegare AP2 mandates.

The `@delegare/x402` package lets merchants monetize API endpoints using the x402 protocol while crucially implementing [Google's AP2 (Agentic Payment Protocol)](https://github.com/google-agentic-commerce/AP2). This guarantees secure, autonomous transactions where the **AI agent never holds private keys, credit card credentials, or raw funds**. Instead, agents operate strictly via pre-authorized intent mandates (SD-JWT-VC).

Beyond security, it handles the 402 challenge, payment verification, and settlement across multiple payment rails, and automatically embeds discovery metadata. This makes your endpoint seamlessly indexable on [Delegare Market](https://market.delegare.dev), [agentic.market](https://agentic.market) (CDP Bazaar), and [mppscan.com](https://mppscan.com) (MPP) — one middleware, zero exposed credentials, three directories.

## 🔒 Secured by Google's AP2 Protocol

Traditional agentic payments force developers to provision wallets with live funds or inject raw credit card details into the LLM context window—a massive security vulnerability.

`@delegare/x402` natively implements [Google's AP2 (Agentic Payment Protocol)](https://github.com/google-agentic-commerce/AP2):

1. **No Keys in Context:** Agents are issued an **Intent Mandate** (SD-JWT-VC) rather than returning raw card details or wallet seeds.
2. **Bounded Authority:** Mandates define strict, server-side enforced spending limits and permitted rails.
3. **Zero-Trust Validation:** The middleware cryptographically verifies the mandate before settling the payment on-chain or via fiat fallbacks.

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
