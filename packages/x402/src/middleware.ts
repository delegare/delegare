/**
 * @delegare/x402 — Express middleware for x402 micropayments.
 *
 * This is the merchant-side package. It does two things:
 *
 *   1. Returns a standardized 402 Payment Required challenge when no payment
 *      is present — telling the agent what to pay and where.
 *
 *   2. When the agent retries with a payment proof (`X-PAYMENT-RESPONSE`
 *      header or `X-DELEGARE-MANDATE` header), the middleware verifies the
 *      payment against Delegare's API and lets the request through.
 *
 * Settlement happens on Delegare's infrastructure (Vault). This package
 * never touches private keys, on-chain transactions, or wallet logic.
 */

import type { Request, Response, NextFunction } from 'express';
import type { X402Options, X402PaymentReceipt } from './types';

/** USDC contract address on Base mainnet. */
const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
/** USDC contract address on Base Sepolia testnet. */
const USDC_BASE_SEPOLIA = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

/**
 * Convert a human-readable decimal price (e.g. "0.05") to atomic USDC units (6 decimals).
 * Pure string math — no floating point.
 */
function priceToAtomicUsdc(price: string): string {
  const parts = price.split('.');
  const whole = parts[0] || '0';
  const frac = (parts[1] || '').padEnd(6, '0').slice(0, 6);
  const raw = whole + frac;
  // Strip leading zeros but keep at least "0"
  return raw.replace(/^0+/, '') || '0';
}

/**
 * Gate an Express route behind a USDC micropayment.
 *
 * ```ts
 * import { requireX402Payment } from '@delegare/x402';
 *
 * app.get('/premium-data',
 *   requireX402Payment({ price: '0.05', payTo: '0xYourWallet' }),
 *   (req, res) => {
 *     res.json({ data: 'premium content' });
 *   }
 * );
 * ```
 *
 * **How it works:**
 *
 * 1. No payment headers → returns 402 with x402 PaymentRequirements.
 * 2. `X-DELEGARE-MANDATE` header → forwards the mandate to Delegare's
 *    facilitator API for settlement. Delegare charges the buyer's smart
 *    wallet via the on-chain router — no keys or wallet logic needed here.
 * 3. `X-PAYMENT-RESPONSE` header → the agent already paid in a previous
 *    hop; the middleware verifies the receipt via Delegare's API.
 *
 * On successful payment, the middleware sets `X-PAYMENT-RESPONSE` on the
 * response and attaches `req.x402Payer` / `req.x402Transaction` for the
 * downstream handler.
 */
export function requireX402Payment(options: X402Options) {
  const network: 'base' | 'base-sepolia' = options.testMode ? 'base-sepolia' : 'base';
  const asset = options.testMode ? USDC_BASE_SEPOLIA : USDC_BASE;
  const apiUrl = options.apiUrl || 'https://api.delegare.dev/v1';

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const xMandate = req.header('x-delegare-mandate');
    const xPaymentResponse = req.header('x-payment-response');

    // ── Case A: no payment → return 402 challenge ───────────────────────
    if (!xMandate && !xPaymentResponse) {
      const maxAmountRequired = priceToAtomicUsdc(options.price);
      const resource = options.resource || req.originalUrl;

      res.status(402).json({
        x402Version: 1,
        accepts: [
          {
            scheme: 'exact',
            network,
            asset,
            maxAmountRequired,
            payTo: options.payTo,
            resource,
            description: `USDC payment for ${resource}`,
            mimeType: options.mimeType || 'application/json',
            maxTimeoutSeconds: options.maxTimeoutSeconds ?? 3600,
            extra: { name: 'USD Coin', version: '2' },
          },
        ],
      });
      return;
    }

    // ── Case B: mandate header → settle via Delegare API ────────────────
    if (xMandate) {
      try {
        const settleRes = await fetch(`${apiUrl}/x402/settle`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mandate: xMandate,
            price: options.price,
            payTo: options.payTo,
            resource: options.resource || req.originalUrl,
            network,
          }),
        });

        if (!settleRes.ok) {
          const err = await settleRes.json().catch(() => ({ message: 'Settlement failed' }));
          res.status(402).json({
            code: 'payment_settlement_failed',
            message: (err as any).message || 'Delegare settlement failed',
          });
          return;
        }

        const receipt = (await settleRes.json()) as X402PaymentReceipt;

        const responseHeader = Buffer.from(JSON.stringify(receipt)).toString('base64');
        res.setHeader('X-PAYMENT-RESPONSE', responseHeader);

        (req as any).x402Payer = receipt.payer;
        (req as any).x402Transaction = receipt.transaction;

        next();
        return;
      } catch (err) {
        res.status(502).json({
          code: 'x402_settlement_error',
          message: 'Could not reach Delegare settlement API',
        });
        return;
      }
    }

    // ── Case C: payment receipt already present → verify ─────────────────
    if (xPaymentResponse) {
      try {
        const decoded = Buffer.from(xPaymentResponse, 'base64').toString('utf8');
        const receipt = JSON.parse(decoded) as X402PaymentReceipt;

        if (!receipt.success || !receipt.transaction) {
          res.status(402).json({
            code: 'invalid_payment_receipt',
            message: 'Payment receipt indicates failure or missing transaction hash',
          });
          return;
        }

        // Verify the receipt against Delegare's API
        const verifyRes = await fetch(`${apiUrl}/x402/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transaction: receipt.transaction,
            network: receipt.network,
            expectedPayTo: options.payTo,
            expectedAmount: priceToAtomicUsdc(options.price),
          }),
        });

        if (!verifyRes.ok) {
          res.status(402).json({
            code: 'payment_verification_failed',
            message: 'Could not verify payment receipt',
          });
          return;
        }

        res.setHeader('X-PAYMENT-RESPONSE', xPaymentResponse);
        (req as any).x402Payer = receipt.payer;
        (req as any).x402Transaction = receipt.transaction;

        next();
        return;
      } catch {
        res.status(400).json({
          code: 'invalid_payment_receipt',
          message: 'X-PAYMENT-RESPONSE header must be base64-encoded JSON',
        });
        return;
      }
    }

    next();
  };
}
