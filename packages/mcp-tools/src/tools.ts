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
      annotations: {
        title: 'Set Up Spending Mandate',
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
      description: 'Initiate the one-time browser setup flow so the user can connect their payment method and set spending limits. Returns a URL the user must visit. Returns sessionToken for polling.',
      inputSchema: z.object({
        maxPerTxCents: z.number().int().positive().describe('Maximum charge per transaction in cents'),
        maxMonthlySpendCents: z.number().int().positive().describe('Maximum total spend per month in cents'),
        rail: z.enum(['fiat', 'crypto', 'both']).optional().describe('Which payment rails to enable. Defaults to both.'),
        railPreference: z.enum(['auto', 'fiat_first', 'crypto_first', 'cheapest', 'fastest']).optional().describe('How to select the rail when both are available. Defaults to auto.'),
      }),
      outputSchema: z.object({
<<<<<<< HEAD
        message: z.string().optional().describe('Human-readable next-step instructions'),
        setupUrl: z.string().optional().describe('URL the user visits to connect a payment method'),
        sessionToken: z.string().optional().describe('Token to poll for completion via poll_setup_session'),
        expiresInSeconds: z.number().optional().describe('Seconds until the setup URL expires'),
=======
        message: z.string().describe('Instructions for the agent to present to the user'),
        setupUrl: z.string().url().describe('The URL the user must visit'),
        sessionToken: z.string().describe('Token to use for polling'),
        expiresInSeconds: z.number().int().describe('Seconds until the URL expires'),
>>>>>>> 3c9db2c... release(mcp-tools): annotations + descriptions for ChatGPT/Claude submission
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

      const out = {
        message:
          'Please ask the user to visit the setup URL to connect their payment method. ' +
          'This is a one-time step. The setup URL expires in 10 minutes. ' +
          'Use poll_setup_session with the sessionToken to check when setup is complete.',
        setupUrl: session.setupUrl,
        sessionToken: session.sessionToken,
        expiresInSeconds: session.expiresInSeconds,
      };
      return {
        content: [{ type: 'text', text: JSON.stringify(out) }],
        structuredContent: out,
      };
    },
  );

  // ── poll_setup_session ─────────────────────────────────────────────────────
  server.registerTool(
    'poll_setup_session',
    {
      annotations: {
        title: 'Poll Setup Session',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
      description: 'Check whether the user has completed the payment setup flow. Call this after presenting the setup URL. Returns the intentMandate once complete — store it in agent context for future payments.',
      inputSchema: z.object({
        sessionToken: z.string().describe('The sessionToken returned by setup_spending_mandate'),
      }),
      outputSchema: z.object({
<<<<<<< HEAD
        status: z.string().optional().describe('Setup status: pending, complete, or expired'),
        intentMandate: z.string().optional().describe('The finalized intent mandate when complete'),
        encodedMandate: z.string().optional().describe('Legacy encoded mandate field'),
=======
        status: z.enum(['pending', 'completed', 'expired', 'cancelled']).describe('Current status of the setup session'),
        intentMandate: z.string().optional().describe('The SD-JWT-VC spending mandate (returned once completed)'),
        error: z.string().optional().describe('Error message if setup failed'),
>>>>>>> 3c9db2c... release(mcp-tools): annotations + descriptions for ChatGPT/Claude submission
      }),
      securitySchemes: oauthSecurity,
    } as any,
    async (args: any) => {
      const { sessionToken } = args || {};
      const result = await client.getSetupSession(sessionToken);

      return {
        content: [{ type: 'text', text: JSON.stringify(result) }],
        structuredContent: result as unknown as Record<string, unknown>,
      };
    },
  );

  // ── check_mandate_balance ────────────────────────────────────────────────────
  server.registerTool(
    'check_mandate_balance',
    {
      annotations: {
        title: 'Check Mandate Balance',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
      description: 'Check remaining monthly budget and masked payment methods for a spending mandate. Never returns card numbers or wallet seeds — only masked summaries.',
      inputSchema: z.object({
        intentMandate: z.string().describe('The intentMandate (SD-JWT-VC) stored in agent context'),
      }),
      outputSchema: z.object({
<<<<<<< HEAD
        status: z.string().optional().describe('Mandate status (e.g. active)'),
        maxMonthlySpendCents: z.number().optional().describe('Maximum monthly spend in cents'),
        currentMonthlySpendCents: z.number().optional().describe('Amount spent this month in cents'),
        remainingMonthlySpendCents: z.number().optional().describe('Remaining monthly budget in cents'),
        maxPerTxCents: z.number().optional().describe('Maximum per-transaction spend in cents'),
        currency: z.string().optional().describe('Currency (e.g. usd)'),
=======
        monthlyLimitCents: z.number().int().describe('Total monthly limit in cents'),
        monthlySpentCents: z.number().int().describe('Amount spent this month in cents'),
        remainingCents: z.number().int().describe('Remaining budget for the month'),
        currency: z.string().describe('Currency of the limits'),
        maskedPaymentMethod: z.string().describe('Description of the connected payment method'),
>>>>>>> 3c9db2c... release(mcp-tools): annotations + descriptions for ChatGPT/Claude submission
      }),
      securitySchemes: oauthSecurity,
    } as any,
    async (args: any) => {
      const { intentMandate } = args || {};
      const balance = await client.getBalance(intentMandate);

      return {
        content: [{ type: 'text', text: JSON.stringify(balance) }],
        structuredContent: balance as unknown as Record<string, unknown>,
      };
    },
  );

  // ── authorize_agent_payment ───────────────────────────────────────────────────────────
  server.registerTool(
    'authorize_agent_payment',
    {
      annotations: {
        title: 'Authorize Agent Payment',
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
      description: 'Execute a payment through the Delegare vault using AP2. The agent presents its Intent Mandate (SD-JWT-VC). Spending limits are enforced server-side. IMPORTANT: amountCents is in US cents — divide by 100 for the dollar amount (e.g. amountCents=50 means $0.50, NOT 50 dollars or 50 USDC).',
      inputSchema: z.object({
        intentMandate: z.string().describe('The intentMandate stored in agent context'),
        amountCents: z.number().int().positive().describe('Amount in US cents (1/100th of a dollar). amountCents=50 = $0.50. amountCents=499 = $4.99. DO NOT display this as the dollar amount.'),
        currency: z.enum(['usd', 'usdc', 'usdt']).describe('Settlement currency (usdc = USDC stablecoin on Base). The dollar amount is amountCents / 100.'),
        description: z.string().describe('Human-readable description of what is being paid for'),
        idempotencyKey: z.string().describe('Unique key to prevent duplicate charges. Use a stable identifier like a subscription ID.'),
        metadataJson: z.string().optional().describe('Optional JSON string of key-value metadata (e.g. \'{"planId":"growth"}\')'),
      }),
      outputSchema: z.object({
<<<<<<< HEAD
        receiptId: z.string().optional().describe('Unique receipt identifier'),
        status: z.string().optional().describe('Payment status'),
        transaction: z.string().optional().describe('On-chain transaction hash when settled on-chain'),
        network: z.string().optional().describe('Settlement network'),
        amountCents: z.number().optional().describe('Amount charged in cents'),
        currency: z.string().optional().describe('Settlement currency'),
        amountUsd: z.string().optional().describe('Human-readable dollar amount'),
        note: z.string().optional().describe('Human-readable payment summary'),
=======
        receiptId: z.string().describe('Unique receipt identifier'),
        status: z.string().describe('Payment status'),
        amountCents: z.number().int().describe('Amount charged in cents'),
        currency: z.string().describe('Currency charged'),
        transactionHash: z.string().optional().describe('On-chain transaction hash if applicable'),
        amountUsd: z.string().describe('Human-readable dollar amount'),
        note: z.string().describe('Additional details about the payment'),
>>>>>>> 3c9db2c... release(mcp-tools): annotations + descriptions for ChatGPT/Claude submission
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
      const out = {
        ...receipt,
        amountUsd: `$${usdAmount}`,
        note: `Payment of $${usdAmount} (${amountCents} cents) processed via ${currency.toUpperCase()} on Base.`,
      };
      return {
        content: [{ type: 'text', text: JSON.stringify(out) }],
        structuredContent: out,
      };
    },
  );

  // ── delegare_fetch ─────────────────────────────────────────────────────────
  server.registerTool(
    'delegare_fetch',
    {
      annotations: {
        title: 'Delegare Fetch',
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
      description: 'Fetch a URL. If the resource requires payment via x402, this tool will automatically use the provided spending mandate to authorize the payment and retrieve the data. Supports both GET and POST.',
      inputSchema: z.object({
        url: z.string().url().describe('The URL to fetch'),
        method: z.enum(['GET', 'POST']).default('GET').describe('HTTP method'),
        body: z.string().optional().describe('Optional JSON body for POST requests'),
        intentMandate: z.string().describe('Your active spending delegate token (intentMandate)'),
      }),
      outputSchema: z.object({
<<<<<<< HEAD
        status: z.number().optional().describe('HTTP response status code'),
        content: z.any().optional().describe('The response body (JSON or text)'),
        paymentExecuted: z.boolean().optional().describe('Whether an x402 payment was executed'),
        receipt: z.any().optional().describe('Payment receipt when a payment was executed'),
=======
        status: z.number().int().describe('HTTP status code'),
        content: z.any().describe('Response content (parsed JSON or raw text)'),
        paymentExecuted: z.boolean().describe('Whether a payment was executed to access this resource'),
        receipt: z.any().optional().describe('Payment receipt if a payment was executed'),
>>>>>>> 3c9db2c... release(mcp-tools): annotations + descriptions for ChatGPT/Claude submission
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

        const out = {
          status: response.status,
          content: data,
          paymentExecuted: !!receipt,
          receipt,
        };
        return {
          content: [{ type: 'text', text: JSON.stringify(out) }],
          structuredContent: out,
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
      annotations: {
        title: 'Revoke Mandate',
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
      description: 'Immediately revoke a spending mandate. After revocation, no further charges can be made with this intentMandate. The user can create a new mandate at any time.',
      inputSchema: z.object({
        intentMandate: z.string().describe('The intentMandate to revoke'),
      }),
      outputSchema: z.object({
<<<<<<< HEAD
        status: z.string().optional().describe('Revocation status'),
        revoked: z.boolean().optional().describe('Whether the mandate was revoked'),
        message: z.string().optional().describe('Human-readable result message'),
=======
        status: z.string().describe('Revocation status'),
        revokedAt: z.string().describe('Timestamp of revocation'),
>>>>>>> 3c9db2c... release(mcp-tools): annotations + descriptions for ChatGPT/Claude submission
      }),
      securitySchemes: oauthSecurity,
    } as any,
    async (args: any) => {
      const { intentMandate } = args || {};
      const result = await client.revoke(intentMandate);

      return {
        content: [{ type: 'text', text: JSON.stringify(result) }],
        structuredContent: result as unknown as Record<string, unknown>,
      };
    },
  );
}
