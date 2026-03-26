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
    apiKey: options.apiKey,
    baseUrl: options.baseUrl,
  });

  // ── setup_payment_delegate ─────────────────────────────────────────────────
  server.tool(
    'setup_payment_delegate',
    'Initiate the one-time browser setup flow so the user can connect their payment method ' +
    'and set spending limits. Returns a URL the user must visit. Returns sessionToken for polling.',
    {
      maxPerTxCents: z.number().int().positive().describe('Maximum charge per transaction in cents'),
      maxMonthlySpendCents: z.number().int().positive().describe('Maximum total spend per month in cents'),
      rail: z.enum(['fiat', 'crypto', 'both']).optional()
        .describe('Which payment rails to enable. Defaults to both.'),
      railPreference: z.enum(['auto', 'fiat_first', 'crypto_first', 'cheapest', 'fastest']).optional()
        .describe('How to select the rail when both are available. Defaults to auto.'),
    },
    async ({ maxPerTxCents, maxMonthlySpendCents, rail, railPreference }) => {
      const session = await client.createSetupSession({
        maxPerTxCents,
        maxMonthlySpendCents,
        rail: rail ?? 'both',
        railPreference: railPreference ?? 'auto',
      });

      return {
        content: [
          {
            type: 'text' as const,
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
  server.tool(
    'poll_setup_session',
    'Check whether the user has completed the payment setup flow. Call this after presenting ' +
    'the setup URL. Returns the delegateToken once complete — store it in agent context for future payments.',
    {
      sessionToken: z.string().describe('The sessionToken returned by setup_payment_delegate'),
    },
    async ({ sessionToken }) => {
      const result = await client.getSetupSession(sessionToken);

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result),
          },
        ],
      };
    },
  );

  // ── check_agent_balance ────────────────────────────────────────────────────
  server.tool(
    'check_agent_balance',
    'Check remaining monthly budget and masked payment methods for a spending delegate. ' +
    'Never returns card numbers or wallet seeds — only masked summaries.',
    {
      delegateToken: z.string().describe('The delegateToken stored in agent context'),
    },
    async ({ delegateToken }) => {
      const balance = await client.getBalance(delegateToken);

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(balance),
          },
        ],
      };
    },
  );

  // ── pay_merchant ───────────────────────────────────────────────────────────
  server.tool(
    'pay_merchant',
    'Execute a payment through the Delegare vault. The agent never handles card numbers or ' +
    'wallet keys — only the opaque delegateToken. Spending limits are enforced server-side.',
    {
      delegateToken: z.string().describe('The delegateToken stored in agent context'),
      amountCents: z.number().int().positive().describe('Amount to charge in cents (e.g. 9900 = $99.00)'),
      currency: z.enum(['usd', 'usdc', 'usdt']).describe('Currency for the charge'),
      description: z.string().describe('Human-readable description of what is being paid for'),
      idempotencyKey: z.string().describe(
        'Unique key to prevent duplicate charges. Use a stable identifier like a subscription ID.',
      ),
      metadataJson: z.string().optional().describe(
        'Optional JSON string of key-value metadata (e.g. \'{"planId":"growth"}\')',
      ),
    },
    async ({ delegateToken, amountCents, currency, description, idempotencyKey, metadataJson }) => {
      if (options.allowedAmountsCents && !options.allowedAmountsCents.includes(amountCents)) {
        return {
          content: [
            {
              type: 'text' as const,
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
        delegateToken,
        amountCents,
        currency,
        description,
        idempotencyKey,
        metadata,
      });

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(receipt),
          },
        ],
      };
    },
  );

  // ── revoke_delegate ────────────────────────────────────────────────────────
  server.tool(
    'revoke_delegate',
    'Immediately revoke a spending delegate. After revocation, no further charges can be made ' +
    'with this delegateToken. The user can create a new delegate at any time.',
    {
      delegateToken: z.string().describe('The delegateToken to revoke'),
    },
    async ({ delegateToken }) => {
      const result = await client.revoke(delegateToken);

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result),
          },
        ],
      };
    },
  );
}
