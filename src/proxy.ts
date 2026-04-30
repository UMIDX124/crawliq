import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Anything not in this list is public.
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/projects(.*)",
  "/reports(.*)",
  "/tasks(.*)",
  "/settings(.*)",
  "/audit/new",
  "/api/agents(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) return;

  const { userId } = await auth();
  if (userId) return;

  // Unauthenticated and route is protected:
  //  - API routes → return 401 JSON
  //  - Pages → redirect to /sign-in with return URL
  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const signInUrl = new URL("/sign-in", req.url);
  signInUrl.searchParams.set(
    "redirect_url",
    req.nextUrl.pathname + req.nextUrl.search,
  );
  return NextResponse.redirect(signInUrl);
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
