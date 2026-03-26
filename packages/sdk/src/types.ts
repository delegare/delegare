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
  delegateToken: string;
  amountCents: number;
  currency: Currency;
  description: string;
  idempotencyKey: string;
  metadata?: Record<string, string>;
}

export interface ChargeResponse {
  receiptId: string;
  status: 'completed' | 'pending' | 'failed';
  amountCents: number;
  currency: Currency;
  railUsed: Rail;
  railFallbackUsed: boolean;
  txHash?: string;
  stripePaymentIntentId?: string;
  completedAt: string;
}

export interface BalanceResponse {
  remainingMonthlyBudgetCents: number;
  monthlyLimitCents: number;
  spentThisMonthCents: number;
  spentByRail: {
    fiat: { spentCents: number; transactions: number };
    crypto: { spentCents: number; transactions: number };
  };
  paymentMethods: PaymentMethodSummary[];
  railPreference: RailPreference;
  status: DelegateStatus;
  expiresAt?: string;
}

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
  delegateToken?: string;
  maskedPaymentMethods?: PaymentMethodSummary[];
}

export interface RevokeResponse {
  success: boolean;
  revokedAt: string;
}

export interface DelegareError {
  code: string;
  message: string;
  statusCode: number;
}
