import { requireUser } from "@/lib/auth-helpers";
import {
  getAuthUrl,
  isGscConfigured,
} from "@/lib/google-search-console";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function GET() {
  let user;
  try {
    user = await requireUser();
  } catch {
    return Response.redirect(new URL("/sign-in", process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"));
  }
  if (!isGscConfigured()) {
    return Response.json(
      { error: "Google OAuth not configured. Set GOOGLE_OAUTH_CLIENT_ID + GOOGLE_OAUTH_CLIENT_SECRET." },
      { status: 503 },
    );
  }

  // CSRF state — random + bound to user via cookie
  const state = randomBytes(16).toString("hex");
  const c = await cookies();
  c.set(`gsc_state_${user.id}`, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  const url = getAuthUrl(`${user.id}.${state}`);
  return Response.redirect(url);
}
