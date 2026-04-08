import { Delegare } from '../client';
import { X402Requirement } from '../types';

describe('Delegare Client - x402', () => {
  let client: Delegare;

  beforeEach(() => {
    client = new Delegare({ merchantId: 'm_123', apiKey: 'test_key' });
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('fetch wrapper', () => {
    it('returns the response normally if no 402 is returned', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        headers: new Headers(),
        json: jest.fn().mockResolvedValue({ data: 'success' }),
      });

      const res = await client.fetch('https://example.com/api', {}, 'mandate_123');
      expect(res.status).toBe(200);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('intercepts 402 and retries with X-DELEGARE-MANDATE header (no signing)', async () => {
      const x402Challenge = {
        x402Version: 1,
        accepts: [
          {
            scheme: 'exact',
            network: 'base',
            asset: '0xusdc',
            maxAmountRequired: '1500000', // atomic units — 1.5 USDC
            payTo: '0xmerchant',
            resource: 'https://example.com/api',
            mimeType: 'application/json',
            maxTimeoutSeconds: 3600,
          } as X402Requirement,
        ],
      };

      // 402 with x402 body
      const mock402Response = {
        status: 402,
        clone: () => ({ json: jest.fn().mockResolvedValue(x402Challenge) }),
        json: jest.fn().mockResolvedValue(x402Challenge),
        headers: new Headers(),
      };

      // Successful retry
      const mock200Response = {
        status: 200,
        headers: new Headers({
          'x-payment-response': Buffer.from(
            JSON.stringify({
              success: true,
              transaction: '0xdeadbeef',
              network: 'base',
              payer: 'mandate_123',
            }),
          ).toString('base64'),
        }),
        json: jest.fn().mockResolvedValue({ data: 'success' }),
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(mock402Response)
        .mockResolvedValueOnce(mock200Response);

      const res = await client.fetch('https://example.com/api', { method: 'POST' }, 'mandate_123');

      expect(res.status).toBe(200);
      // 2 fetches only: original + retry. No sign-x402 backend hop.
      expect(global.fetch).toHaveBeenCalledTimes(2);

      const retryCall = (global.fetch as jest.Mock).mock.calls[1];
      expect(retryCall[0]).toBe('https://example.com/api');
      const retryHeaders = retryCall[1].headers as Headers;
      expect(retryHeaders.get('X-DELEGARE-MANDATE')).toBe('mandate_123');

      const receipt = client.decodePaymentReceipt(res);
      expect(receipt).toEqual({
        success: true,
        transaction: '0xdeadbeef',
        network: 'base',
        payer: 'mandate_123',
      });
    });

    it('returns original 402 when no intentMandate provided', async () => {
      const mock402Response = {
        status: 402,
        clone: () => ({ json: jest.fn().mockResolvedValue({ accepts: [] }) }),
        json: jest.fn().mockResolvedValue({ accepts: [] }),
        headers: new Headers(),
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mock402Response);

      const res = await client.fetch('https://example.com/api');
      expect(res.status).toBe(402);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});
