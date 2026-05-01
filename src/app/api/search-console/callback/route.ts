import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { exchangeCode } from "@/lib/google-search-console";

export const runtime = "nodejs";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const error = req.nextUrl.searchParams.get("error");

  if (error) {
    return Response.redirect(
      `${SITE_URL}/search-console?error=${encodeURIComponent(error)}`,
    );
  }
  if (!code || !state) {
    return Response.redirect(`${SITE_URL}/search-console?error=missing_params`);
  }

  let user;
  try {
    user = await requireUser();
  } catch {
    return Response.redirect(`${SITE_URL}/sign-in`);
  }

  // verify state
  const [stateUserId, stateNonce] = state.split(".");
  if (stateUserId !== user.id) {
    return Response.redirect(`${SITE_URL}/search-console?error=state_mismatch`);
  }
  const c = await cookies();
  const cookieState = c.get(`gsc_state_${user.id}`)?.value;
  if (!cookieState || cookieState !== stateNonce) {
    return Response.redirect(`${SITE_URL}/search-console?error=csrf`);
  }
  c.delete(`gsc_state_${user.id}`);

  try {
    const tokens = await exchangeCode(code);
    await db.searchConsoleConnection.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        email: tokens.email,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
        scope: tokens.scope,
      },
      update: {
        email: tokens.email,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
        scope: tokens.scope,
      },
    });
  } catch (err) {
    return Response.redirect(
      `${SITE_URL}/search-console?error=${encodeURIComponent(
        err instanceof Error ? err.message : "exchange_failed",
      )}`,
    );
  }

  return Response.redirect(`${SITE_URL}/search-console?status=connected`);
}
