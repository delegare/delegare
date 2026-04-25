# @delegare/x402

[![npm version](https://img.shields.io/npm/v/@delegare/x402.svg)](https://www.npmjs.com/package/@delegare/x402)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Gate your Express API routes behind USDC micropayments or fiat credit bundles with a single line of middleware. 

This package implements the merchant side of the [x402 protocol](https://delegare.dev/concepts/x402-payments), handling 402 payment challenges and receipt verification. Settlement is securely handled by Delegare's infrastructure on the Base blockchain.

## Installation

```bash
npm install @delegare/x402
```

## Quick Start (Crypto/USDC)

Monetize an endpoint for 5 cents (USDC) per call. Any AI agent using the Delegare SDK will automatically resolve the challenge and pay you directly on Base.

```typescript
import express from 'express';
import { requireX402Payment } from '@delegare/x402';

const app = express();

app.get('/premium-data',
  requireX402Payment({
    price: '0.05',                  // 5 cents USDC
    payTo: '0xYourWalletAddress',   // Your Base wallet receiving funds
  }),
  (req, res) => {
    // Reached only after payment is verified
    res.json({ data: 'premium content', paidBy: (req as any).x402Payer });
  }
);

app.listen(4000);
```

## Dual-Rail Payments (Fiat Fallback)

Not all B2B agents have a crypto wallet. You can configure a **Credit Bundle Fallback** to add a fiat path (e.g., Stripe) alongside the crypto path.

Clients pre-purchase a bundle via your checkout URL, receive a JWT, and send it via the `X-Bundle-Token` header to bypass the crypto rails.

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
      // Your custom logic to validate the JWT and deduct a credit from your DB
      validateAndDeduct: async (token: string) => {
        return { valid: true, creditsRemaining: 499, tenantId: 'org-123' };
      },
    },
  }),
  (req, res) => res.json({ success: true })
);
```

## CDP Bazaar Discovery Indexing

Make your paid API endpoints semantically searchable on the [Coinbase Developer Platform (CDP) Bazaar](https://docs.cdp.coinbase.com/agentkit/docs/bazaar) by using `declareDiscoveryExtension`.

When an agent settles a payment through Delegare, this metadata is automatically pushed to the CDP index.

```typescript
import { requireX402Payment, declareDiscoveryExtension } from '@delegare/x402';

app.post('/api/extract',
  declareDiscoveryExtension({
    description: "Structured financial data from unstructured documents.",
    input: { documentId: "doc-123" },
    inputSchema: {
      type: "object",
      properties: { documentId: { type: "string" } },
      required: ["documentId"]
    },
    bodyType: "json",
    output: {
      example: { extractedData: { income: 125000 }, costCents: 15 }
    }
  }),
  requireX402Payment({ price: '0.15', payTo: '0xYourWalletAddress' }),
  async (req, res) => {
    res.json({ data: '...' });
  }
);
```

## Configuration Reference

```typescript
requireX402Payment({
  // Required
  price: '0.05',                    // Decimal USDC (e.g. "0.05" = 5 cents)
  payTo: '0xYourWallet',            // Base wallet receiving payment

  // Optional
  testMode: true,                   // Use Base Sepolia (default: false)
  apiUrl: 'https://api.sandbox.delegare.dev/v1', // Delegare API endpoint
  resource: '/api/premium-data',    // Override resource ID
  mimeType: 'application/json',     // Content type advertised in challenge
  maxTimeoutSeconds: 3600,          // Payment validity window
  creditBundle: { ... }             // Optional fiat fallback config
});
```

## Learn More

- [Delegare Documentation](https://docs.delegare.dev)
- [x402 Protocol Concept](https://docs.delegare.dev/concepts/x402-payments)
- [Dual-Rail Settlement](https://docs.delegare.dev/concepts/dual-rail-payments)