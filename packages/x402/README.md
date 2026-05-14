# @delegare/x402

[![npm version](https://img.shields.io/npm/v/@delegare/x402.svg)](https://www.npmjs.com/package/@delegare/x402)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Gate your Express API routes behind USDC micropayments or fiat credit bundles with a single line of middleware.

This package implements the merchant side of the [x402 protocol](https://delegare.dev/concepts/x402-payments) with **multi-protocol discovery support**: it simultaneously handles x402 v2 (CDP Bazaar / agentic.market), MPP (MPPScan / RFC 7235), Delegare AP2 mandates, and fiat credit bundles. Settlement routes through either the CDP Facilitator or Delegare — whichever matches the client's payment credential.

Endpoints listed automatically on **[Delegare Market](https://market.delegare.dev)** (aggregates x402 + MPP), [agentic.market](https://agentic.market), and [mppscan.com](https://mppscan.com).

## Installation

```bash
pnpm add @delegare/x402
```

## Quick Start (USDC/Crypto)

```typescript
import express from 'express';
import { requireX402Payment } from '@delegare/x402';

const app = express();

app.get('/premium-data',
  requireX402Payment({
    price: '0.05',                  // 5 cents USDC
    payTo: '0xYourWalletAddress',   // Your Base wallet
  }),
  (req, res) => {
    res.json({ data: 'premium content', paidBy: (req as any).x402Payer });
  }
);

app.listen(4000);
```

## Dual-Rail Payments (Fiat Fallback)

Add a Stripe-backed credit bundle path for B2B clients without crypto wallets. Clients pre-purchase a bundle, receive a JWT, and send it via `X-Bundle-Token`.

```typescript
app.post('/api/agent',
  requireX402Payment({
    price: '0.02',
    payTo: '0xYourWalletAddress',
    creditBundle: {
      tiers: [
        { name: 'Starter', usdCents: 1000, requests: 500 },
        { name: 'Pro', usdCents: 5000, requests: 3000 }
      ],
      purchaseUrl: 'https://yourapp.com/billing/bundles',
      validateAndDeduct: async (token: string) => {
        return { valid: true, creditsRemaining: 499, tenantId: 'org-123' };
      },
    },
  }),
  (req, res) => res.json({ success: true })
);
```

## Agent Discovery (CDP Bazaar + MPPScan)

Use `declareDiscoveryExtension` to make your endpoint searchable on [Delegare Market](https://market.delegare.dev) (aggregates both), [agentic.market](https://agentic.market), and [mppscan.com](https://mppscan.com).

Place it **before** `requireX402Payment`. The metadata is embedded in both the `PAYMENT-REQUIRED` header (x402 v2, read by CDP Bazaar) and the `WWW-Authenticate` header (MPP/RFC 7235, read by MPPScan).

**CDP Bazaar indexing** happens automatically the first time a payment settles through the CDP Facilitator. After that, the endpoint appears on [agentic.market](https://agentic.market) and [Delegare Market](https://market.delegare.dev).

```typescript
import { requireX402Payment, declareDiscoveryExtension } from '@delegare/x402';

app.post('/api/extract',
  declareDiscoveryExtension({
    description: "Extract structured financial data from documents. $0.15/page.",
    inputSchema: {
      type: "object",
      properties: {
        documentId: { type: "string", description: "Document ID to extract from" },
        domain: { type: "string", enum: ["commercial_loan", "equity_investment"] }
      },
      required: ["documentId"]
    },
    bodyType: "json",
    output: {
      example: { extractedData: { gross_income: 1250000 }, pageCount: 10, costCents: 150 },
      // schema is required for CDP Bazaar to accept the index entry
      schema: {
        type: "object",
        properties: {
          extractedData: { type: "object" },
          pageCount: { type: "number" },
          costCents: { type: "number" }
        }
      }
    }
  }),
  requireX402Payment({ price: '0.15', payTo: '0xYourWalletAddress' }),
  async (req, res) => {
    res.json({ data: '...' });
  }
);
```

### Triggering CDP Bazaar Indexing

CDP indexes your endpoint the first time a **`PAYMENT-SIGNATURE`** credential is settled through their facilitator. To trigger this for existing endpoints without waiting for organic traffic, use `@x402/fetch` with your wallet:

```typescript
import { wrapFetchWithPayment, x402Client } from '@x402/fetch';
import { ExactEvmScheme } from '@x402/evm';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
const client = new x402Client();
client.register('eip155:8453', new ExactEvmScheme(account as any));
const x402Fetch = wrapFetchWithPayment(fetch, client);

// This hits your live endpoint, gets the real 402 challenge, signs + settles via CDP
await x402Fetch('https://yourapi.com/api/extract', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ documentId: 'test' }),
});
```

### Authenticated CDP Settlement (Required for Bazaar)

For CDP to accept your settlement and write the catalog entry, set these environment variables:

```env
COINBASE_API_KEY=your-cdp-key-id        # CDP API key UUID
COINBASE_API_SECRET=your-cdp-secret     # Base64-encoded Ed25519 key (64 bytes)
```

The middleware automatically builds a CDP JWT and attaches `Authorization: Bearer <jwt>` to the `/settle` call when these are present.

## What the 402 Response Emits

Every unauthenticated request receives three parallel discovery headers:

| Header | Protocol | Read by |
|--------|----------|---------|
| `PAYMENT-REQUIRED` | x402 v2 | [Delegare Market](https://market.delegare.dev), CDP Bazaar, agentic.market |
| `WWW-Authenticate: Payment ...` | MPP / RFC 7235 | MPPScan, MPP-compatible clients |
| `BAZAAR-EXTENSION` | Delegare | Debug / custom clients |

Plus a JSON body for backward-compatible x402 v1 clients.

## Payment Rails (Priority Order)

| Header sent by client | Rail | Settlement |
|-----------------------|------|------------|
| `X-Bundle-Token` | Fiat credit bundle | Stripe (your backend) |
| `PAYMENT-SIGNATURE` | x402 v2 USDC | CDP Facilitator → on-chain |
| `X-PAYMENT` | x402 v1 USDC | Delegare Facilitator → on-chain |
| `X-DELEGARE-MANDATE` | AP2 intent mandate | Delegare Vault |
| `Authorization: Payment` | MPP | Delegare Facilitator |

## Configuration Reference

```typescript
requireX402Payment({
  // Required
  price: '0.05',                    // Decimal USDC (e.g. "0.05" = 5 cents)
  payTo: '0xYourWallet',            // Base wallet receiving payment

  // Optional
  testMode: true,                   // Use Base Sepolia (default: false)
  apiUrl: 'https://api.sandbox.delegare.dev/v1',
  resource: 'https://yourapi.com/api/endpoint', // Full URL for catalog key
  mimeType: 'application/json',
  maxTimeoutSeconds: 300,
  creditBundle: { ... }             // Fiat fallback config
});
```

## Accessing Payment Context

```typescript
app.get('/premium-data',
  requireX402Payment({ price: '0.05', payTo: '0xYourWallet' }),
  (req, res) => {
    const payer = (req as any).x402Payer;        // Wallet address
    const txHash = (req as any).x402Transaction;  // On-chain tx hash
    res.json({ paidBy: payer });
  }
);
```

## Learn More

- [Delegare Documentation](https://docs.delegare.dev)
- [Delegare Market](https://market.delegare.dev) — x402 + MPP aggregator marketplace
- [x402 Protocol](https://docs.delegare.dev/concepts/x402-payments)
- [CDP Bazaar](https://docs.cdp.coinbase.com/x402/bazaar)
- [MPPScan Discovery](https://mppscan.com/discovery)
