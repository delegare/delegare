import express from 'express';
import cors from 'cors';
import { Delegare } from '@delegare/sdk';
import { requireX402Payment } from '@delegare/x402';
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

// ── Catalog Endpoint for Agents ──────────────────────────────────────────
// Agents should query this endpoint first to learn the exact price of an item 
// before asking the user for a spending mandate.
app.get('/api/products/:item', (req, res) => {
  const item = req.params.item;
  const product = STORE_ITEMS[item];
  if (!product) {
    res.status(404).json({ error: 'product_not_found', message: `Product '${item}' not found in catalog` });
    return;
  }
  res.json({ id: item, ...product });
});

app.get('/api/products', (req, res) => {
  const products = Object.keys(STORE_ITEMS).map(id => ({ id, ...STORE_ITEMS[id] }));
  res.json({ products });
});

// ── x402 Auto-Payment Route (API Paywall) ────────────────────────────────
app.get('/api/premium-data', 
  requireX402Payment({
    price: '0.05',
    payTo: process.env.MERCHANT_USDC_WALLET || '0x0000000000000000000000000000000000000000',
    apiUrl: process.env.DELEGARE_BASE_URL || 'https://api.sandbox.delegare.dev/v1',
    testMode: true
  }),
  (req, res) => {
    res.json({
      secret: 'AI agents love this premium data.',
      weather: 'Sunny',
      temp: 72,
      txHash: req.x402Transaction
    });
    console.log(`🎉 Premium data delivered! TxHash: ${req.x402Transaction}`);
  }
);

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
