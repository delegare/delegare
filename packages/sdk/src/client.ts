import {
  DelegareConfig,
  ChargeRequest,
  ChargeResponse,
  BalanceResponse,
  SetupDelegateRequest,
  SetupDelegateResponse,
  SetupSessionStatus,
  RevokeResponse,
} from './types';

const DEFAULT_BASE_URL = 'https://api.delegare.dev/v1';
const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 300_000; // 5 minutes

export class Delegare {
  private readonly merchantId: string;
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(config: DelegareConfig) {
    if (!config.merchantId) throw new Error('merchantId is required');
    if (!config.apiKey) throw new Error('apiKey is required');
    this.merchantId = config.merchantId;
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Delegare-Merchant-Id': this.merchantId,
        'X-Delegare-Api-Key': this.apiKey,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const data = await res.json() as T & { code?: string; message?: string };

    if (!res.ok) {
      const err = new Error(data.message ?? `Request failed: ${res.status}`);
      (err as NodeJS.ErrnoException).code = data.code ?? String(res.status);
      throw err;
    }

    return data;
  }

  async charge(params: ChargeRequest): Promise<ChargeResponse> {
    return this.request<ChargeResponse>('POST', '/payments/charge', params);
  }

  async getBalance(intentMandate: string): Promise<BalanceResponse> {
    return this.request<BalanceResponse>('GET', `/mandates/${encodeURIComponent(intentMandate)}/balance`);
  }

  async revoke(intentMandate: string): Promise<RevokeResponse> {
    return this.request<RevokeResponse>('DELETE', `/mandates/${encodeURIComponent(intentMandate)}`);
  }

  async createSetupSession(params: SetupDelegateRequest): Promise<SetupDelegateResponse> {
    return this.request<SetupDelegateResponse>('POST', '/mandates', params);
  }

  async getSetupSession(sessionToken: string): Promise<SetupSessionStatus> {
    return this.request<SetupSessionStatus>('GET', `/setup-sessions/${encodeURIComponent(sessionToken)}`);
  }

  /**
   * Polls for setup session completion and returns the intentMandate once the
   * user has completed the browser setup flow. Rejects after 5 minutes.
   */
  async waitForSetup(sessionToken: string): Promise<string> {
    const deadline = Date.now() + POLL_TIMEOUT_MS;
    while (Date.now() < deadline) {
      await sleep(POLL_INTERVAL_MS);
      const result = await this.getSetupSession(sessionToken);
      if (result.status === 'complete' && result.intentMandate) {
        return result.intentMandate;
      }
      if (result.status === 'expired') {
        throw new Error('Setup session expired before the user completed setup');
      }
    }
    throw new Error('Timed out waiting for user to complete payment setup');
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
