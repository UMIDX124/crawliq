import Link from "next/link";
import { Logo } from "@/components/logo";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";

const product = [
  { label: "Audit pillars", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Live demo", href: "#demo" },
  { label: "Pricing", href: "#pricing" },
];
const company = [
  { label: "Why CrawlIQ", href: "#why" },
  { label: "Comparisons", href: "#comparison" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#cta" },
];
const legal = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export function Footer() {
  return (
    <footer className="border-t border-[color:var(--color-border)] bg-[color:var(--color-bg-2)] py-14 sm:py-16 md:py-20">
      <div className="container-page">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-[2fr_1fr_1fr_1fr] gap-y-10 gap-x-8 md:gap-x-12 lg:gap-x-16">
          <div className="col-span-2 sm:col-span-3 md:col-span-1">
            <Logo size="lg" />
            <p className="mt-4 text-[14px] text-fg-muted leading-[1.65] max-w-[280px]">
              AI-powered website audits that read your site like an expert and
              tell you exactly what to fix and why.
            </p>
            {process.env.NEXT_PUBLIC_STATUS_URL && (
              <a
                href={process.env.NEXT_PUBLIC_STATUS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-1.5 hover:border-[color:var(--color-accent)] transition-colors"
              >
                <CheckCircle
                  size={13}
                  weight="fill"
                  className="text-[color:var(--color-pass)]"
                />
                <span className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-fg-muted">
                  All systems operational
                </span>
              </a>
            )}
          </div>

          <FooterCol title="Product" links={product} />
          <FooterCol title="Company" links={company} />
          <FooterCol title="Legal" links={legal} />
        </div>

        <div className="mt-16 pt-7 border-t border-[color:var(--color-border)] flex flex-col gap-5 md:flex-row md:items-center md:justify-between font-mono text-[11px] tracking-[0.14em] uppercase text-fg-faint">
          <div className="flex flex-col sm:flex-row sm:items-center gap-x-5 gap-y-2">
            <span>© {new Date().getFullYear()} CrawlIQ</span>
            <span className="hidden sm:inline text-fg-faint/40">·</span>
            <span className="text-fg-muted normal-case tracking-normal text-[11.5px]">
              Your audit data stays in your account. We don&rsquo;t sell it.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link
              href="/privacy"
              className="text-fg-muted hover:text-fg transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-fg-muted hover:text-fg transition-colors"
            >
              Terms
            </Link>
            <span className="text-fg-faint/70">
              build {(process.env.VERCEL_GIT_COMMIT_SHA ?? "local").slice(0, 7)}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-fg-muted mb-5">
        {title}
      </div>
      <ul className="flex flex-col gap-3">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-[14px] text-fg-muted hover:text-fg transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
