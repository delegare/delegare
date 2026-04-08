export type Currency = 'usd' | 'usdc' | 'usdt';
export type Rail = 'fiat' | 'crypto';
export type DelegateStatus = 'active' | 'paused' | 'revoked' | 'expired';
export type RailPreference = 'auto' | 'fiat_first' | 'crypto_first' | 'cheapest' | 'fastest';

export interface DelegareConfig {
  merchantId: string;
  apiKey: string;
  baseUrl?: string;
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

export interface X402Requirement {
  scheme: 'exact';
  network: 'base' | 'base-sepolia';
  asset: string;
  maxAmountRequired: string;
  payTo: string;
  resource: string;
  mimeType: string;
  maxTimeoutSeconds: number;
}

export interface X402Payment {
  scheme: 'exact';
  payment: {
    from: string;
    to: string;
    value: string;
    validAfter: number;
    validBefore: number;
    nonce: string;
    signature: string;
  };
}

export interface X402Response {
  success: boolean;
  receipt: string;
  payer?: string;
}

export interface X402SignRequest {
  intentMandate: string;
  scheme: 'exact';
  to: string;
  value: string;
  validAfter?: number;
  validBefore?: number;
  nonce?: string;
}

export interface DelegareError {
  code: string;
  message: string;
  statusCode: number;
}
