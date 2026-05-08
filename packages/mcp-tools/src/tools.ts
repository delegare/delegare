import { z } from 'zod';
import { Delegare } from '@delegare/sdk';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RegisterDelegareToolsOptions } from './types';

export function registerDelegareTools(
  server: McpServer,
  options: RegisterDelegareToolsOptions,
): void {
  const client = new Delegare({
    merchantId: options.merchantId,
    apiKey: options.apiKey ?? '',
    baseUrl: options.baseUrl,
  });

  const oauthSecurity = [{ type: 'oauth2', scopes: ['pay', 'balance', 'revoke'] }];

  // ── setup_spending_mandate ─────────────────────────────────────────────────
  server.registerTool(
    'setup_spending_mandate',
    {
      description: 'Initiate the one-time browser setup flow so the user can connect their payment method and set spending limits. Returns a URL the user must visit. Returns sessionToken for polling.',
      inputSchema: z.object({
        maxPerTxCents: z.number().int().positive().describe('Maximum charge per transaction in cents'),
        maxMonthlySpendCents: z.number().int().positive().describe('Maximum total spend per month in cents'),
        rail: z.enum(['fiat', 'crypto', 'both']).optional().describe('Which payment rails to enable. Defaults to both.'),
        railPreference: z.enum(['auto', 'fiat_first', 'crypto_first', 'cheapest', 'fastest']).optional().describe('How to select the rail when both are available. Defaults to auto.'),
      }),
      securitySchemes: oauthSecurity,
    } as any,
    async (args: any) => {
      const { maxPerTxCents, maxMonthlySpendCents, rail, railPreference } = args || {};

      const session = await client.createSetupSession({
        maxPerTxCents,
        maxMonthlySpendCents,
        rail: rail ?? 'both',
        railPreference: railPreference ?? 'auto',
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              message:
                'Please ask the user to visit the setup URL to connect their payment method. ' +
                'This is a one-time step. The setup URL expires in 10 minutes. ' +
                'Use poll_setup_session with the sessionToken to check when setup is complete.',
              setupUrl: session.setupUrl,
              sessionToken: session.sessionToken,
              expiresInSeconds: session.expiresInSeconds,
            }),
          },
        ],
      };
    },
  );

  // ── poll_setup_session ─────────────────────────────────────────────────────
  server.registerTool(
    'poll_setup_session',
    {
      description: 'Check whether the user has completed the payment setup flow. Call this after presenting the setup URL. Returns the intentMandate once complete — store it in agent context for future payments.',
      inputSchema: z.object({
        sessionToken: z.string().describe('The sessionToken returned by setup_spending_mandate'),
      }),
      securitySchemes: oauthSecurity,
    } as any,
    async (args: any) => {
      const { sessionToken } = args || {};
      const result = await client.getSetupSession(sessionToken);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result),
          },
        ],
      };
    },
  );

  // ── check_mandate_balance ────────────────────────────────────────────────────
  server.registerTool(
    'check_mandate_balance',
    {
      description: 'Check remaining monthly budget and masked payment methods for a spending mandate. Never returns card numbers or wallet seeds — only masked summaries.',
      inputSchema: z.object({
        intentMandate: z.string().describe('The intentMandate (SD-JWT-VC) stored in agent context'),
      }),
      securitySchemes: oauthSecurity,
    } as any,
    async (args: any) => {
      const { intentMandate } = args || {};
      const balance = await client.getBalance(intentMandate);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(balance),
          },
        ],
      };
    },
  );

  // ── authorize_agent_payment ───────────────────────────────────────────────────────────
  server.registerTool(
    'authorize_agent_payment',
    {
      description: 'Execute a payment through the Delegare vault using AP2. The agent presents its Intent Mandate (SD-JWT-VC). Spending limits are enforced server-side. IMPORTANT: amountCents is in US cents — divide by 100 for the dollar amount (e.g. amountCents=50 means $0.50, NOT 50 dollars or 50 USDC).',
      inputSchema: z.object({
        intentMandate: z.string().describe('The intentMandate stored in agent context'),
        amountCents: z.number().int().positive().describe('Amount in US cents (1/100th of a dollar). amountCents=50 = $0.50. amountCents=499 = $4.99. DO NOT display this as the dollar amount.'),
        currency: z.enum(['usd', 'usdc', 'usdt']).describe('Settlement currency (usdc = USDC stablecoin on Base). The dollar amount is amountCents / 100.'),
        description: z.string().describe('Human-readable description of what is being paid for'),
        idempotencyKey: z.string().describe('Unique key to prevent duplicate charges. Use a stable identifier like a subscription ID.'),
        metadataJson: z.string().optional().describe('Optional JSON string of key-value metadata (e.g. \'{"planId":"growth"}\')'),
      }),
      securitySchemes: oauthSecurity,
    } as any,
    async (args: any) => {
      const { intentMandate, amountCents, currency, description, idempotencyKey, metadataJson } = args || {};
      if (options.allowedAmountsCents && !options.allowedAmountsCents.includes(amountCents)) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                error: 'amount_not_allowed',
                message: `Amount ${amountCents} cents is not in the allowed amounts list`,
                allowedAmounts: options.allowedAmountsCents,
              }),
            },
          ],
          isError: true,
        };
      }

      let metadata: Record<string, string> | undefined;
      if (metadataJson) {
        try {
          metadata = JSON.parse(metadataJson) as Record<string, string>;
        } catch {
          metadata = undefined;
        }
      }

      const receipt = await client.charge({
        intentMandate,
        amountCents,
        currency,
        description,
        idempotencyKey,
        metadata,
      });

      const usdAmount = (amountCents / 100).toFixed(2);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              ...receipt,
              amountUsd: `$${usdAmount}`,
              note: `Payment of $${usdAmount} (${amountCents} cents) processed via ${currency.toUpperCase()} on Base.`,
            }),
          },
        ],
      };
    },
  );

  // ── delegare_fetch ─────────────────────────────────────────────────────────
  server.registerTool(
    'delegare_fetch',
    {
      description: 'Fetch a URL. If the resource requires payment via x402, this tool will automatically use the provided spending mandate to authorize the payment and retrieve the data. Supports both GET and POST.',
      inputSchema: z.object({
        url: z.string().url().describe('The URL to fetch'),
        method: z.enum(['GET', 'POST']).default('GET').describe('HTTP method'),
        body: z.string().optional().describe('Optional JSON body for POST requests'),
        intentMandate: z.string().describe('Your active spending delegate token (intentMandate)'),
      }),
      securitySchemes: oauthSecurity,
    } as any,
    async (args: any) => {
      const { url, method, body, intentMandate } = args || {};

      try {
        const init: RequestInit = {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: body ? body : undefined,
        };

        const response = await client.fetch(url, init, intentMandate);
        const text = await response.text();
        const isJson = response.headers.get('content-type')?.includes('application/json');

        let data;
        try {
          data = isJson ? JSON.parse(text) : text;
        } catch {
          data = text;
        }

        const xPaymentResponse = response.headers.get('x-payment-response');
        let receipt;
        if (xPaymentResponse) {
          try {
            receipt = JSON.parse(Buffer.from(xPaymentResponse, 'base64').toString('utf8'));
          } catch {}
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                status: response.status,
                content: data,
                paymentExecuted: !!receipt,
                receipt,
              }),
            },
          ],
        };
      } catch (err: any) {
        return {
          content: [{ type: 'text', text: JSON.stringify({ error: err.message }) }],
          isError: true,
        };
      }
    },
  );

  // ── revoke_mandate ────────────────────────────────────────────────────────
  server.registerTool(
    'revoke_mandate',
    {
      description: 'Immediately revoke a spending mandate. After revocation, no further charges can be made with this intentMandate. The user can create a new mandate at any time.',
      inputSchema: z.object({
        intentMandate: z.string().describe('The intentMandate to revoke'),
      }),
      securitySchemes: oauthSecurity,
    } as any,
    async (args: any) => {
      const { intentMandate } = args || {};
      const result = await client.revoke(intentMandate);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result),
          },
        ],
      };
    },
  );
}
