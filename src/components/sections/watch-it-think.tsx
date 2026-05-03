"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/reveal";
import { ReportEyebrow } from "@/components/glyph";
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

// Each terminal shows the AGENT'S CHECK SEQUENCE — what the auditor does,
// not specific findings on a fake site. "fetching head…" / "scoring title-
// length…" reads as an instrument log, not a fake audit on northwood.com.
const agents: Agent[] = [
  {
    id: "on-page",
    Icon: MagnifyingGlass,
    name: "On-Page",
    lines: [
      "fetching index.html…",
      "parsing <head> meta…",
      "scoring title-length…",
      "scoring meta-desc length…",
      "validating heading hierarchy…",
      "scanning Open Graph + Twitter…",
      "measuring alt-text coverage…",
      "mapping internal-link depth…",
      "compiling on-page score",
    ],
  },
  {
    id: "technical",
    Icon: GearSix,
    name: "Technical",
    lines: [
      "resolving DNS…",
      "negotiating TLS…",
      "tracing redirect chain…",
      "measuring load time…",
      "fetching robots.txt…",
      "validating sitemap.xml…",
      "checking canonical integrity…",
      "scanning security headers…",
      "compiling technical score",
    ],
  },
  {
    id: "content",
    Icon: PencilLine,
    name: "Content",
    lines: [
      "tokenizing body text…",
      "running readability grade…",
      "detecting topical clusters…",
      "flagging thin pages…",
      "scanning duplicate sections…",
      "measuring content freshness…",
      "scoring E-E-A-T signals…",
      "comparing depth to competitors…",
      "compiling content score",
    ],
  },
  {
    id: "off-site",
    Icon: LinkSimple,
    name: "Off-Site",
    lines: [
      "querying backlink graph…",
      "counting referring domains…",
      "scoring median authority…",
      "measuring anchor variance…",
      "flagging toxic patterns…",
      "scanning brand mentions…",
      "checking NAP consistency…",
      "ranking outreach targets…",
      "compiling off-site score",
    ],
  },
  {
    id: "competitor",
    Icon: Target,
    name: "Competitor",
    lines: [
      "identifying SERP rivals…",
      "fetching rival sitemaps…",
      "diffing content depth…",
      "diffing backlink profiles…",
      "scoring keyword overlap…",
      "measuring moat strength…",
      "ranking content gaps…",
      "scoring threat level…",
      "compiling competitor score",
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
          <ReportEyebrow num="02">Watch the auditors think</ReportEyebrow>
          <h2 className="font-display font-extrabold mt-5 text-balance text-[clamp(32px,5vw,56px)] leading-[1.05] tracking-[-0.025em]">
            Five auditors. Five terminals.{" "}
            <span className="italic font-normal text-[color:var(--color-fg)] [font-family:var(--font-serif)] tracking-[-0.01em]">
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
      <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-[color:var(--color-border)] bg-[color:var(--color-bg-2)] min-w-0">
        <span className="w-2 h-2 rounded-full bg-[#ff5f57] shrink-0" />
        <span className="w-2 h-2 rounded-full bg-[#febc2e] shrink-0" />
        <span className="w-2 h-2 rounded-full bg-[#28c840] shrink-0" />
        <Icon
          size={12}
          weight="bold"
          className="ml-1.5 shrink-0 text-[color:var(--color-accent)]"
        />
        <span className="font-mono text-[10.5px] text-fg-muted truncate min-w-0">
          {agent.id}.agent
        </span>
        {done && score ? (
          <span className="ml-auto shrink-0 font-mono text-[9.5px] tracking-[0.1em] uppercase tabular-nums whitespace-nowrap px-1.5 py-0.5 rounded-full bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent)] animate-[fadein_300ms_ease-out_forwards]">
            {score}
          </span>
        ) : (
          <span className="ml-auto shrink-0 inline-block w-1.5 h-1.5 rounded-full bg-[color:var(--color-accent)] pulse-dot" />
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
