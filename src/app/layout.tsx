import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { SmoothScroll } from "@/components/smooth-scroll";
import { ScrollProgress } from "@/components/scroll-progress";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
  themeColor: "#f5f5f7",
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
          colorPrimary: "#1f6df0",
          colorBackground: "#f5f5f7",
          colorText: "#1d1d1f",
          colorTextSecondary: "#6e6e73",
          colorInputBackground: "#ffffff",
          colorInputText: "#1d1d1f",
          borderRadius: "8px",
          fontFamily: "var(--font-geist-sans)",
        },
        elements: {
          formButtonPrimary:
            "bg-[#1f6df0] hover:bg-[#1a78ff] text-white font-mono uppercase tracking-[0.14em] text-[12px]",
          card: "shadow-none border border-[rgb(29_29_31_/_0.08)]",
        },
      }}
    >
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
        <body className="min-h-[100dvh] bg-[color:var(--color-bg)] text-[color:var(--color-fg)] antialiased">
          <a
            href="#hero"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-[color:var(--color-accent)] focus:text-[color:var(--color-accent-fg)] focus:px-4 focus:py-2 focus:rounded-md focus:font-mono focus:text-[12px] focus:tracking-[0.14em] focus:uppercase"
          >
            Skip to content
          </a>
          <SmoothScroll />
          <ScrollProgress />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
