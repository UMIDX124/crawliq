import type { Metadata, Viewport } from "next";
import { Figtree, Geist_Mono, Instrument_Serif } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { SmoothScroll } from "@/components/smooth-scroll";
import { ScrollProgress } from "@/components/scroll-progress";
import { GlobalAuditCursor } from "@/components/global-audit-cursor";

// Figtree — chosen for its slightly geometric character, distinct from the
// universal Geist/Inter on every other SaaS landing.
const figtree = Figtree({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

// Instrument Serif — italic-only display serif used as the editorial "voice"
// for accent words in headlines. Pairs against Figtree's grotesque baseline
// to give the page a magazine-pull-quote feel rather than washed-out italics.
const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic", "normal"],
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://crawliq.ai";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CrawlIQ — AI Website Audit. In Seconds.",
    template: "%s · CrawlIQ",
  },
  description:
    "Paste any URL. CrawlIQ's five AI auditors crawl your site, find every SEO, performance, and technical issue — then tell you exactly how to fix it.",
  keywords: [
    "AI website audit",
    "SEO audit",
    "technical SEO",
    "site crawler",
    "Core Web Vitals",
    "Groq AI",
  ],
  authors: [{ name: "CrawlIQ" }],
  openGraph: {
    type: "website",
    siteName: "CrawlIQ",
    title: "CrawlIQ — AI Website Audit. In Seconds.",
    description:
      "AI-powered website audits that tell you what's broken and exactly how to fix it.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "CrawlIQ — AI Website Audit. In Seconds.",
    description:
      "Paste any URL. Get a full AI audit in under 10 seconds.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#EFE5D0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider
      afterSignOutUrl="/"
      appearance={{
        variables: {
          colorPrimary: "#FF5E1A",
          colorBackground: "#F8EFD8",
          colorText: "#1A1612",
          colorTextSecondary: "#5C544A",
          colorInputBackground: "#EFE5D0",
          colorInputText: "#1A1612",
          borderRadius: "8px",
          fontFamily: "var(--font-geist-sans)",
        },
        elements: {
          formButtonPrimary:
            "bg-[#FF5E1A] hover:bg-[#E84F0F] text-white font-mono uppercase tracking-[0.14em] text-[12px]",
          card: "shadow-none border border-[rgb(26_22_18_/_0.10)] bg-[#FAF6EE]",
        },
      }}
    >
      <html lang="en" className={`${figtree.variable} ${geistMono.variable} ${instrumentSerif.variable}`}>
        <body className="min-h-[100dvh] bg-[color:var(--color-bg)] text-[color:var(--color-fg)] antialiased">
          <a
            href="#hero"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-[color:var(--color-accent)] focus:text-[color:var(--color-accent-fg)] focus:px-4 focus:py-2 focus:rounded-md focus:font-mono focus:text-[12px] focus:tracking-[0.14em] focus:uppercase"
          >
            Skip to content
          </a>
          <SmoothScroll />
          <ScrollProgress />
          <GlobalAuditCursor />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
