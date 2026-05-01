/**
 * Google Search Console (Webmasters API) integration.
 *
 * OAuth flow stores per-user refresh tokens in our DB so we can pull
 * the user's REAL Google data: impressions, clicks, queries, top pages.
 *
 * Read-only scope: webmasters.readonly
 */

import { OAuth2Client } from "google-auth-library";
import { db } from "@/lib/db";

const GSC_BASE = "https://searchconsole.googleapis.com/v1";
const GSC_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

const env = process.env;

export function isGscConfigured(): boolean {
  return Boolean(env.GOOGLE_OAUTH_CLIENT_ID && env.GOOGLE_OAUTH_CLIENT_SECRET);
}

function getRedirectUri(): string {
  const explicit = env.GOOGLE_OAUTH_REDIRECT_URI;
  if (explicit) return explicit;
  const site = env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${site}/api/search-console/callback`;
}

export function getOAuthClient(): OAuth2Client {
  if (!env.GOOGLE_OAUTH_CLIENT_ID || !env.GOOGLE_OAUTH_CLIENT_SECRET) {
    throw new Error("Google OAuth not configured");
  }
  return new OAuth2Client({
    clientId: env.GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: env.GOOGLE_OAUTH_CLIENT_SECRET,
    redirectUri: getRedirectUri(),
  });
}

export function getAuthUrl(state: string): string {
  const client = getOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent", // force refresh_token
    scope: [GSC_SCOPE, "openid", "email"],
    state,
    include_granted_scopes: true,
  });
}

export async function exchangeCode(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scope: string;
  email: string;
}> {
  const client = getOAuthClient();
  const { tokens } = await client.getToken(code);
  if (!tokens.access_token) throw new Error("No access token in response");
  if (!tokens.refresh_token)
    throw new Error(
      "No refresh token — user may have already authorized; revoke and retry.",
    );

  // resolve email from id_token if present
  let email = "";
  if (tokens.id_token) {
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: env.GOOGLE_OAUTH_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    email = payload?.email ?? "";
  }

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: tokens.expiry_date
      ? new Date(tokens.expiry_date)
      : new Date(Date.now() + 3600 * 1000),
    scope: tokens.scope ?? GSC_SCOPE,
    email,
  };
}

/**
 * Get a valid access token for a stored connection — refreshes if expired.
 */
export async function getValidAccessToken(userId: string): Promise<string> {
  const conn = await db.searchConsoleConnection.findUnique({
    where: { userId },
  });
  if (!conn) throw new Error("Search Console not connected");

  // refresh if within 60 seconds of expiry
  if (conn.expiresAt.getTime() - Date.now() > 60 * 1000) {
    return conn.accessToken;
  }

  const client = getOAuthClient();
  client.setCredentials({ refresh_token: conn.refreshToken });
  const { credentials } = await client.refreshAccessToken();
  if (!credentials.access_token) throw new Error("Failed to refresh token");

  await db.searchConsoleConnection.update({
    where: { userId },
    data: {
      accessToken: credentials.access_token,
      expiresAt: credentials.expiry_date
        ? new Date(credentials.expiry_date)
        : new Date(Date.now() + 3600 * 1000),
    },
  });
  return credentials.access_token;
}

/* ========================================================================== */
/* REST helpers                                                                */
/* ========================================================================== */

async function gscFetch<T>(
  accessToken: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${GSC_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GSC ${res.status}: ${text.slice(0, 240)}`);
  }
  return (await res.json()) as T;
}

export type GscSite = {
  siteUrl: string;
  permissionLevel: string;
};

export async function listSites(accessToken: string): Promise<GscSite[]> {
  const data = await gscFetch<{ siteEntry?: GscSite[] }>(
    accessToken,
    "/sites",
  );
  return (data.siteEntry ?? []).filter(
    (s) => s.permissionLevel !== "siteUnverifiedUser",
  );
}

export type GscRow = {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export async function getSearchAnalytics(
  accessToken: string,
  siteUrl: string,
  opts: {
    startDate: string; // YYYY-MM-DD
    endDate: string;
    dimensions?: ("query" | "page" | "country" | "device" | "date")[];
    rowLimit?: number;
  },
): Promise<GscRow[]> {
  const body = {
    startDate: opts.startDate,
    endDate: opts.endDate,
    dimensions: opts.dimensions ?? ["query"],
    rowLimit: opts.rowLimit ?? 25,
  };
  const data = await gscFetch<{ rows?: GscRow[] }>(
    accessToken,
    `/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    { method: "POST", body: JSON.stringify(body) },
  );
  return data.rows ?? [];
}

export function formatDateYmd(d: Date): string {
  return d.toISOString().slice(0, 10);
}
