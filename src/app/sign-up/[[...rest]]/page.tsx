import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Logo } from "@/components/logo";

export const metadata = {
  title: "Sign up",
  description: "Create your CrawlIQ account.",
};

export default function SignUpPage() {
  return (
    <main className="min-h-[100dvh] grid lg:grid-cols-[1fr_1fr]">
      <div className="flex flex-col px-6 py-12 lg:px-14">
        <Link href="/" aria-label="Home">
          <Logo size="md" />
        </Link>
        <div className="flex-1 grid place-items-center">
          <div className="w-full max-w-[420px]">
            <span className="eyebrow">
              <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
              Get started
            </span>
            <h1 className="font-display font-extrabold mt-4 text-[clamp(28px,4vw,40px)] leading-[1.05] tracking-[-0.025em]">
              Run your first audit{" "}
              <span className="italic font-light text-fg-muted">in 60 seconds.</span>
            </h1>
            <p className="mt-3 text-fg-muted text-[14.5px] leading-[1.6]">
              Free tier · no credit card · 3 audits / month
            </p>

            <div className="mt-9">
              <SignUp signInUrl="/sign-in" forceRedirectUrl="/dashboard" />
            </div>
          </div>
        </div>
      </div>

      <aside className="hidden lg:flex flex-col justify-between border-l border-[color:var(--color-border)] bg-[color:var(--color-bg-2)] px-14 py-12">
        <div className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-fg-muted">
          crawliq · live audit
        </div>
        <div>
          <h2 className="font-display font-extrabold text-[clamp(32px,3.5vw,52px)] leading-[1.05] tracking-[-0.025em]">
            Built for{" "}
            <span className="italic font-light text-fg-muted">
              operators, agencies, founders.
            </span>
          </h2>
          <ul className="mt-7 space-y-3.5">
            {[
              "240+ signal checks per audit",
              "5 AI auditors running in parallel",
              "PDF reports with your branding",
              "Project tracking + team seats",
            ].map((line) => (
              <li
                key={line}
                className="flex items-center gap-3 text-[14.5px] text-fg-muted"
              >
                <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)] flex-shrink-0" />
                {line}
              </li>
            ))}
          </ul>
        </div>
        <div className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-fg-faint">
          Already a member? <Link href="/sign-in" className="text-[color:var(--color-accent)] hover:underline">Sign in</Link>
        </div>
      </aside>
    </main>
  );
}
