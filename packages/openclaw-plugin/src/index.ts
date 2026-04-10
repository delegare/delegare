// @ts-expect-error - openclaw/plugin-sdk is provided by the OpenClaw host at runtime
import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { Type } from "@sinclair/typebox";
// @ts-ignore
import { Delegare } from "@delegare/sdk";

/**
 * Helper to create a Delegare client using credentials from OpenClaw's OAuth flow.
 * In OpenClaw plugins, auth metadata is typically passed in the third argument of execute.
 */
function getClient(config: any, meta?: any) {
  // OpenClaw injects OAuth tokens and merchant context into the meta object.
  // The exact path depends on how the OAuth flow was configured in OpenClaw.
  const merchantId = meta?.auth?.merchantId || "";
  const apiKey = meta?.auth?.apiKey || "";
  const baseUrl = meta?.auth?.baseUrl || config?.baseUrl;
  
  return new Delegare({
    merchantId,
    apiKey,
    ...(baseUrl ? { baseUrl } : {})
  });
}

/**
 * Native OpenClaw Plugin Entry
 * This is the preferred way to extend OpenClaw as it runs in-process and
 * integrates directly with OpenClaw's capability registration.
 */
export default definePluginEntry({
  id: "delegare",
  name: "Delegare",
  description: "Delegare - Trustless payment delegation for AI agents in OpenClaw",
  register(api: any) {
    const config = api.config || {};

    // ── setup_spending_mandate ─────────────────────────────────────────────────
    api.registerTool({
      name: "setup_spending_mandate",
      description: "Initiate the one-time browser setup flow so the user can connect their payment method and set spending limits. Returns a URL the user must visit. Returns sessionToken for polling.",
      parameters: Type.Object({
        maxPerTxCents: Type.Number({ description: "Maximum charge per transaction in cents" }),
        maxMonthlySpendCents: Type.Number({ description: "Maximum total spend per month in cents" }),
        rail: Type.Optional(Type.Enum({ fiat: "fiat", crypto: "crypto", both: "both" }, { description: "Which payment rails to enable. Defaults to both." })),
        railPreference: Type.Optional(Type.Enum({ auto: "auto", fiat_first: "fiat_first", crypto_first: "crypto_first", cheapest: "cheapest", fastest: "fastest" }, { description: "How to select the rail when both are available. Defaults to auto." })),
      }),
      async execute(_id: string, params: any, meta: any) {
        const client = getClient(config, meta);
        const session = await client.createSetupSession({
          maxPerTxCents: params.maxPerTxCents,
          maxMonthlySpendCents: params.maxMonthlySpendCents,
          rail: params.rail ?? "both",
          railPreference: params.railPreference ?? "auto",
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                message: "Please ask the user to visit the setup URL to connect their payment method. Use poll_setup_session with the sessionToken to check when setup is complete.",
                setupUrl: session.setupUrl,
                sessionToken: session.sessionToken,
                expiresInSeconds: session.expiresInSeconds,
              }),
            },
          ],
        };
      },
    });

    // ── poll_setup_session ─────────────────────────────────────────────────────
    api.registerTool({
      name: "poll_setup_session",
      description: "Check whether the user has completed the payment setup flow. Call this after presenting the setup URL. Returns the intentMandate once complete.",
      parameters: Type.Object({
        sessionToken: Type.String({ description: "The sessionToken returned by setup_spending_mandate" }),
      }),
      async execute(_id: string, params: any, meta: any) {
        const client = getClient(config, meta);
        const result = await client.getSetupSession(params.sessionToken);
        return {
          content: [{ type: "text", text: JSON.stringify(result) }],
        };
      },
    });

    // ── check_mandate_balance ────────────────────────────────────────────────────
    api.registerTool({
      name: "check_mandate_balance",
      description: "Check remaining monthly budget and masked payment methods for a spending mandate.",
      parameters: Type.Object({
        intentMandate: Type.String({ description: "The intentMandate (SD-JWT-VC) stored in agent context" }),
      }),
      async execute(_id: string, params: any, meta: any) {
        const client = getClient(config, meta);
        const balance = await client.getBalance(params.intentMandate);
        return {
          content: [{ type: "text", text: JSON.stringify(balance) }],
        };
      },
    });

    // ── authorize_agent_payment ───────────────────────────────────────────────────────────
    api.registerTool({
      name: "authorize_agent_payment",
      description: "Execute a payment through the Delegare vault using AP2. The agent presents its Intent Mandate (SD-JWT-VC).",
      parameters: Type.Object({
        intentMandate: Type.String({ description: "The intentMandate stored in agent context" }),
        amountCents: Type.Number({ description: "Amount to charge in cents (e.g. 9900 = $99.00)" }),
        currency: Type.Enum({ usd: "usd", usdc: "usdc", usdt: "usdt" }, { description: "Currency for the charge" }),
        description: Type.String({ description: "Human-readable description of what is being paid for" }),
        idempotencyKey: Type.String({ description: "Unique key to prevent duplicate charges." }),
        metadataJson: Type.Optional(Type.String({ description: "Optional JSON string of key-value metadata" })),
      }),
      async execute(_id: string, params: any, meta: any) {
        const client = getClient(config, meta);
        let metadata: Record<string, string> | undefined;
        if (params.metadataJson) {
          try {
            metadata = JSON.parse(params.metadataJson);
          } catch {
            // ignore malformed metadata
          }
        }

        const receipt = await client.charge({
          intentMandate: params.intentMandate,
          amountCents: params.amountCents,
          currency: params.currency as any,
          description: params.description,
          idempotencyKey: params.idempotencyKey,
          metadata,
        });

        return {
          content: [{ type: "text", text: JSON.stringify(receipt) }],
        };
      },
    });

    // ── delegare_fetch ─────────────────────────────────────────────────────────
    api.registerTool({
      name: "delegare_fetch",
      description: "Fetch a URL. If the resource requires payment via x402, this tool will automatically use the provided spending mandate.",
      parameters: Type.Object({
        url: Type.String({ description: "The URL to fetch" }),
        method: Type.Optional(Type.Enum({ GET: "GET", POST: "POST" }, { description: "HTTP method" })),
        body: Type.Optional(Type.String({ description: "Optional JSON body for POST requests" })),
        intentMandate: Type.String({ description: "Your active spending delegate token (intentMandate)" }),
      }),
      async execute(_id: string, params: any, meta: any) {
        const client = getClient(config, meta);
        try {
          const init: RequestInit = {
            method: params.method ?? "GET",
            headers: { "Content-Type": "application/json" },
            body: params.body || undefined,
          };

          const response = await client.fetch(params.url, init, params.intentMandate);
          const text = await response.text();
          const isJson = response.headers.get("content-type")?.includes("application/json");

          let data;
          try {
            data = isJson ? JSON.parse(text) : text;
          } catch {
            data = text;
          }

          const receipt = client.decodePaymentReceipt(response);

          return {
            content: [
              {
                type: "text",
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
            content: [{ type: "text", text: JSON.stringify({ error: err.message }) }],
            isError: true,
          };
        }
      },
    });

    // ── revoke_mandate ────────────────────────────────────────────────────────
    api.registerTool({
      name: "revoke_mandate",
      description: "Immediately revoke a spending mandate.",
      parameters: Type.Object({
        intentMandate: Type.String({ description: "The intentMandate to revoke" }),
      }),
      async execute(_id: string, params: any, meta: any) {
        const client = getClient(config, meta);
        const result = await client.revoke(params.intentMandate);
        return {
          content: [{ type: "text", text: JSON.stringify(result) }],
        };
      },
    });
  },
});
