import { AppTopbar } from "@/components/app/topbar";
import { requireUser } from "@/lib/auth-helpers";
import { CreditCard, User as UserIcon, Users, Key } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export const metadata = { title: "Settings" };

const sections = [
  {
    icon: UserIcon,
    title: "Profile",
    desc: "Name, avatar, email",
    href: "/settings/profile",
  },
  {
    icon: CreditCard,
    title: "Billing",
    desc: "Current plan, invoices, payment method",
    href: "/settings/billing",
  },
  {
    icon: Users,
    title: "Team",
    desc: "Invite members, manage seats and roles",
    href: "/settings/team",
  },
  {
    icon: Key,
    title: "API keys",
    desc: "Generate keys for programmatic access",
    href: "/settings/api",
  },
];

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <>
      <AppTopbar title="Settings" />
      <main className="flex-1 p-6 md:p-8 lg:p-10">
        <div className="max-w-4xl mx-auto">
          <span className="eyebrow">
            <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
            {user.email}
          </span>
          <h2 className="font-display font-extrabold mt-4 text-[clamp(28px,4vw,44px)] leading-[1.05] tracking-[-0.025em]">
            Settings.
          </h2>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sections.map(({ icon: Icon, title, desc, href }) => (
              <Link
                key={href}
                href={href}
                className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 hover:border-[color:var(--color-accent)] transition-colors"
              >
                <Icon
                  size={20}
                  weight="duotone"
                  className="text-[color:var(--color-accent)] mb-4"
                />
                <h3 className="font-display font-bold text-[15px]">{title}</h3>
                <p className="mt-1.5 text-[13px] text-fg-muted leading-[1.55]">
                  {desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
