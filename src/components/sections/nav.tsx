"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { List, X } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
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
  const [open, setOpen] = useState(false);
  const { isSignedIn } = useUser();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-[34px] z-40 transition-all duration-300",
        "border-b border-transparent",
        scrolled &&
          "border-[color:var(--color-border)] backdrop-blur-xl bg-bg/80",
      )}
      style={{
        backgroundColor: scrolled ? "rgb(14 22 32 / 0.85)" : "transparent",
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

        <div className="flex items-center gap-2 sm:gap-3">
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
                className="btn-tactile inline-flex items-center gap-2 bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] font-display font-bold text-[12px] tracking-wide uppercase px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-md focus-ring"
              >
                Get started
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-[color:var(--color-border-strong)] text-fg hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)] transition-colors focus-ring"
          >
            {open ? <X size={16} weight="bold" /> : <List size={16} weight="bold" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-drawer"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)]/95 backdrop-blur-xl"
          >
            <nav className="container-page py-6 flex flex-col gap-1">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="font-display font-medium text-[16px] text-fg py-3 border-b border-[color:var(--color-border)] last:border-b-0 hover:text-[color:var(--color-accent)] transition-colors"
                >
                  {link.label}
                </a>
              ))}
              {!isSignedIn && (
                <Link
                  href="/sign-in"
                  onClick={() => setOpen(false)}
                  className="font-mono text-[11px] tracking-[0.16em] uppercase text-fg-muted py-3 mt-2"
                >
                  Sign in
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
