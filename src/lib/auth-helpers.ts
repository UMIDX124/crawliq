import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import type { Role, User } from "@prisma/client";

/**
 * Resolve the current Clerk user → upsert into our DB → return our User row.
 * Use this in server components and API routes.
 *
 * Returns null if the request is unauthenticated.
 */
export async function getCurrentUser(): Promise<User | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (existing) return existing;

  // First-time login: pull profile from Clerk and create the row.
  const clerk = await currentUser();
  if (!clerk) return null;

  const email =
    clerk.emailAddresses.find((e) => e.id === clerk.primaryEmailAddressId)
      ?.emailAddress ?? clerk.emailAddresses[0]?.emailAddress;
  if (!email) return null;

  const name =
    [clerk.firstName, clerk.lastName].filter(Boolean).join(" ").trim() ||
    clerk.username ||
    email.split("@")[0];

  return db.user.create({
    data: {
      clerkUserId: userId,
      email,
      name,
      avatarUrl: clerk.imageUrl ?? null,
    },
  });
}

/**
 * Strict variant — throws if no current user.
 */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

const ROLE_RANK: Record<Role, number> = {
  CLIENT: 0,
  SPECIALIST: 1,
  ADMIN: 2,
  OWNER: 3,
};

export function hasRole(user: User, atLeast: Role): boolean {
  return ROLE_RANK[user.role] >= ROLE_RANK[atLeast];
}
