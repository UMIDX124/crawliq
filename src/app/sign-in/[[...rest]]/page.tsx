import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Logo } from "@/components/logo";

export const metadata = {
  title: "Sign in",
  description: "Sign in to CrawlIQ.",
};

export default function SignInPage() {
  return (
    <main className="min-h-[100dvh] grid lg:grid-cols-[1fr_1fr]">
      {/* left — form */}
      <div className="flex flex-col px-6 py-12 lg:px-14">
        <Link href="/" aria-label="Home">
          <Logo size="md" />
        </Link>
        <div className="flex-1 grid place-items-center">
          <div className="w-full max-w-[420px]">
            <span className="eyebrow">
              <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
              Welcome back
            </span>
            <h1 className="font-display font-extrabold mt-4 text-[clamp(28px,4vw,40px)] leading-[1.05] tracking-[-0.025em]">
              Sign in to CrawlIQ.
            </h1>
            <p className="mt-3 text-fg-muted text-[14.5px] leading-[1.6]">
              Pick up where you left off.
            </p>

            <div className="mt-9">
              <SignIn signUpUrl="/sign-up" forceRedirectUrl="/dashboard" />
            </div>
          </div>
        </div>
      </div>

      {/* right — copy panel (lg+) */}
      <aside className="hidden lg:flex flex-col justify-between border-l border-[color:var(--color-border)] bg-[color:var(--color-bg-2)] px-14 py-12">
        <div className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-fg-muted">
          crawliq · live audit
        </div>
        <div>
          <h2 className="font-display font-extrabold text-[clamp(32px,3.5vw,52px)] leading-[1.05] tracking-[-0.025em]">
            Five AI auditors{" "}
            <span className="italic font-light text-fg-muted">
              in your dashboard.
            </span>
          </h2>
          <p className="mt-6 text-fg-muted text-[15px] leading-[1.65] max-w-md">
            Every audit you run is saved to your project history. Schedule re-audits, track score trends, export white-label PDFs.
          </p>
        </div>
        <div className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-fg-faint">
          New here? <Link href="/sign-up" className="text-[color:var(--color-accent)] hover:underline">Create an account</Link>
        </div>
      </aside>
    </main>
  );
}
