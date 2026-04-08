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
        json: jest.fn().mockResolvedValue({ data: 'success' }),
      });

      const res = await client.fetch('https://example.com/api', {}, 'mandate_123');
      expect(res.status).toBe(200);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('intercepts 402, requests a signature, and retries with X-Payment header', async () => {
      const x402Challenge = {
        paymentRequirements: {
          accepts: [
            {
              scheme: 'exact',
              network: 'base',
              asset: '0xusdc',
              maxAmountRequired: '1.50',
              payTo: '0xmerchant',
              resource: 'https://example.com/api',
              mimeType: 'application/json',
              maxTimeoutSeconds: 3600,
            } as X402Requirement
          ]
        }
      };

      // Mock the initial 402 response
      const mock402Response = {
        status: 402,
        clone: () => ({ json: jest.fn().mockResolvedValue(x402Challenge) }),
        json: jest.fn().mockResolvedValue(x402Challenge),
      };

      // Mock the successful retry response
      const mock200Response = {
        status: 200,
        json: jest.fn().mockResolvedValue({ data: 'success' }),
      };

      // Mock the client's internal signX402 API call
      const mockSignatureResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          scheme: 'exact',
          payment: { signature: '0xabc', nonce: '0x123' }
        })
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(mock402Response) // The actual protected fetch
        .mockResolvedValueOnce(mockSignatureResponse) // The /sign-x402 vault API call
        .mockResolvedValueOnce(mock200Response); // The retry fetch

      const res = await client.fetch('https://example.com/api', { method: 'POST' }, 'mandate_123');
      
      // Should have been retried
      expect(res.status).toBe(200);
      
      // Fetch should be called 3 times: target, vault API, target (retry)
      expect(global.fetch).toHaveBeenCalledTimes(3);

      // Verify the retry request included the X-Payment header
      const retryCall = (global.fetch as jest.Mock).mock.calls[2];
      expect(retryCall[0]).toBe('https://example.com/api');
      expect(retryCall[1].headers).toHaveProperty('X-Payment');
    });
  });
});
