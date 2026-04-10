// @ts-expect-error - openclaw/plugin-sdk is provided by the host
import { generatePkceVerifierChallenge, toFormUrlEncoded } from "openclaw/plugin-sdk/provider-auth";

/**
 * Delegare Cognito OAuth Logic
 * Implements the PKCE flow for AWS Cognito.
 */

type LoginArgs = {
  cognitoDomain: string;
  clientId: string;
  scopes: string[];
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
};

type ExchangeResult = {
  accessToken: string;
  idToken?: string;
  refreshToken?: string;
  expiresAtEpochSeconds?: number;
  email?: string;
  displayName?: string;
  username?: string;
  merchantId?: string;
};

function normalizeDomain(domain: string): string {
  let d = domain.replace(/\/+$/, "");
  if (!d.startsWith("http")) {
    d = `https://${d}`;
  }
  return d;
}

function randomState(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

function buildAuthorizeUrl(params: {
  cognitoDomain: string;
  clientId: string;
  redirectUri: string;
  scopes: string[];
  state: string;
  codeChallenge: string;
}) {
  const url = new URL(`${normalizeDomain(params.cognitoDomain)}/oauth2/authorize`);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", params.clientId);
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("scope", params.scopes.join(" "));
  url.searchParams.set("state", params.state);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("code_challenge", params.codeChallenge);
  return url.toString();
}

function parseCodeFromCallbackUrl(callbackUrl: string, expectedState: string): string {
  const url = new URL(callbackUrl);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code) {
    throw new Error("Missing authorization code in callback URL");
  }
  if (!state || state !== expectedState) {
    throw new Error("OAuth state mismatch");
  }
  return code;
}

export async function startCognitoPkceLogin(args: LoginArgs): Promise<LoginResult | null> {
  const { verifier, challenge } = await generatePkceVerifierChallenge();
  const state = randomState();

  // The redirect URI must be whitelisted in Cognito. 
  // OpenClaw usually expects a local callback if possible, or a manual paste fallback.
  const redirectUri = "http://127.0.0.1:9876/oauth/callback";

  const authorizeUrl = buildAuthorizeUrl({
    cognitoDomain: args.cognitoDomain,
    clientId: args.clientId,
    redirectUri,
    scopes: args.scopes,
    state,
    codeChallenge: challenge,
  });

  await args.prompter.info?.("Opening Delegare sign-in in your browser...");
  await args.openUrl?.(authorizeUrl);

  const pasted = (await args.prompter.prompt?.(
    "After signing in, paste the full callback URL (or just the code from the URL) here:",
  )) ?? null;

  if (!pasted) {
    return null;
  }

  let code = pasted;
  if (pasted.startsWith("http")) {
    code = parseCodeFromCallbackUrl(pasted, state);
  }

  return {
    code,
    codeVerifier: verifier,
    redirectUri,
  };
}

export async function exchangeCognitoCodeForTokens(params: {
  cognitoDomain: string;
  clientId: string;
  code: string;
  redirectUri: string;
  codeVerifier: string;
}): Promise<ExchangeResult> {
  const tokenUrl = `${normalizeDomain(params.cognitoDomain)}/oauth2/token`;
  const body = toFormUrlEncoded({
    grant_type: "authorization_code",
    client_id: params.clientId,
    code: params.code,
    redirect_uri: params.redirectUri,
    code_verifier: params.codeVerifier,
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cognito token exchange failed (${res.status}): ${text}`);
  }

  const json = (await res.json()) as {
    access_token: string;
    id_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };

  let email: string | undefined;
  let username: string | undefined;
  let merchantId: string | undefined;

  try {
    const userInfoRes = await fetch(`${normalizeDomain(params.cognitoDomain)}/oauth2/userInfo`, {
      headers: { Authorization: `Bearer ${json.access_token}` },
    });
    if (userInfoRes.ok) {
      const profile = (await userInfoRes.json()) as Record<string, unknown>;
      email = typeof profile.email === "string" ? profile.email : undefined;
      username = typeof profile.username === "string" ? profile.username : (profile["cognito:username"] as string);
      
      // Map custom attributes if they exist. In Cognito, custom attributes are often prefixed.
      // Also check standard claims.
      merchantId = profile["custom:merchant_id"] as string || profile["merchantId"] as string || profile["custom:merchantId"] as string;
    }
  } catch {
    // non-fatal
  }

  return {
    accessToken: json.access_token,
    idToken: json.id_token,
    refreshToken: json.refresh_token,
    expiresAtEpochSeconds: json.expires_in ? Math.floor(Date.now() / 1000) + json.expires_in : undefined,
    email,
    username,
    merchantId,
  };
}

export async function refreshCognitoToken(params: {
  cognitoDomain: string;
  clientId: string;
  refreshToken?: string | null;
}) {
  if (!params.refreshToken) {
    throw new Error("No refresh token available");
  }
  const body = toFormUrlEncoded({
    grant_type: "refresh_token",
    client_id: params.clientId,
    refresh_token: params.refreshToken,
  });

  const res = await fetch(`${normalizeDomain(params.cognitoDomain)}/oauth2/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    throw new Error(`Cognito token refresh failed: ${res.status}`);
  }

  const json = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  };

  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresAtEpochSeconds: json.expires_in ? Math.floor(Date.now() / 1000) + json.expires_in : undefined,
  };
}
