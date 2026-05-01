"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartLine,
  FolderOpen,
  ListChecks,
  FileText,
  Sparkle,
  Gear,
  Plus,
  GoogleLogo,
} from "@phosphor-icons/react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/cn";

const items = [
  { label: "Dashboard", href: "/dashboard", icon: ChartLine },
  { label: "Projects", href: "/projects", icon: FolderOpen },
  { label: "Tasks", href: "/tasks", icon: ListChecks },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Search Console", href: "/search-console", icon: GoogleLogo },
  { label: "Settings", href: "/settings", icon: Gear },
];

export function AppSidebar({
  plan = "free",
}: {
  plan?: "free" | "pro" | "agency";
}) {
  const pathname = usePathname();
  const planLabel =
    plan === "pro" ? "Pro" : plan === "agency" ? "Agency" : "Free";
  const showUpgrade = plan === "free";

  return (
    <aside className="hidden md:flex shrink-0 w-[240px] flex-col border-r border-[color:var(--color-border)] bg-[color:var(--color-bg-2)] sticky top-0 h-[100dvh]">
      <div className="px-5 h-16 flex items-center border-b border-[color:var(--color-border)]">
        <Link href="/dashboard" aria-label="Dashboard">
          <Logo size="md" />
        </Link>
      </div>

      <Link
        href="/audit/new"
        className="btn-tactile mx-4 mt-5 inline-flex items-center justify-center gap-2 rounded-md bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] px-4 py-2.5 font-mono text-[11px] tracking-[0.16em] uppercase shadow-[0_4px_14px_-4px_rgb(255_26_110/_0.4)]"
      >
        <Sparkle size={13} weight="fill" />
        New audit
        <Plus size={13} weight="bold" />
      </Link>

      <nav className="px-3 mt-7 flex-1 flex flex-col gap-0.5">
        <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-fg-faint px-3 py-2">
          Workspace
        </div>
        {items.map(({ label, href, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-[13.5px] transition-colors",
                active
                  ? "bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent)]"
                  : "text-fg-muted hover:text-fg hover:bg-[color:var(--color-bg-3)]",
              )}
            >
              <Icon size={16} weight={active ? "fill" : "regular"} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[color:var(--color-border)] p-4">
        <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-fg-faint">
          Plan · {planLabel}
        </div>
        <Link
          href="/settings/billing"
          className="mt-2 block text-[12.5px] text-[color:var(--color-accent)] hover:underline"
        >
          {showUpgrade ? "Upgrade to Pro →" : "Manage billing →"}
        </Link>
      </div>
    </aside>
  );
}
