import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-helpers";
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

  return (
    <div className="min-h-[100dvh] grid md:grid-cols-[240px_1fr]">
      <AppSidebar />
      <div className="min-w-0 flex flex-col">{children}</div>
    </div>
  );
}
