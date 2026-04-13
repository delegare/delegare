export type Currency = 'usd' | 'usdc' | 'usdt';
export type Rail = 'fiat' | 'crypto';
export type DelegateStatus = 'active' | 'paused' | 'revoked' | 'expired';
export type RailPreference = 'auto' | 'fiat_first' | 'crypto_first' | 'cheapest' | 'fastest';

/** API-key authentication (legacy / merchant-facing) */
export interface ApiKeyAuth {
  merchantId: string;
  apiKey: string;
  baseUrl?: string;
}

/** OAuth Bearer token authentication (primary method for buyers / agents) */
export interface OAuthAuth {
  accessToken: string;
  refreshToken?: string;
  /** Called when the SDK auto-refreshes; lets callers persist the new tokens. */
  onTokenRefresh?: (newAccessToken: string, newRefreshToken?: string) => void;
  baseUrl?: string;
}

export type DelegareConfig = ApiKeyAuth | OAuthAuth;

export function isOAuthConfig(c: DelegareConfig): c is OAuthAuth {
  return 'accessToken' in c;
}

export interface ChargeRequest {
  intentMandate: string; // The SD-JWT-VC string
  amountCents: number;
  currency: Currency;
  description: string;
  idempotencyKey: string;
  metadata?: Record<string, string>;
}

export interface ChargeResponse {
  receiptId: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  amountCents: number;
  currency: Currency;
  railUsed?: Rail;
  txHash?: string;
  stripePaymentIntentId?: string;
  failureReason?: string;
}

export interface BalanceResponse {
  remainingMonthlyBudgetCents: number;
  monthlyLimitCents: number;
  spentThisMonthCents: number;
  spentByRail: {
    fiat: { spentCents: number; transactions: number };
    crypto: { spentCents: number; transactions: number };
  };
  paymentMethods?: PaymentMethodSummary[];
  railPreference?: RailPreference;
  status: MandateStatus;
  expiresAt: string;
}

export type MandateStatus = 'active' | 'revoked' | 'expired';

export interface PaymentMethodSummary {
  rail: Rail;
  display: string;
  status: 'active' | 'expired' | 'failed';
}

export interface SetupDelegateRequest {
  maxPerTxCents: number;
  maxMonthlySpendCents: number;
  rail?: 'fiat' | 'crypto' | 'both';
  railPreference?: RailPreference;
  allowedMerchantIds?: string[];
  expiresAt?: string;
}

export interface SetupDelegateResponse {
  setupUrl: string;
  sessionToken: string;
  expiresInSeconds: number;
}

export interface SetupSessionStatus {
  status: 'pending' | 'complete' | 'expired';
  intentMandate?: string;
  maskedPaymentMethods?: PaymentMethodSummary[];
}

export interface RevokeResponse {
  success: boolean;
  revokedAt: string;
}

/** Single entry in an x402 server's `accepts` array. */
export interface X402Requirement {
  scheme: 'exact';
  network: 'base' | 'base-sepolia';
  asset: string;
  /** Atomic USDC units as a decimal string (USDC has 6 decimals). */
  maxAmountRequired: string;
  payTo: string;
  resource: string;
  mimeType?: string;
  maxTimeoutSeconds: number;
  extra?: Record<string, unknown>;
}

/** Decoded `X-PAYMENT-RESPONSE` header contents. */
export interface X402PaymentReceipt {
  success: boolean;
  transaction: string;
  network: 'base' | 'base-sepolia';
  payer: string;
}

export interface DelegareError {
  code: string;
  message: string;
  statusCode: number;
}
