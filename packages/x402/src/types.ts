/**
 * A single purchasable credit bundle tier.
 */
export interface CreditBundleTier {
  /** Human-readable tier name, e.g. "Starter". */
  name: string;
  /** Price in USD cents, e.g. 1000 = $10.00. */
  usdCents: number;
  /** Number of API requests included in this tier. */
  requests: number;
}

/**
 * Result returned by the merchant's `validateAndDeduct` callback.
 */
export interface BundleValidationResult {
  /** Whether the token was valid and a credit was successfully deducted. */
  valid: boolean;
  /** Credits remaining after deduction (0 if exhausted). */
  creditsRemaining: number;
  /** Tenant / org identifier extracted from the bundle token. */
  tenantId: string;
  /**
   * Structured error code when `valid` is false.
   * - `token_invalid`        — signature or structure is wrong
   * - `token_expired`        — JWT exp has passed
   * - `insufficient_credits` — token is valid but balance is 0
   */
  error?: 'token_invalid' | 'token_expired' | 'insufficient_credits';
}

/**
 * Configuration for the credit-bundle fallback payment method.
 *
 * Attach to `X402Options.creditBundle` to advertise a Stripe-backed bundle
 * alongside the USDC x402 challenge. Clients that present an `X-Bundle-Token`
 * header are served without touching any crypto rails.
 *
 * The middleware is payment-backend agnostic — it calls `validateAndDeduct`
 * and trusts the result. The merchant supplies the implementation (Stripe +
 * DynamoDB, Paddle + Redis, etc.).
 */
export interface CreditBundleConfig {
  /** Tiers advertised in the 402 body so clients know what to buy. */
  tiers: CreditBundleTier[];
  /**
   * URL where clients purchase a bundle (e.g. a Stripe Checkout session
   * endpoint on the merchant's backend).
   */
  purchaseUrl: string;
  /** Optional URL to query remaining credit balance for a given token. */
  balanceUrl?: string;
  /**
   * Merchant-supplied validator called when `X-Bundle-Token` is present.
   *
   * Must:
   *   1. Validate the token signature and expiry.
   *   2. Atomically deduct one credit from the balance store.
   *   3. Return the result.
   *
   * When `valid` is false the middleware falls through to the USDC challenge
   * so the client is never left stranded — they always get a payment path.
   */
  validateAndDeduct: (token: string) => Promise<BundleValidationResult>;
}

/**
 * Options for the x402 payment gate middleware.
 */
export interface X402Options {
  /** Decimal USDC amount as a string, e.g. "0.05" for five cents. */
  price: string;

  /** Base network address that receives the payment (your wallet). */
  payTo: string;

  /**
   * Delegare API base URL used to verify mandate-backed payments.
   * Defaults to `https://api.delegare.dev/v1`.
   * Set to `https://api.sandbox.delegare.dev/v1` for testing.
   */
  apiUrl?: string;

  /** Optional human-readable resource identifier. Defaults to `req.originalUrl`. */
  resource?: string;

  /** MIME type of the gated resource — advertised in the 402 challenge. */
  mimeType?: string;

  /** How long a signed payment authorization is valid. Default: 3600 seconds. */
  maxTimeoutSeconds?: number;

  /** Use Base Sepolia testnet instead of mainnet. Default: false. */
  testMode?: boolean;

  /**
   * Optional credit-bundle fallback for clients without a crypto wallet.
   *
   * When set:
   *   - The 402 response includes a `paymentMethods` array listing both
   *     `x402-usdc` and `credit-bundle` options (backward compatible — the
   *     existing `accepts` array is unchanged).
   *   - Requests carrying `X-Bundle-Token` are validated and served before
   *     the USDC path is attempted.
   */
  creditBundle?: CreditBundleConfig;
}

/**
 * Single entry in an x402 `accepts` array — describes one acceptable payment method.
 */
export interface X402Requirement {
  scheme: 'exact';
  network: 'base' | 'base-sepolia';
  asset: string;
  /** Atomic USDC units as a decimal string (6 decimals). */
  maxAmountRequired: string;
  payTo: string;
  resource: string;
  description: string;
  mimeType: string;
  maxTimeoutSeconds: number;
  extra?: Record<string, unknown>;
}

/**
 * Credit-bundle payment method descriptor included in `paymentMethods`.
 */
export interface CreditBundlePaymentMethod {
  type: 'credit-bundle';
  purchaseUrl: string;
  balanceUrl?: string;
  tiers: CreditBundleTier[];
}

/**
 * The 402 challenge body returned to the client.
 *
 * `accepts` carries the original USDC x402 requirements (backward compatible).
 * `paymentMethods` is an extensible array listing ALL accepted payment rails
 * — both `x402-usdc` and `credit-bundle` when configured.  Clients should
 * prefer `paymentMethods` when present and fall back to `accepts` otherwise.
 */
export interface X402Challenge {
  x402Version: 1;
  /** Backward-compatible USDC payment requirements (x402 spec v1). */
  accepts: X402Requirement[];
  /**
   * Extended payment method list. Present only when `creditBundle` is
   * configured. Enables non-crypto clients to discover alternative rails.
   */
  paymentMethods?: Array<
    | { type: 'x402-usdc'; details: X402Requirement }
    | CreditBundlePaymentMethod
  >;
}

/**
 * Decoded `X-PAYMENT-RESPONSE` header set on successful payment.
 */
export interface X402PaymentReceipt {
  success: boolean;
  /** On-chain transaction hash. */
  transaction: string;
  network: 'base' | 'base-sepolia';
  /** Address that funded the payment. */
  payer: string;
}
