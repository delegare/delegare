// @ts-expect-error - openclaw/plugin-sdk is provided by the host
import { generatePkceVerifierChallenge, toFormUrlEncoded } from "openclaw/plugin-sdk/provider-auth";

/**
 * Delegare OAuth Logic
 * Implements the PKCE authorization code flow against the Delegare vault's
 * own OAuth endpoints (/.well-known/oauth-authorization-server).
 *
 * This replaces the previous Cognito-based flow. Tokens issued here are
 * Delegare `token_xxx` access tokens that the vault's authenticateMerchant
 * middleware accepts directly via `Authorization: Bearer token_xxx`.
 */

type LoginArgs = {
  baseUrl: string; // e.g. "https://api.delegare.dev" or "https://api.sandbox.delegare.dev"
  scopes?: string[];
  prompter: {
    info?: (msg: string) => Promise<void> | void;
    prompt?: (msg: string) => Promise<string | null> | string | null;
  };
  openUrl?: (url: string) => Promise<void> | void;
  isRemote?: boolean;
};

type LoginResult = {
  code: string;
  codeVerifier: string;
  redirectUri: string;
  clientId: string;
};

type ExchangeResult = {
  accessToken: string;
  refreshToken?: string;
  expiresAtEpochSeconds?: number;
};

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

function randomState(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

/**
 * Step 0: Dynamic Client Registration (RFC 7591).
 * The vault exposes POST /v1/oauth2/register which issues a client_id.
 * We register once per session; OpenClaw can cache it.
 */
async function registerClient(baseUrl: string, redirectUri: string): Promise<{ clientId: string }> {
  const res = await fetch(`${normalizeBaseUrl(baseUrl)}/v1/oauth2/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ redirect_uris: [redirectUri] }),
  });
  if (!res.ok) {
    throw new Error(`Client registration failed (${res.status}): ${await res.text()}`);
  }
  const json = (await res.json()) as { client_id: string };
  return { clientId: json.client_id };
}

/**
 * Step 1: Build the authorization URL and prompt the user to sign in.
 */
export async function startDelegarePkceLogin(args: LoginArgs): Promise<LoginResult | null> {
  const { verifier, challenge } = await generatePkceVerifierChallenge();
  const state = randomState();
  const base = normalizeBaseUrl(args.baseUrl);
  const redirectUri = "http://127.0.0.1:9876/oauth/callback";
  const scopes = args.scopes ?? ["pay", "balance", "revoke"];

  // Dynamic client registration
  const { clientId } = await registerClient(base, redirectUri);

  const authorizeUrl = new URL(`${base}/v1/oauth2/authorize`);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("scope", scopes.join(" "));
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("code_challenge_method", "S256");
  authorizeUrl.searchParams.set("code_challenge", challenge);

  await args.prompter.info?.("Opening Delegare sign-in in your browser...");
  await args.openUrl?.(authorizeUrl.toString());

  const pasted = (await args.prompter.prompt?.(
    "After signing in and approving, paste the full callback URL (or just the code) here:",
  )) ?? null;

  if (!pasted) return null;

  let code = pasted.trim();
  if (code.startsWith("http")) {
    const url = new URL(code);
    const urlCode = url.searchParams.get("code");
    const urlState = url.searchParams.get("state");
    if (!urlCode) throw new Error("Missing authorization code in callback URL");
    if (urlState && urlState !== state) throw new Error("OAuth state mismatch");
    code = urlCode;
  }

  return { code, codeVerifier: verifier, redirectUri, clientId };
}

/**
 * Step 2: Exchange the authorization code for tokens.
 */
export async function exchangeDelegareCodeForTokens(params: {
  baseUrl: string;
  clientId: string;
  code: string;
  redirectUri: string;
  codeVerifier: string;
}): Promise<ExchangeResult> {
  const tokenUrl = `${normalizeBaseUrl(params.baseUrl)}/v1/oauth2/token`;
  const body = toFormUrlEncoded({
    grant_type: "authorization_code",
    client_id: params.clientId,
    code: params.code,
    redirect_uri: params.redirectUri,
    code_verifier: params.codeVerifier,
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed (${res.status}): ${text}`);
  }

  const json = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  };

  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresAtEpochSeconds: json.expires_in
      ? Math.floor(Date.now() / 1000) + json.expires_in
      : undefined,
  };
}

/**
 * Step 3: Refresh an expired access token.
 */
export async function refreshDelegareToken(params: {
  baseUrl: string;
  refreshToken: string;
}): Promise<ExchangeResult> {
  const body = toFormUrlEncoded({
    grant_type: "refresh_token",
    refresh_token: params.refreshToken,
  });

  const res = await fetch(`${normalizeBaseUrl(params.baseUrl)}/v1/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    throw new Error(`Token refresh failed: ${res.status}`);
  }

  const json = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  };

  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresAtEpochSeconds: json.expires_in
      ? Math.floor(Date.now() / 1000) + json.expires_in
      : undefined,
  };
}
