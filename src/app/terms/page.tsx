import { Nav } from "@/components/sections/nav";
import { Footer } from "@/components/sections/footer";

export const metadata = {
  title: "Terms of service",
  description: "Terms governing your use of CrawlIQ.",
};

export default function TermsPage() {
  return (
    <>
      <Nav />
      <main className="pt-32 pb-24">
        <div className="container-page max-w-3xl">
          <span className="eyebrow">
            <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
            Legal
          </span>
          <h1 className="font-display font-extrabold mt-5 text-[clamp(36px,5vw,60px)] leading-[1.05] tracking-[-0.025em]">
            Terms of service
          </h1>
          <p className="mt-3 font-mono text-[11px] tracking-[0.16em] uppercase text-fg-muted">
            Last updated · placeholder before launch
          </p>

          <div className="mt-12 prose-policy">
            <h2>1. Acceptance</h2>
            <p>
              By using CrawlIQ you agree to these terms. If you do not agree,
              do not use the service.
            </p>

            <h2>2. The service</h2>
            <p>
              CrawlIQ provides AI-assisted website audits. We fetch publicly
              accessible HTML from URLs you submit and return analysis. We do
              not bypass paywalls, login screens, or robots.txt disallows.
            </p>

            <h2>3. Acceptable use</h2>
            <p>
              You agree not to: abuse rate limits, scrape our service in ways
              that disrupt availability, audit sites you have been explicitly
              forbidden from auditing, or use the output for harassment or
              illegal activity. We reserve the right to terminate accounts in
              violation.
            </p>

            <h2>4. Billing</h2>
            <p>
              Paid plans bill monthly or annually in advance. Cancel anytime
              from your account dashboard. Monthly plans stop billing at the
              next cycle. Annual plans are eligible for a pro-rated refund
              within the first 30 days.
            </p>

            <h2>5. AI accuracy</h2>
            <p>
              CrawlIQ&rsquo;s findings combine deterministic crawl data with
              AI inference. While we work hard to ground every finding in real
              signals, we make no guarantee about ranking outcomes from acting
              on findings. Use audits as advisory input alongside your own
              judgment.
            </p>

            <h2>6. Liability</h2>
            <p>
              To the fullest extent permitted by law, CrawlIQ&rsquo;s liability
              is limited to fees paid in the prior twelve months. We are not
              liable for indirect or consequential damages.
            </p>

            <h2>7. Changes</h2>
            <p>
              We may update these terms. Material changes will be communicated
              by email at least 30 days before taking effect.
            </p>

            <h2>8. Contact</h2>
            <p>Questions: legal@crawliq.ai</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
