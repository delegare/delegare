# Delegare Express Checkout Example

This is a minimal Express backend demonstrating how an e-commerce store (like a Shopify app or a local pizza shop) can accept payments autonomously from AI agents using **Delegare**.

Instead of redirecting users to a Stripe checkout page, your API allows an AI agent to execute a payment directly, programmatically, and safely using the user's spending mandate.

## 🚀 How it works

1. **The User's Agent** visits your store's API and decides to buy something.
2. The agent sends an opaque `intentMandate` (SD-JWT-VC, authorized by the user up to a certain budget) to your `/checkout` endpoint.
3. **Your Express Server** uses the `@delegare/sdk` to charge the agent using your `merchantId` and `apiKey`.
4. Delegare moves the funds from the user's card or crypto wallet to your Stripe account or Smart Contract Treasury.
5. Your server completes the order!

## ⚙️ Setup

1. Copy `.env.example` to `.env`
2. Fill in your **Test Merchant ID** and **Test API Key** from your [Sandbox Dashboard](https://app.sandbox.delegare.dev)

```bash
cp .env.example .env
```

3. Install dependencies and start the server:

```bash
npm install
npm run dev
```

## 🛍️ Generating a "Buyer" Intent Mandate

To simulate an AI agent buying something from your store, you need to pretend to be a customer who has authorized this merchant to spend money on their behalf. We have included a helper script that generates a checkout link and polls for completion:

```bash
npm run setup
```

1. Run the command above.
2. Click the generated Sandbox URL in your terminal.
3. Connect your Wallet (Crypto) or Credit Card (Fiat) in the browser UI (Use Stripe Test Cards or Base Sepolia).
4. Set your monthly spending limit for this "agent".
5. Return to your terminal! The script will automatically detect your completion and print out your new `intentMandate` (a signed SD-JWT-VC).

## 🧪 Testing the API

Now that you have your `eyJhbGci...` mandate, you can simulate your AI agent ordering a pizza by sending a POST request to your new server:

```bash
curl -X POST http://localhost:4000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "intentMandate": "eyJhbGciOiJFU...",
    "item": "large_pepperoni_pizza",
    "deliveryAddress": "123 AI Avenue"
  }'
```

If the agent's mandate is valid, hasn't expired, and has enough budget, the payment will succeed, and the pizza will be "ordered"! Check your backend terminal logs to see the Delegare SDK processing the charge in real time.
