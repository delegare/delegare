import { registerDelegareTools } from '../tools';
import { Delegare } from '@delegare/sdk';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

// Mock the Delegare SDK
jest.mock('@delegare/sdk');

describe('Delegare MCP Tools', () => {
  let mockServer: jest.Mocked<McpServer>;
  let registeredTools: Record<string, Function>;
  let mockClient: any;

  beforeEach(() => {
    registeredTools = {};
    mockServer = {
      registerTool: jest.fn().mockImplementation((name, schema, security, handler) => {
        // Handle varying signatures of registerTool
        const actualHandler = handler || security;
        registeredTools[name] = actualHandler;
      }),
    } as unknown as jest.Mocked<McpServer>;

    mockClient = {
      createSetupSession: jest.fn().mockResolvedValue({
        setupUrl: 'https://example.com/setup',
        sessionToken: 'token_123',
        expiresInSeconds: 600,
      }),
      getSetupSession: jest.fn().mockResolvedValue({
        status: 'complete',
        intentMandate: 'mandate_123',
      }),
      getBalance: jest.fn().mockResolvedValue({
        remainingMonthlyBudgetCents: 5000,
      }),
      charge: jest.fn().mockResolvedValue({
        receiptId: 'rcpt_123',
        status: 'completed',
      }),
      revoke: jest.fn().mockResolvedValue({
        success: true,
        revokedAt: '2024-01-01T00:00:00Z',
      }),
      fetch: jest.fn().mockResolvedValue({
        status: 200,
        text: jest.fn().mockResolvedValue('{"data": "success"}'),
        headers: {
          get: jest.fn().mockImplementation((key) => {
            if (key === 'content-type') return 'application/json';
            if (key === 'x-payment-response') return Buffer.from(JSON.stringify({ receipt: '0x123' })).toString('base64');
            return null;
          })
        }
      }),
    };

    (Delegare as jest.Mock).mockImplementation(() => mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should register all expected tools', () => {
    registerDelegareTools(mockServer, { merchantId: 'm_test', apiKey: 'key_test' });

    expect(mockServer.registerTool).toHaveBeenCalledTimes(6);
    const keys = Object.keys(registeredTools);
    expect(keys).toContain('setup_spending_mandate');
    expect(keys).toContain('poll_setup_session');
    expect(keys).toContain('check_mandate_balance');
    expect(keys).toContain('authorize_agent_payment');
    expect(keys).toContain('revoke_mandate');
    expect(keys).toContain('delegare_fetch');
  });

  describe('delegare_fetch tool', () => {
    it('should successfully fetch data and parse x402 receipts', async () => {
      registerDelegareTools(mockServer, { merchantId: 'm_test', apiKey: 'key_test' });
      const handler = registeredTools['delegare_fetch'];
      
      const response = await handler({
        url: 'https://api.merchant.com/data',
        method: 'GET',
        intentMandate: 'mandate_123',
      });

      expect(response).toHaveProperty('content');
      expect(response.content[0].type).toBe('text');
      
      const parsedContent = JSON.parse(response.content[0].text);
      expect(parsedContent.status).toBe(200);
      expect(parsedContent.content).toEqual({ data: 'success' });
      expect(parsedContent.paymentExecuted).toBe(true);
      expect(parsedContent.receipt).toEqual({ receipt: '0x123' });
    });
  });

  describe('authorize_agent_payment tool', () => {
    it('should successfully execute a charge', async () => {
      registerDelegareTools(mockServer, { merchantId: 'm_test', apiKey: 'key_test' });
      const handler = registeredTools['authorize_agent_payment'];

      const response = await handler({
        intentMandate: 'mandate_123',
        amountCents: 500,
        currency: 'usd',
        description: 'Test payment',
        idempotencyKey: 'idemp_123',
      });

      expect(response).toHaveProperty('content');
      const parsedContent = JSON.parse(response.content[0].text);
      expect(parsedContent.receiptId).toBe('rcpt_123');
      expect(parsedContent.status).toBe('completed');
    });
    
    it('should block charges not in allowedAmountsCents if configured', async () => {
      registerDelegareTools(mockServer, { 
        merchantId: 'm_test', 
        apiKey: 'key_test',
        allowedAmountsCents: [1000, 2000] // Only $10 and $20 allowed
      });
      const handler = registeredTools['authorize_agent_payment'];

      const response = await handler({
        intentMandate: 'mandate_123',
        amountCents: 500, // $5 not allowed
        currency: 'usd',
        description: 'Test payment',
        idempotencyKey: 'idemp_123',
      });

      expect(response.isError).toBe(true);
      const parsedContent = JSON.parse(response.content[0].text);
      expect(parsedContent.error).toBe('amount_not_allowed');
    });
  });
});
