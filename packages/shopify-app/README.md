# Delegare Shopify Payments App

This is a prototype of a Shopify Payments App that enables "Agentic Commerce". It allows Shopify merchants to accept autonomous payments from AI agents using the **Delegare** protocol.

## 🚀 The Agentic Flow

1. **Merchant Onboarding:** The merchant installs this app on their Shopify store.
2. **Checkout:** A customer (or their agent) reaches the Shopify checkout and selects **"Delegare — Pay with AI Agent"**.
3. **Redirection:** Shopify redirects the user to this app's `/payment-capture` screen.
4. **Agent Authorization:** 
   - The user can paste their `intentMandate` (SD-JWT-VC) manually.
   - OR, the AI agent can be prompted with the session ID to complete the payment autonomously via an MCP tool.
5. **Settlement:** This app uses the `@delegare/sdk` to charge the token.
6. **Confirmation:** The app notifies Shopify that the payment is successful, and the order is marked as paid.

## ⚙️ Setup

1. Create a **Payments App** in your [Shopify Partner Dashboard](https://partners.shopify.com).
2. Set the following URLs in Shopify:
   - App URL: `https://your-domain.com`
   - Allowed redirection URL: `https://your-domain.com/api/auth/callback`
   - Payment session URL: `https://your-domain.com/api/payments/payment`
   - Refund session URL: `https://your-domain.com/api/payments/refund`
3. Copy `.env.example` to `.env` and fill in your credentials.
4. Install dependencies and start the server:

```bash
pnpm install
pnpm dev
```

## 🛠️ Implementation Details

- **Backend:** Node.js + Express
- **Shopify API:** `@shopify/shopify-api`
- **Delegare SDK:** `@delegare/sdk` (Workspace dependency)
