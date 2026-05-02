import { Nav } from "@/components/sections/nav";
import { Footer } from "@/components/sections/footer";

export const metadata = {
  title: "Privacy policy",
  description: "How CrawlIQ handles your data.",
};

export default function PrivacyPage() {
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
            Privacy policy
          </h1>
          <p className="mt-3 font-mono text-[11px] tracking-[0.16em] uppercase text-fg-muted">
            Last updated · pre-launch draft
          </p>

          <div className="mt-12 prose-policy">
            <h2>1. What we collect</h2>
            <p>
              When you submit a URL for audit, we collect: the URL you submit,
              the IP address that sent the request (for rate-limiting), and the
              email address you provide if you request a full report.
            </p>
            <p>
              We do not collect cookies for tracking. We do not embed
              third-party trackers. Analytics, when present, are server-side and
              IP-anonymized.
            </p>

            <h2>2. What we do with it</h2>
            <p>
              The submitted URL is fetched once via our crawler. The HTML is
              passed to our AI auditor (Groq) for analysis. The resulting
              findings are returned to you and, on Pro and Agency plans, stored
              in your account history.
            </p>
            <p>
              Email addresses are used only to deliver the audit report and any
              account-related transactional messages. We never sell, share, or
              rent emails.
            </p>

            <h2>3. Data retention</h2>
            <p>
              Free-tier audits are not retained beyond the session. Pro and
              Agency audit history is retained for the lifetime of the account
              plus 30 days after cancellation, after which it is permanently
              deleted.
            </p>

            <h2>4. AI providers</h2>
            <p>
              We use Groq Cloud for AI inference. Crawled HTML is transmitted
              to Groq under their data-processing agreement. Groq does not
              retain the inputs after the request completes.
            </p>

            <h2>5. Your rights</h2>
            <p>
              You can request export or deletion of your data at any time by
              emailing privacy@crawliq.ai. Requests are processed within 30
              days, in line with GDPR / CCPA standards.
            </p>

            <h2>6. Contact</h2>
            <p>
              Questions about this policy: privacy@crawliq.ai
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
