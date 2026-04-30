import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

export default function NotFound() {
  return (
    <main className="min-h-[100dvh] flex items-center justify-center px-6">
      <div className="max-w-xl w-full">
        <span className="eyebrow">
          <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
          404
        </span>
        <h1 className="font-display font-extrabold mt-5 text-[clamp(36px,5vw,60px)] leading-[1.05] tracking-[-0.025em]">
          Page not{" "}
          <span className="italic font-light text-fg-muted">found.</span>
        </h1>
        <p className="mt-5 text-fg-muted text-[16px] leading-[1.65]">
          The page you&rsquo;re looking for doesn&rsquo;t exist — or moved.
        </p>
        <Link
          href="/"
          className="btn-tactile mt-10 inline-flex items-center gap-2 rounded-md bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] px-5 py-3 font-mono text-[12px] uppercase tracking-[0.14em]"
        >
          <ArrowLeft size={14} weight="bold" />
          Back to home
        </Link>
      </div>
    </main>
  );
}
