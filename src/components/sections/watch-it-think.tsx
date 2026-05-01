"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/reveal";
import {
  MagnifyingGlass,
  GearSix,
  PencilLine,
  LinkSimple,
  Target,
} from "@phosphor-icons/react";

type Agent = {
  id: string;
  Icon: typeof MagnifyingGlass;
  name: string;
  lines: string[];
};

const agents: Agent[] = [
  {
    id: "on-page",
    Icon: MagnifyingGlass,
    name: "On-Page",
    lines: [
      "fetching index.html…",
      "parsing <head> meta…",
      "title: 78 chars (over 60 ✗)",
      "meta-desc: 142 chars ✓",
      "h1 count: 0 ✗ critical",
      "open-graph: complete ✓",
      "alt-text coverage: 87%",
      "internal links: 142",
      "score: 74 / 100",
    ],
  },
  {
    id: "technical",
    Icon: GearSix,
    name: "Technical",
    lines: [
      "resolving DNS…",
      "TLS handshake: TLS 1.3 ✓",
      "redirect chain: 3 hops ✗",
      "load time: 3.8s ✗",
      "html size: 412 KB",
      "robots.txt: present ✓",
      "sitemap.xml: 247 urls ✓",
      "canonical: missing on /blog/* ✗",
      "score: 58 / 100",
    ],
  },
  {
    id: "content",
    Icon: PencilLine,
    name: "Content",
    lines: [
      "tokenizing body text…",
      "word count: 1,840",
      "readability: grade 9.2 ✓",
      "topical clusters: 3 detected",
      "thin pages: 12 found ✗",
      "duplicate sections: 0 ✓",
      "freshness: avg 8 weeks",
      "E-E-A-T signals: strong",
      "score: 91 / 100",
    ],
  },
  {
    id: "off-site",
    Icon: LinkSimple,
    name: "Off-Site",
    lines: [
      "querying backlink graph…",
      "referring domains: 47",
      "median DA: 22 ✗ low",
      "anchor text variance: 0.74 ✓",
      "toxic links flagged: 12 ✗",
      "brand mentions: 184",
      "social signals: medium",
      "NAP consistency: 100% ✓",
      "score: 66 / 100",
    ],
  },
  {
    id: "competitor",
    Icon: Target,
    name: "Competitor",
    lines: [
      "identifying top 3 SERP rivals…",
      "[1] competitor-a.com",
      "[2] competitor-b.io",
      "[3] competitor-c.net",
      "content-gap: 8 keywords ✗",
      "backlink-gap: 124 domains ✗",
      "moat strength: 0.41",
      "threat: high",
      "score: 52 / 100",
    ],
  },
];

export function WatchItThink() {
  return (
    <section
      id="watch"
      className="relative py-20 sm:py-24 md:py-32 lg:py-36 bg-[color:var(--color-bg-2)]"
    >
      <div className="container-page">
        <Reveal className="max-w-3xl">
          <span className="eyebrow">
            <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
            Watch the auditors think
          </span>
          <h2 className="font-display font-extrabold mt-5 text-balance text-[clamp(32px,5vw,56px)] leading-[1.05] tracking-[-0.025em]">
            Five auditors. Five terminals.{" "}
            <span className="italic font-light text-fg-muted">
              All running in parallel.
            </span>
          </h2>
          <p className="mt-6 max-w-2xl text-fg-muted text-[16px] md:text-[17px] leading-[1.65]">
            Each AI auditor specializes in one dimension of website health. They
            don&rsquo;t take turns — they run simultaneously, finish in eight
            seconds, and merge into one prioritized action plan.
          </p>
        </Reveal>

        <div className="mt-16 md:mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {agents.map((a, i) => (
            <Reveal key={a.id} delay={i * 0.06} className="h-full">
              <Terminal agent={a} index={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Terminal({ agent, index }: { agent: Agent; index: number }) {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const startTyping = () => {
      if (reduce) {
        setVisibleLines(agent.lines);
        setDone(true);
        return;
      }
      const baseDelay = 200 + index * 140;
      const lineDelay = 240;
      agent.lines.forEach((line, i) => {
        setTimeout(() => {
          setVisibleLines((prev) => [...prev, line]);
          if (i === agent.lines.length - 1) {
            setTimeout(() => setDone(true), 200);
          }
        }, baseDelay + i * lineDelay);
      });
    };

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;
          startTyping();
        }
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [agent.lines, index]);

  const Icon = agent.Icon;
  const scoreLine = agent.lines.find((l) => l.startsWith("score:"));
  const score = scoreLine ? scoreLine.replace("score:", "").trim() : null;

  return (
    <div
      ref={ref}
      className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] overflow-hidden h-full flex flex-col"
    >
      {/* terminal bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[color:var(--color-border)] bg-[color:var(--color-bg-2)]">
        <span className="w-2 h-2 rounded-full bg-[#ff5f57]" />
        <span className="w-2 h-2 rounded-full bg-[#febc2e]" />
        <span className="w-2 h-2 rounded-full bg-[#28c840]" />
        <Icon
          size={13}
          weight="bold"
          className="ml-2 text-[color:var(--color-accent)]"
        />
        <span className="font-mono text-[11px] text-fg-muted">
          {agent.id}.agent
        </span>
        {done && score ? (
          <span className="ml-auto font-mono text-[10px] tracking-[0.14em] uppercase px-2 py-0.5 rounded-full bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent)] animate-[fadein_300ms_ease-out_forwards]">
            {score}
          </span>
        ) : (
          <span className="ml-auto inline-block w-1.5 h-1.5 rounded-full bg-[color:var(--color-accent)] pulse-dot" />
        )}
      </div>

      {/* output */}
      <div className="p-4 font-mono text-[11.5px] leading-[1.7] flex-1 min-h-[230px]">
        <div className="text-fg-faint mb-2">▷ {agent.name}</div>
        <div className="flex flex-col gap-0.5">
          {visibleLines.map((line, i) => (
            <Line key={i} line={line} isLast={i === visibleLines.length - 1} done={done} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Line({
  line,
  isLast,
  done,
}: {
  line: string;
  isLast: boolean;
  done: boolean;
}) {
  let color = "text-fg";
  if (line.includes("✗")) color = "text-[color:var(--color-crit)]";
  else if (line.includes("✓")) color = "text-[color:var(--color-pass)]";
  else if (line.startsWith("score:")) color = "text-[color:var(--color-accent)] font-bold";
  else if (line.includes("…")) color = "text-fg-muted";

  return (
    <div className={color}>
      {line}
      {isLast && !done && (
        <span className="inline-block w-[8px] h-[14px] -mb-[2px] ml-0.5 bg-[color:var(--color-accent)] animate-pulse" />
      )}
    </div>
  );
}
