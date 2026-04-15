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
 * The 402 challenge body returned to the client.
 */
export interface X402Challenge {
  x402Version: 1;
  accepts: X402Requirement[];
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
