import Link from "next/link";
import { Logo } from "@/components/logo";

const product = [
  { label: "Audit pillars", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Live demo", href: "#demo" },
  { label: "Pricing", href: "#pricing" },
];
const company = [
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Changelog", href: "/changelog" },
  { label: "Contact", href: "#cta" },
];
const legal = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cookie policy", href: "/cookies" },
];

export function Footer() {
  return (
    <footer className="border-t border-[color:var(--color-border)] bg-[color:var(--color-bg-2)] py-20">
      <div className="container-page">
        <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-12 md:gap-16">
          <div>
            <Logo size="lg" />
            <p className="mt-4 text-[14px] text-fg-muted leading-[1.65] max-w-[280px]">
              AI-powered website audits that read your site like an expert and
              tell you exactly what to fix and why.
            </p>
          </div>

          <FooterCol title="Product" links={product} />
          <FooterCol title="Company" links={company} />
          <FooterCol title="Legal" links={legal} />
        </div>

        <div className="mt-16 pt-7 border-t border-[color:var(--color-border)] flex flex-col md:flex-row md:items-center md:justify-between gap-4 font-mono text-[11px] tracking-[0.14em] uppercase text-fg-faint">
          <span>© {new Date().getFullYear()} CrawlIQ — All rights reserved</span>
          <span className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[color:var(--color-accent)] pulse-dot" />
            Powered by Groq · Next.js · Cheerio
          </span>
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
