import {
  DelegareConfig,
  ChargeRequest,
  ChargeResponse,
  BalanceResponse,
  SetupDelegateRequest,
  SetupDelegateResponse,
  SetupSessionStatus,
  RevokeResponse,
  X402Requirement,
  X402PaymentReceipt,
} from './types';

const DEFAULT_BASE_URL = 'https://api.delegare.dev/v1';
const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 300_000; // 5 minutes

export class Delegare {
  private readonly merchantId: string;
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(config: DelegareConfig) {
    this.merchantId = config.merchantId || '';
    this.apiKey = config.apiKey || '';
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

  /**
   * Fetch a resource that may be gated by an x402 paywall.
   *
   * If the server responds with 402 and valid x402 PaymentRequirements, and
   * an `intentMandate` was provided, this helper retries the request with
   * `X-DELEGARE-MANDATE: <intentMandate>`. Vault's facilitator settles the
   * payment by charging the mandate's smart wallet through the router — no
   * popups, no EIP-3009 signing by the agent, no custody of private keys.
   *
   * Notes:
   *   - USDC's canonical `transferWithAuthorization` ignores EIP-1271, so a
   *     session key cannot sign x402 payloads on behalf of a smart wallet.
   *     This mandate-header flow is the supported path for agent payments.
   *   - For servers that are NOT using vault's x402 middleware, the retry
   *     will be ignored and you'll receive the original 402 back.
   */
  async fetch(url: string, init?: RequestInit, intentMandate?: string): Promise<Response> {
    const first = await fetch(url, init);

    if (first.status !== 402 || !intentMandate) {
      return first;
    }

    // Parse the PaymentRequirements; bail out cleanly for non-x402 402s.
    let accepts: X402Requirement[] | undefined;
    try {
      const body = (await first.clone().json()) as {
        accepts?: X402Requirement[];
      };
      accepts = body.accepts;
    } catch {
      return first;
    }

    const req = accepts?.find(
      (a) => a.scheme === 'exact' && (a.network === 'base' || a.network === 'base-sepolia'),
    );
    if (!req) return first;

    const retryHeaders = new Headers(init?.headers ?? {});
    retryHeaders.set('X-DELEGARE-MANDATE', intentMandate);

    return fetch(url, { ...init, headers: retryHeaders });
  }

  /** Decode the `X-PAYMENT-RESPONSE` header set by vault's middleware. */
  decodePaymentReceipt(response: Response): X402PaymentReceipt | undefined {
    const header = response.headers.get('x-payment-response');
    if (!header) return undefined;
    try {
      // Node & modern browsers both expose atob; fall back to Buffer in Node.
      const decoded =
        typeof atob === 'function'
          ? atob(header)
          : // eslint-disable-next-line @typescript-eslint/no-var-requires
            Buffer.from(header, 'base64').toString('utf8');
      return JSON.parse(decoded) as X402PaymentReceipt;
    } catch {
      return undefined;
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
