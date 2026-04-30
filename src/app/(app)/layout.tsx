import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getUserPlan } from "@/lib/plan-limits";
import { AppSidebar } from "@/components/app/sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }
  const plan = await getUserPlan(user);

  return (
    <div className="min-h-[100dvh] grid md:grid-cols-[240px_1fr]">
      <AppSidebar plan={plan} />
      <div className="min-w-0 flex flex-col">{children}</div>
    </div>
  );
}
