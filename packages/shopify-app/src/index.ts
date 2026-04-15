import express from 'express';
import cors from 'cors';
import pino from 'pino';
import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api';
import 'dotenv/config';

const logger = pino();
const app = express();

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  scopes: ['read_orders', 'write_orders', 'read_payments', 'write_payments'],
  hostName: process.env.SHOPIFY_APP_URL?.replace(/https?:\/\//, '')!,
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
});

app.use(cors());
app.use(express.json());

// ── HEALTH CHECK ──────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'shopify-app' });
});

// ── SHOPIFY OAUTH ─────────────────────────────────────────────────────────
app.get('/api/auth', async (req, res) => {
  const shop = req.query.shop as string;
  if (!shop) return res.status(400).send('Missing shop parameter');

  return await shopify.auth.begin({
    shop: shopify.utils.sanitizeShop(shop)!,
    callbackPath: '/api/auth/callback',
    isOnline: false,
    rawRequest: req,
    rawResponse: res,
  });
});

app.get('/api/auth/callback', async (req, res) => {
  try {
    const callback = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });

    const { session } = callback;
    logger.info({ shop: session.shop }, 'Merchant authenticated successfully');

    // ── REGISTER MERCHANT IN DELEGARE ──
    const API_BASE_URL = process.env.DELEGARE_BASE_URL || 'https://api.delegare.dev';
    try {
      const regRes = await fetch(`${API_BASE_URL}/v1/partners/register-merchant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': process.env.DELEGARE_PARTNER_KEY!,
        },
        body: JSON.stringify({
          merchantId: session.shop.replace('.myshopify.com', '').replace(/[^a-z0-9-]/g, '-'),
          name: session.shop.split('.')[0],
          contactEmail: `admin@${session.shop}`, // Shopify session doesn't always provide email here
        }),
      });

      if (regRes.ok) {
        const credentials = await regRes.json() as { merchantId: string; liveApiKey: string; testApiKey: string; webhookSecret: string };
        logger.info({ merchantId: credentials.merchantId }, 'Registered new Delegare merchant via Shopify');
        // In a real app, you would save these credentials (apiKey, etc) to your DB
      }
    } catch (e) {
      logger.error({ e }, 'Failed to register merchant in Delegare');
    }

    res.redirect(`https://${session.shop}/admin/apps/${process.env.SHOPIFY_API_KEY}`);
  } catch (error: any) {
    logger.error({ error: error.message }, 'OAuth Callback Failed');
    res.status(500).send(error.message);
  }
});

// ── SHOPIFY PAYMENTS APP ENDPOINTS ────────────────────────────────────────
// These are called by Shopify when a user selects Delegare at checkout.

/**
 * Initiates a payment session.
 */
app.post('/api/payments/payment', async (req, res) => {
  // Shopify sends a signed request with payment details.
  // Docs: https://shopify.dev/docs/apps/payments/implementation/process-a-payment
  const payload = req.body;
  
  logger.info({ payload }, 'Received payment request from Shopify');

  // We return a redirect URL to our "Payment Capture" page.
  // This page will ask for the intentMandate.
  const paymentSessionId = payload.id;
  const redirectUrl = `${process.env.SHOPIFY_APP_URL}/payment-capture?id=${paymentSessionId}`;

  res.json({
    redirect_url: redirectUrl,
  });
});

// ── PAYMENT CAPTURE UI ────────────────────────────────────────────────────
app.get('/payment-capture', (req, res) => {
  const sessionId = req.query.id;
  
  res.send(`
    <html>
      <body style="font-family: sans-serif; background: #0c0c0c; color: #f0ede8; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
        <div style="background: #111; padding: 40px; border-radius: 16px; border: 1px solid rgba(240,237,232,0.1); width: 100%; max-width: 400px; text-align: center;">
          <h2 style="color: #c8b99a; margin-top: 0;">Pay with AI Agent</h2>
          <p style="opacity: 0.7; font-size: 14px;">Enter your Delegare Intent Mandate (SD-JWT-VC) to complete this purchase.</p>
          
          <form action="/api/payments/complete" method="POST" style="margin-top: 24px; display: flex; flexDirection: column; gap: 16px;">
            <input type="hidden" name="sessionId" value="${sessionId}" />
            <input 
              name="intentMandate" 
              placeholder="eyJhbGciOiJFU..." 
              required
              style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #333; background: #000; color: #fff; margin-bottom: 16px;" 
            />
            <button type="submit" style="width: 100%; padding: 14px; background: #c8b99a; color: #0c0c0c; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
              Authorize Payment
            </button>
          </form>
          
          <div style="margin-top: 24px; padding: 16px; background: rgba(200,185,154,0.05); border-radius: 8px; font-size: 12px; color: #c8b99a;">
            <strong>Agent Prompt:</strong><br/>
            "Authorize shopify-checkout-${sessionId} using my intent mandate"
          </div>
        </div>
      </body>
    </html>
  `);
});

// Support form data for the capture UI
import bodyParser from 'body-parser';
app.use(bodyParser.urlencoded({ extended: true }));

import { Delegare } from '@delegare/sdk';
const delegare = new Delegare({
  merchantId: process.env.DELEGARE_MERCHANT_ID!,
  apiKey: process.env.DELEGARE_API_KEY!,
  baseUrl: process.env.DELEGARE_BASE_URL,
});

/**
 * Completes the payment by charging the intent mandate.
 */
app.post('/api/payments/complete', async (req, res) => {
  const { sessionId, intentMandate } = req.body;

  try {
    logger.info({ sessionId, intentMandate: intentMandate.substring(0, 20) }, 'Processing Shopify payment completion');

    // 1. In a real app, we would fetch the session details from our DB 
    // that we saved during the initial POST /api/payments/payment.
    // For this prototype, we'll mock the amount for the demo.
    const amountCents = 1500; // $15.00

    // 2. Charge via Delegare
    const receipt = await delegare.charge({
      intentMandate,
      amountCents,
      currency: 'usd',
      description: `Shopify Order (Session: ${sessionId})`,
      idempotencyKey: `shopify_${sessionId}`,
    });

    // 3. Notify Shopify of success
    // In production, we'd make a POST to the callback URL provided by Shopify in the initial request.
    // Docs: https://shopify.dev/docs/apps/payments/implementation/process-a-payment#resolution-request
    
    logger.info({ receiptId: receipt.receiptId }, 'Payment successful, redirecting back to Shopify');

    // Redirect user back to the store (normally we'd use the return_url from Shopify)
    res.send('<h1>Payment Successful!</h1><p>Your AI agent has paid for this order. You can close this window.</p>');

  } catch (error: any) {
    logger.error({ error: error.message }, 'Payment Completion Failed');
    res.status(400).send(`Payment failed: ${error.message}`);
  }
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  logger.info(`🛍️ Delegare Shopify App running on port ${PORT}`);
});
