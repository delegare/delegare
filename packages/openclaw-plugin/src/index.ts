// @ts-expect-error - openclaw/plugin-sdk is provided by the OpenClaw host at runtime
import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
// @ts-expect-error - provided by host
import { buildOauthProviderAuthResult } from "openclaw/plugin-sdk/provider-auth";
import { Type } from "@sinclair/typebox";
// @ts-ignore
import { Delegare } from "@delegare/sdk";
import {
  startDelegarePkceLogin,
  exchangeDelegareCodeForTokens,
  refreshDelegareToken,
} from "./delegare-oauth.js";

const PROVIDER_ID = "delegare";

// ── Helpers ──────────────────────────────────────────────────────────────────

function resolveBaseUrl(config: any): string {
  if (config?.baseUrl) return config.baseUrl;
  if (config?.environment === "sandbox") return "https://api.sandbox.delegare.dev/v1";
  return "https://api.delegare.dev/v1";
}

/**
 * Build a Delegare client from whatever credentials are available.
 *
 * Priority:
 *   1. OAuth access token from meta.auth (OpenClaw provider auth flow)
 *   2. Legacy API key from meta.auth or plugin config
 */
function getClient(config: any, meta?: any) {
  const baseUrl = meta?.auth?.baseUrl || resolveBaseUrl(config);

  // --- OAuth access token (primary path) ---
  const accessToken =
    meta?.auth?.access ||
    meta?.auth?.accessToken ||
    config?.accessToken;

  const refreshToken = meta?.auth?.refresh || meta?.auth?.refreshToken;

  if (accessToken) {
    return new Delegare({
      accessToken,
      refreshToken,
      baseUrl,
    });
  }

  // --- API Key (fallback path) ---
  let merchantId = meta?.auth?.merchantId;
  if (!merchantId && Array.isArray(meta?.auth?.notes)) {
    const note = meta.auth.notes.find((n: string) => n.startsWith("merchantId:"));
    if (note) merchantId = note.split(":")[1];
  }
  if (!merchantId) merchantId = config?.merchantId;

  const apiKey = meta?.auth?.apiKey || config?.apiKey;

  if (merchantId && apiKey) {
    return new Delegare({ merchantId, apiKey, baseUrl });
  }

  throw new Error(
    "Delegare authentication required. Please connect your Delegare account " +
    "using OAuth in the OpenClaw settings interface (Settings > Config > Authentication)."
  );
}

// ── OAuth flow (against the vault, not Cognito) ─────────────────────────────

async function runDelegareOAuth(ctx: any, apiConfig: any) {
  try {
    const baseUrl = apiConfig?.baseUrl?.replace(/\/v1\/?$/, "") ||
      (apiConfig?.environment === "sandbox"
        ? "https://api.sandbox.delegare.dev"
        : "https://api.delegare.dev");

    const login = await startDelegarePkceLogin({
      baseUrl,
      prompter: ctx.prompter,
      openUrl: ctx.openUrl,
      isRemote: ctx.isRemote,
    });

    if (!login) return { profiles: [] };

    const tokens = await exchangeDelegareCodeForTokens({
      baseUrl,
      clientId: login.clientId,
      code: login.code,
      redirectUri: login.redirectUri,
      codeVerifier: login.codeVerifier,
    });

    return buildOauthProviderAuthResult({
      providerId: PROVIDER_ID,
      access: tokens.accessToken,
      refresh: tokens.refreshToken ?? undefined,
      expires: tokens.expiresAtEpochSeconds ?? undefined,
      profileName: "default",
      // No merchantId or notes needed — the token itself carries the identity
      // server-side. The SDK sends `Authorization: Bearer token_xxx`.
    });
  } catch (err: any) {
    console.error("Delegare OAuth failed:", err);
    return { profiles: [] };
  }
}

// ── Plugin entry ─────────────────────────────────────────────────────────────

export default definePluginEntry({
  id: PROVIDER_ID,
  name: "Delegare",
  description: "Delegare - Trustless payment delegation for AI agents in OpenClaw",
  register(api: any) {
    const config = api.config?.plugins?.entries?.delegare?.config || {};

    // ── provider registration (for UI Connect button) ───────────────────────
    api.registerProvider({
      id: PROVIDER_ID,
      label: "Delegare",
      kind: "service",
      auth: [
        {
          id: "oauth",
          label: "Sign in with Delegare",
          hint: "Browser sign-in",
          kind: "oauth",
          run: async (ctx: any) => await runDelegareOAuth(ctx, config),
        },
      ],
      wizard: {
        setup: {
          choiceId: PROVIDER_ID,
          choiceLabel: "Delegare",
          choiceHint: "Economic Enablement (Payments)",
          methodId: "oauth",
        },
      },
      catalog: {
        order: "profile",
        run: async () => ({
          provider: {
            api: "openai-completions",
            baseUrl: resolveBaseUrl(config),
            models: [
              {
                id: "economic-enabler",
                name: "Delegare Economic Enabler",
                provider: PROVIDER_ID,
                api: "openai-completions",
                baseUrl: resolveBaseUrl(config),
                reasoning: false,
                input: ["text"],
                cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
                contextWindow: 1,
                maxTokens: 1,
              } as any,
            ],
          },
        }),
      },
      refreshOAuth: async (cred: any) => {
        if (!cred.refresh) throw new Error("No refresh token available");
        const baseUrl = config?.baseUrl?.replace(/\/v1\/?$/, "") ||
          (config?.environment === "sandbox"
            ? "https://api.sandbox.delegare.dev"
            : "https://api.delegare.dev");

        const refreshed = await refreshDelegareToken({
          baseUrl,
          refreshToken: cred.refresh,
        });

        return {
          ...cred,
          type: "oauth",
          provider: PROVIDER_ID,
          access: refreshed.accessToken,
          refresh: refreshed.refreshToken ?? cred.refresh,
          expires: refreshed.expiresAtEpochSeconds ?? cred.expires,
        };
      },
    });

    // ── setup_spending_mandate ───────────────────────────────────────────────
    api.registerTool({
      name: "setup_spending_mandate",
      provider: PROVIDER_ID,
      description:
        "Initiate the one-time browser setup flow so the user can connect their payment method and set spending limits. Returns a URL the user must visit. Returns sessionToken for polling.",
      parameters: Type.Object({
        maxPerTxCents: Type.Number({ description: "Maximum charge per transaction in cents" }),
        maxMonthlySpendCents: Type.Number({ description: "Maximum total spend per month in cents" }),
        rail: Type.Optional(
          Type.Enum(
            { fiat: "fiat", crypto: "crypto", both: "both" },
            { description: "Which payment rails to enable. Defaults to both." },
          ),
        ),
        railPreference: Type.Optional(
          Type.Enum(
            { auto: "auto", fiat_first: "fiat_first", crypto_first: "crypto_first", cheapest: "cheapest", fastest: "fastest" },
            { description: "How to select the rail when both are available. Defaults to auto." },
          ),
        ),
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
                message:
                  "Please ask the user to visit the setup URL to connect their payment method. Use poll_setup_session with the sessionToken to check when setup is complete.",
                setupUrl: session.setupUrl,
                sessionToken: session.sessionToken,
                expiresInSeconds: session.expiresInSeconds,
              }),
            },
          ],
        };
      },
    });

    // ── poll_setup_session ───────────────────────────────────────────────────
    api.registerTool({
      name: "poll_setup_session",
      provider: PROVIDER_ID,
      description:
        "Check whether the user has completed the payment setup flow. Call this after presenting the setup URL. Returns the intentMandate once complete.",
      parameters: Type.Object({
        sessionToken: Type.String({ description: "The sessionToken returned by setup_spending_mandate" }),
      }),
      async execute(_id: string, params: any, meta: any) {
        const client = getClient(config, meta);
        const result = await client.getSetupSession(params.sessionToken);
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      },
    });

    // ── check_mandate_balance ────────────────────────────────────────────────
    api.registerTool({
      name: "check_mandate_balance",
      provider: PROVIDER_ID,
      description: "Check remaining monthly budget and masked payment methods for a spending mandate.",
      parameters: Type.Object({
        intentMandate: Type.String({ description: "The intentMandate (SD-JWT-VC) stored in agent context" }),
      }),
      async execute(_id: string, params: any, meta: any) {
        const client = getClient(config, meta);
        const balance = await client.getBalance(params.intentMandate);
        return { content: [{ type: "text", text: JSON.stringify(balance) }] };
      },
    });

    // ── authorize_agent_payment ──────────────────────────────────────────────
    api.registerTool({
      name: "authorize_agent_payment",
      provider: PROVIDER_ID,
      description:
        "Execute a payment through the Delegare vault using AP2. The agent presents its Intent Mandate (SD-JWT-VC).",
      parameters: Type.Object({
        intentMandate: Type.String({ description: "The intentMandate stored in agent context" }),
        amountCents: Type.Number({ description: "Amount to charge in cents (e.g. 9900 = $99.00)" }),
        currency: Type.Enum(
          { usd: "usd", usdc: "usdc", usdt: "usdt" },
          { description: "Currency for the charge" },
        ),
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
        return { content: [{ type: "text", text: JSON.stringify(receipt) }] };
      },
    });

    // ── delegare_fetch ──────────────────────────────────────────────────────
    api.registerTool({
      name: "delegare_fetch",
      provider: PROVIDER_ID,
      description:
        "Fetch a URL. If the resource requires payment via x402, this tool will automatically use the provided spending mandate.",
      parameters: Type.Object({
        url: Type.String({ description: "The URL to fetch" }),
        method: Type.Optional(
          Type.Enum({ GET: "GET", POST: "POST" }, { description: "HTTP method" }),
        ),
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

    // ── revoke_mandate ──────────────────────────────────────────────────────
    api.registerTool({
      name: "revoke_mandate",
      provider: PROVIDER_ID,
      description: "Immediately revoke a spending mandate.",
      parameters: Type.Object({
        intentMandate: Type.String({ description: "The intentMandate to revoke" }),
      }),
      async execute(_id: string, params: any, meta: any) {
        const client = getClient(config, meta);
        const result = await client.revoke(params.intentMandate);
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      },
    });
  },
});
