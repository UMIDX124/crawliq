import { Suspense } from "react";
import { Nav } from "@/components/sections/nav";
import { AuditClient } from "@/app/audit/audit-client";

export const metadata = {
  title: "Live audit",
  description: "Real-time AI website audit results.",
};

export default function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}) {
  return (
    <>
      <Nav />
      <main className="pt-28 md:pt-32 pb-24 min-h-[100dvh]">
        <Suspense fallback={<AuditLoading />}>
          <AuditWrapper searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}

async function AuditWrapper({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}) {
  const { url } = await searchParams;
  return <AuditClient initialUrl={url ?? ""} />;
}

function AuditLoading() {
  return (
    <div className="container-page">
      <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-fg-muted">
        Loading audit…
      </div>
    </div>
  );
}
