"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/cn";

const links = [
  { label: "Why CrawlIQ", href: "#problems" },
  { label: "How it works", href: "#how" },
  { label: "Audit pillars", href: "#features" },
  { label: "Live demo", href: "#demo" },
  { label: "Pricing", href: "#pricing" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const { isSignedIn } = useUser();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        "border-b border-transparent",
        scrolled &&
          "border-[color:var(--color-border)] backdrop-blur-xl bg-bg/80",
      )}
      style={{
        backgroundColor: scrolled ? "rgb(10 10 10 / 0.78)" : "transparent",
      }}
    >
      <div className="container-page flex h-16 items-center justify-between">
        <Link
          href="/"
          aria-label="CrawlIQ home"
          className="focus-ring rounded-md"
        >
          <Logo size="lg" />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[13px] text-fg-muted hover:text-fg transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="btn-tactile inline-flex items-center gap-2 bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] font-display font-bold text-[12px] tracking-wide uppercase px-4 py-2.5 rounded-md focus-ring"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="hidden sm:inline-flex text-[13px] text-fg-muted hover:text-fg transition-colors px-3 py-2"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="btn-tactile inline-flex items-center gap-2 bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] font-display font-bold text-[12px] tracking-wide uppercase px-4 py-2.5 rounded-md focus-ring"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
