import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-helpers";
import { OnboardingClient } from "./onboarding-client";
import { isGscConfigured } from "@/lib/google-search-console";

export const metadata = { title: "Get started" };

export default async function OnboardingPage() {
  const user = await requireUser();
  if (user.onboardedAt) redirect("/dashboard");

  return (
    <OnboardingClient
      userName={user.name}
      gscEnabled={isGscConfigured()}
    />
  );
}
