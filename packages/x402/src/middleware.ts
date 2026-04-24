/**
 * @delegare/x402 — Express middleware for x402 micropayments.
 *
 * This is the merchant-side package. It does two things:
 *
 *   1. Returns a standardized 402 Payment Required challenge when no payment
 *      is present — telling the client what to pay and where.
 *
 *   2. When the client retries with a payment proof (`X-PAYMENT-RESPONSE`,
 *      `X-DELEGARE-MANDATE`, or `X-Bundle-Token` header), the middleware
 *      verifies / settles the payment and lets the request through.
 *
 * Three payment rails are supported:
 *   A. No payment        → 402 challenge (USDC + optional credit-bundle)
 *   B. X-Bundle-Token    → credit-bundle path (Stripe-backed, no crypto)
 *   C. X-DELEGARE-MANDATE / X-PAYMENT → USDC on-chain via Delegare Vault
 *   D. X-PAYMENT-RESPONSE → verify an already-settled USDC receipt
 *
 * Settlement for on-chain payments happens on Delegare's infrastructure.
 * This package never touches private keys, on-chain transactions, or wallets.
 */

import type { Request, Response, NextFunction } from 'express';
import type { X402Options, X402PaymentReceipt, X402Requirement } from './types';

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
  return raw.replace(/^0+/, '') || '0';
}

/**
 * Gate an Express route behind payment.
 *
 * Supports two payment rails in priority order:
 *
 * **1. Credit bundle (no crypto required)**
 * ```ts
 * app.post('/api/agent',
 *   requireX402Payment({
 *     price: '0.02',
 *     payTo: '0xYourWallet',
 *     creditBundle: {
 *       tiers: [{ name: 'Starter', usdCents: 1000, requests: 500 }],
 *       purchaseUrl: 'https://yourapp.com/billing/bundles',
 *       validateAndDeduct: myBundleValidator,
 *     },
 *   }),
 *   handler,
 * );
 * ```
 * Clients send `X-Bundle-Token: <jwt>` — no wallet, no on-chain tx.
 *
 * **2. USDC x402 (crypto)**
 * ```ts
 * app.get('/premium-data',
 *   requireX402Payment({ price: '0.05', payTo: '0xYourWallet' }),
 *   handler,
 * );
 * ```
 * Clients send `X-DELEGARE-MANDATE` or `X-PAYMENT` headers.
 */
export function requireX402Payment(options: X402Options) {
  const network: 'base' | 'base-sepolia' = options.testMode ? 'base-sepolia' : 'base';
  const asset = options.testMode ? USDC_BASE_SEPOLIA : USDC_BASE;
  const apiUrl = options.apiUrl || 'https://api.delegare.dev/v1';

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const xBundleToken   = req.header('x-bundle-token');
    const xMandate       = req.header('x-delegare-mandate');
    const xPayment       = req.header('x-payment');
    const xPaymentResponse = req.header('x-payment-response');

    // ── Case B: credit-bundle token → validate and deduct ────────────────
    // Checked before USDC so non-crypto clients are served without any
    // on-chain round-trip. On soft failures (invalid/expired token) we fall
    // through to the USDC challenge rather than returning a hard error.
    if (xBundleToken && options.creditBundle) {
      try {
        const result = await options.creditBundle.validateAndDeduct(xBundleToken);

        if (result.valid) {
          // Attach bundle context for downstream handlers
          (req as any).bundleTenantId       = result.tenantId;
          (req as any).bundleCreditsRemaining = result.creditsRemaining;
          next();
          return;
        }

        if (result.error === 'insufficient_credits') {
          // Hard stop — token is authentic but wallet is empty.
          res.status(402).json({
            code: 'insufficient_credits',
            creditsRemaining: result.creditsRemaining,
            tenantId: result.tenantId,
            message: 'Your credit bundle is exhausted. Please purchase a new bundle to continue.',
            purchaseUrl: options.creditBundle.purchaseUrl,
            tiers: options.creditBundle.tiers,
          });
          return;
        }

        // token_invalid or token_expired → fall through to USDC challenge.
        // The client will see the full paymentMethods array and can choose
        // to repurchase a bundle or switch to the crypto path.
      } catch {
        // Validator threw unexpectedly — treat as invalid token and fall through.
      }
    }

    // ── Case A: no payment headers → return 402 challenge ────────────────
    if (!xMandate && !xPayment && !xPaymentResponse) {
      const resource = options.resource || req.originalUrl;

      const usdcRequirement: X402Requirement = {
        scheme: 'exact',
        network,
        asset,
        maxAmountRequired: options.price,
        payTo: options.payTo,
        resource,
        description: `USDC payment for ${resource}`,
        mimeType: options.mimeType || 'application/json',
        maxTimeoutSeconds: options.maxTimeoutSeconds ?? 3600,
        extra: { name: 'USD Coin', version: '2' },
      };

      res.status(402).json({
        x402Version: 1,
        // Backward-compatible `accepts` array (x402 spec v1 clients read this).
        accepts: [usdcRequirement],
        // Extended `paymentMethods` listing all rails — present only when
        // creditBundle is configured so existing USDC-only clients are unaffected.
        ...(options.creditBundle && {
          paymentMethods: [
            { type: 'x402-usdc', details: usdcRequirement },
            {
              type: 'credit-bundle',
              purchaseUrl: options.creditBundle.purchaseUrl,
              ...(options.creditBundle.balanceUrl && {
                balanceUrl: options.creditBundle.balanceUrl,
              }),
              tiers: options.creditBundle.tiers,
            },
          ],
        }),
      });
      return;
    }

    // ── Case C: mandate or direct payment → settle via Delegare API ──────
    if (xMandate || xPayment) {
      try {
        const payload: Record<string, unknown> = {
          price: options.price,
          payTo: options.payTo,
          resource: options.resource || req.originalUrl,
          network,
        };

        if (xMandate) payload.mandate = xMandate;
        if (xPayment) payload.payment = JSON.parse(Buffer.from(xPayment, 'base64').toString('utf8'));

        const settleRes = await fetch(`${apiUrl}/x402/settle`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!settleRes.ok) {
          const err = await settleRes.json().catch(() => ({ message: 'Settlement failed' }));
          res.status(402).json({
            code: 'payment_settlement_failed',
            message: (err as any).errorReason || (err as any).message || 'Delegare settlement failed',
          });
          return;
        }

        const receipt = (await settleRes.json()) as X402PaymentReceipt;
        const responseHeader = Buffer.from(JSON.stringify(receipt)).toString('base64');
        res.setHeader('X-PAYMENT-RESPONSE', responseHeader);
        (req as any).x402Payer       = receipt.payer;
        (req as any).x402Transaction = receipt.transaction;

        next();
        return;
      } catch (err) {
        res.status(400).json({
          code: 'x402_settlement_error',
          message: err instanceof Error ? err.message : 'Settlement failed',
        });
        return;
      }
    }

    // ── Case D: payment receipt already present → verify ─────────────────
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

        const verifyRes = await fetch(`${apiUrl}/x402/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transaction:    receipt.transaction,
            network:        receipt.network,
            expectedPayTo:  options.payTo,
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
        (req as any).x402Payer       = receipt.payer;
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
