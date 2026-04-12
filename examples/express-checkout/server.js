import express from 'express';
import cors from 'cors';
import { Delegare } from '@delegare/sdk';
import 'dotenv/config';

// ── Store Database (Mock) ────────────────────────────────────────────────
const STORE_ITEMS = {
  'large_pepperoni_pizza': { priceCents: 1800, name: 'Large Pepperoni Pizza' },
  'vegan_burger': { priceCents: 1250, name: 'Vegan Burger' },
  'coffee_beans': { priceCents: 2200, name: '1lb Espresso Beans' },
  'shopify_handbag': { priceCents: 15000, name: 'Designer Handbag' },
};

// ── Delegare Client Initialization ─────────────────────────────────────────
// The SDK authenticates your backend with the Delegare platform.
const delegare = new Delegare({
  merchantId: process.env.DELEGARE_MERCHANT_ID,
  apiKey: process.env.DELEGARE_API_KEY,
  // Optional: override if testing locally against a dev Delegare server
  baseUrl: process.env.DELEGARE_BASE_URL,
});

const app = express();
app.use(cors());
app.use(express.json());

// ── x402 Auto-Payment Route (API Paywall) ────────────────────────────────
app.get('/api/premium-data', async (req, res) => {
  const xPayment = req.header('x-payment');
  const xMandate = req.header('x-delegare-mandate');
  const merchantWallet = process.env.MERCHANT_USDC_WALLET || '0x0000000000000000000000000000000000000000';

  if (!xPayment && !xMandate) {
    // 1. Agent asks for data, merchant returns 402 with price requirements
    console.log('🔒 Agent requested premium data. Issuing x402 challenge ($0.05 USDC).');
    res.status(402).json({
      error: 'payment_required',
      accepts: [
        {
          scheme: 'exact',
          network: 'base',
          asset: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC Base
          maxAmountRequired: '0.05',
          payTo: merchantWallet,
          resource: 'http://localhost:4000/api/premium-data',
          mimeType: 'application/json',
          maxTimeoutSeconds: 3600
        }
      ]
    });
    return;
  }

  try {
    let txHash;
    let rail;

    if (xMandate) {
      // 2a. Agent auto-retries with a pure Intent Mandate (AP2 / MCP compatibility)
      console.log('✅ Agent returned with X-DELEGARE-MANDATE header. Charging mandate directly...');
      const receipt = await delegare.charge({
        intentMandate: xMandate,
        amountCents: 5, // 0.05 USDC = 5 cents
        currency: 'usd', // Billed in USD equivalent
        description: 'x402: Premium API Data',
        idempotencyKey: `x402_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        metadata: {
          resource: '/api/premium-data',
        },
      });
      txHash = receipt.receiptId;
      rail = receipt.rail;
    } else if (xPayment) {
      // 2b. Agent auto-retries with a signed EIP-3009 X-PAYMENT header (Native OpenClaw EVM)
      console.log('✅ Agent returned with X-PAYMENT header. Validating and settling EIP-3009...');
      const paymentData = JSON.parse(Buffer.from(xPayment, 'base64').toString('utf8'));
      
      // Pass the signed payment directly to Delegare to verify and settle it
      const vaultUrl = process.env.DELEGARE_BASE_URL || 'https://api.sandbox.delegare.dev/v1';
      
      const settleRes = await fetch(`${vaultUrl}/x402/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment: paymentData,
          requirements: {
            price: '0.05',
            currency: 'usdc',
            network: 'base',
            payTo: merchantWallet
          }
        })
      });

      if (!settleRes.ok) {
        console.log('❌ Settlement failed.');
        res.status(400).json({ error: 'invalid_payment' });
        return;
      }

      const result = await settleRes.json();
      txHash = result.txHash;
      rail = 'crypto';
    }

    // 3. Attach the receipt to the response header and deliver the goods
    res.setHeader('X-Payment-Response', Buffer.from(JSON.stringify({ success: true, receipt: txHash })).toString('base64'));
    res.json({
      secret: 'AI agents love this premium data.',
      weather: 'Sunny',
      temp: 72,
      txHash: txHash
    });
    console.log(`🎉 Premium data delivered! TxHash: ${txHash} (${rail})`);

  } catch (err) {
    console.error(`❌ Payment validation failed:`, err.message);
    res.status(403).json({ error: 'invalid_x_payment_header', message: err.message });
  }
});

// ── Checkout Endpoint for Agents ──────────────────────────────────────────
// An AI agent (or a traditional web frontend) calls this endpoint with an 
// `intentMandate` (SD-JWT-VC) to authorize the purchase.
app.post('/api/checkout', async (req, res) => {
  const { intentMandate, item, deliveryAddress } = req.body;

  if (!intentMandate || !item) {
    res.status(400).json({ error: 'Missing required parameters: intentMandate or item' });
    return;
  }

  const product = STORE_ITEMS[item];
  if (!product) {
    res.status(404).json({ error: `Product '${item}' not found in catalog` });
    return;
  }

  // Generate an idempotency key so we don't accidentally double-charge 
  // the agent if the network drops and it retries.
  const orderId = `ord_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const idempotencyKey = `checkout_${orderId}`;

  try {
    console.log(`🛒 Received order from agent for: ${product.name} ($${(product.priceCents / 100).toFixed(2)})`);
    console.log(`💸 Charging via intent mandate: ${intentMandate.substring(0, 15)}...`);

    // 1. Charge the agent!
    // Delegare automatically routes this over Stripe (Fiat) or Base (Crypto)
    // based on what the user configured during their setup.
    const receipt = await delegare.charge({
      intentMandate,
      amountCents: product.priceCents,
      currency: 'usd',
      description: `Order: ${product.name}`,
      idempotencyKey,
      metadata: {
        item_id: item,
        delivery_address: deliveryAddress || 'Virtual Delivery',
      }
    });

    console.log(`✅ Payment successful! Receipt ID: ${receipt.receiptId}`);
    
    // 2. Complete the internal business logic (e.g. print pizza ticket, email user, update Shopify stock)
    // ...

    res.status(200).json({
      success: true,
      message: `Successfully charged $${(product.priceCents / 100).toFixed(2)} and completed order.`,
      orderId,
      receiptId: receipt.receiptId,
      railUsed: receipt.rail, // Shows whether it settled via 'fiat' or 'crypto'
    });

  } catch (error) {
    // The SDK automatically throws detailed HTTP errors if the agent runs out of budget,
    // revokes their token, or hits a rail mismatch.
    console.error(`❌ Payment failed:`, error.message);
    
    res.status(402).json({
      success: false,
      error: 'payment_failed',
      message: error.message,
    });
  }
});

// Start the e-commerce mock server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🍕 Express Checkout running on http://localhost:${PORT}`);
  console.log(`Store items available for agents to buy:`);
  Object.keys(STORE_ITEMS).forEach(k => console.log(` - ${k}: $${(STORE_ITEMS[k].priceCents / 100).toFixed(2)}`));
});
