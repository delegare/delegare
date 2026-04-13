# @delegare/sdk

The official TypeScript SDK for **Delegare** – Trustless payment delegation for AI agents.

Delegare empowers AI agents to spend money on behalf of users across the web without requiring a human-in-the-loop or a wallet popup for every transaction. 

This SDK allows developers to:
1. **Merchants:** Accept programmatic AP2 Intent Mandates (`SD-JWT-VC`) as payment from agents.
2. **Agents:** Seamlessly satisfy **x402 Payment Required** paywalls using a pre-authorized budget.

---

## Installation

```bash
pnpm add @delegare/sdk
# or
npm install @delegare/sdk
# or
yarn add @delegare/sdk
```

---

## 1. Agent Autonomy: x402 Auto-Payments

When building an AI agent, you often need to fetch data or invoke tools from monetized APIs (e.g., APIs protected by the `x402` protocol or Google's Agentic Commerce Protocol). 

Instead of halting the agent to prompt the user for payment, the Delegare SDK provides a drop-in replacement for the native `fetch` function. If the server returns a `402 Payment Required` challenge, Delegare automatically signs an `EIP-3009` authorization under the hood using the user's spending mandate, and retries the request seamlessly.

```typescript
import { Delegare } from '@delegare/sdk';

// Initialize the client
const delegare = new Delegare({
  merchantId: 'm_your_agent_platform_id',
  apiKey: process.env.DELEGARE_API_KEY
});

// The user's pre-authorized spending token (SD-JWT-VC)
const intentMandate = "eyJhbGciOiJIUzI1Ni... (truncated)";

// 1. Fetch a resource that might be paywalled
// If the server returns 402, Delegare intercepts it, checks the required price 
// against the user's monthly budget, signs the payment, and fetches the data.
const response = await delegare.fetch(
  'https://api.premium-data-provider.com/weather',
  { method: 'GET' },
  intentMandate // Automatically authorize if x402 paywall is hit
);

const data = await response.json();
console.log(data); // Returns the premium data!
```

---

## 2. Merchants: Accept AP2 Intent Mandates

If you are a merchant, store, or service provider, you can use the SDK to charge an AI agent that visits your platform with a valid spending mandate.

```typescript
import { Delegare } from '@delegare/sdk';

const delegare = new Delegare({
  merchantId: process.env.DELEGARE_MERCHANT_ID,
  apiKey: process.env.DELEGARE_API_KEY
});

// An AI agent sends you their intentMandate to buy something
app.post('/api/checkout', async (req, res) => {
  const { intentMandate, orderId } = req.body;

  try {
    const receipt = await delegare.charge({
      intentMandate,
      amountCents: 1500, // $15.00
      currency: 'usd',
      description: 'Premium AI API Call',
      idempotencyKey: orderId // Prevents double-charging
    });

    if (receipt.status === 'completed') {
      res.json({ success: true, orderId });
    } else {
      res.status(402).json({ error: 'Payment failed (limit exceeded or declined)' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

---

## Core API Reference

### `delegare.fetch(url, init?, intentMandate?)`
A wrapper around the native `fetch` API. If a 402 response is returned with `X-PAYMENT` requirements, it signs the payment securely and retries the request.

### `delegare.charge(params)`
Execute a payment against a given AP2 intent mandate.

### `delegare.getBalance(intentMandate)`
Query the remaining monthly limit for a specific mandate.
```typescript
const balance = await delegare.getBalance('mandate_id_here');
console.log(`Remaining monthly budget: $${balance.remainingMonthlyBudgetCents / 100}`);
```

### `delegare.createSetupSession(params)`
Generates a URL where your human users can safely authorize a spending budget for their agents.
```typescript
const session = await delegare.createSetupSession({
  maxPerTxCents: 5000,          // $50 max per transaction
  maxMonthlySpendCents: 20000,  // $200 max per month
  rail: 'both'                  // Support fiat (Stripe) and crypto (Base USDC)
});
console.log(`Direct user to: ${session.setupUrl}`);
```

### `delegare.waitForSetup(sessionToken)`
Polls the setup session until the user completes the flow in their browser, returning the newly minted `intentMandate` to be given to the agent.
```typescript
const intentMandate = await delegare.waitForSetup(session.sessionToken);
```

---

## Environments

By default, the SDK points to the Delegare production API. For testing, supply the sandbox `baseUrl` during initialization:

```typescript
const delegare = new Delegare({
  merchantId: 'm_test_...',
  apiKey: 'dk_test_...',
  baseUrl: 'https://api.sandbox.delegare.dev/v1'
});
```

## Links
- [Documentation](https://docs.delegare.dev)
- [Dashboard](https://app.delegare.dev)
- [GitHub](https://github.com/delegare)
