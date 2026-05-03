"use client";

import { useScroll, useTransform, motion } from "framer-motion";
import { useRef } from "react";
import { Reveal } from "@/components/reveal";
import { ReportEyebrow } from "@/components/glyph";
import {
  CheckCircle,
  WarningCircle,
  XCircle,
} from "@phosphor-icons/react";

export function PdfPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const tilt = useTransform(scrollYProgress, [0, 0.5, 1], [12, 0, -8]);
  const lift = useTransform(scrollYProgress, [0, 0.5, 1], [60, 0, -40]);
  const fade = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.6, 1, 1, 0.7]);

  return (
    <section ref={ref} className="relative py-20 sm:py-24 md:py-32 lg:py-40 overflow-hidden">
      <div className="container-page">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-16 lg:gap-24 items-center">
          <Reveal>
            <ReportEyebrow num="06">Deliverable</ReportEyebrow>
            <h2 className="font-display font-extrabold mt-5 text-balance text-[clamp(32px,5vw,56px)] leading-[1.05] tracking-[-0.025em]">
              A 12-page report{" "}
              <span className="italic font-normal text-[color:var(--color-fg)] [font-family:var(--font-serif)] tracking-[-0.01em]">
                your team can actually ship from.
              </span>
            </h2>
            <p className="mt-7 text-fg-muted text-[16px] leading-[1.7] max-w-xl">
              Every audit produces a white-label PDF: executive summary, scores
              by pillar, ranked findings with remediation steps, quick-wins
              page, methodology appendix. Drop your logo and brand color in
              settings, hand it to clients or stakeholders, get to work.
            </p>

            <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-3 max-w-md">
              {[
                "Executive summary",
                "Score per pillar",
                "Ranked findings list",
                "Quick wins page",
                "Methodology appendix",
                "White-label branding",
              ].map((label) => (
                <li
                  key={label}
                  className="flex items-center gap-2.5 text-[13.5px] text-fg-muted"
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[color:var(--color-accent)]" />
                  {label}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* PDF mockup with scroll-driven tilt */}
          <div
            className="relative"
            style={{ perspective: "1400px" }}
          >
            <motion.div
              style={{
                rotateY: tilt,
                rotateX: useTransform(scrollYProgress, [0, 0.5, 1], [4, 0, -2]),
                y: lift,
                opacity: fade,
                transformStyle: "preserve-3d",
              }}
              className="relative w-full aspect-[8.5/11] max-w-[460px] mx-auto"
            >
              <PdfPage />

              {/* page 2 floating behind */}
              <div
                className="absolute -right-8 top-12 w-[88%] aspect-[8.5/11] rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-layered-lg"
                style={{
                  transform: "translateZ(-30px) rotateZ(2deg)",
                }}
              >
                <div className="p-7 h-full">
                  <div className="font-mono text-[8px] tracking-[0.16em] uppercase text-fg-faint">
                    Page 2 / Findings
                  </div>
                  <div className="mt-3 space-y-2">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-1.5 rounded-full bg-[color:var(--color-bg-3)]"
                        style={{ width: `${60 + ((i * 17) % 35)}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PdfPage() {
  return (
    <div className="relative w-full h-full rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-layered-xl overflow-hidden">
      {/* header */}
      <div className="px-7 pt-7 flex items-start justify-between">
        <div>
          <div className="font-display font-extrabold text-[18px]">
            Crawl<span className="text-[color:var(--color-accent)]">IQ</span>
          </div>
          <div className="font-mono text-[8.5px] tracking-[0.16em] uppercase text-fg-faint mt-1">
            Audit · [your-client.com] · template
          </div>
        </div>
        <div className="text-right">
          <div className="font-display font-extrabold text-[34px] leading-none tabular-nums text-[color:var(--color-accent)]">
            ##
          </div>
          <div className="font-mono text-[8.5px] tracking-[0.14em] uppercase text-fg-faint mt-1">
            Score
          </div>
        </div>
      </div>

      <div className="mx-7 mt-5 h-px bg-[color:var(--color-border)]" />

      {/* exec summary */}
      <div className="px-7 mt-5">
        <div className="font-mono text-[7.5px] tracking-[0.16em] uppercase text-fg-faint mb-2">
          Executive summary
        </div>
        <div className="space-y-1.5">
          <div className="h-1 rounded-full bg-[color:var(--color-bg-3)] w-[94%]" />
          <div className="h-1 rounded-full bg-[color:var(--color-bg-3)] w-[88%]" />
          <div className="h-1 rounded-full bg-[color:var(--color-bg-3)] w-[72%]" />
        </div>
      </div>

      {/* scores grid */}
      <div className="px-7 mt-6">
        <div className="font-mono text-[7.5px] tracking-[0.16em] uppercase text-fg-faint mb-2">
          Scores by pillar
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {[
            { name: "On-Page" },
            { name: "Tech." },
            { name: "Content" },
            { name: "Off-Site" },
            { name: "Compet." },
          ].map((p) => (
            <div
              key={p.name}
              className="rounded p-2 bg-[color:var(--color-accent-soft)]"
            >
              <div className="font-display font-extrabold text-[14px] leading-none text-[color:var(--color-accent)] tabular-nums">
                ##
              </div>
              <div className="font-mono text-[6.5px] tracking-[0.14em] uppercase text-fg-muted mt-1">
                {p.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* findings preview */}
      <div className="px-7 mt-6">
        <div className="font-mono text-[7.5px] tracking-[0.16em] uppercase text-fg-faint mb-2">
          Top findings
        </div>
        <div className="space-y-2">
          <FindingMini
            sev="pass"
            label="Win — passing check on a routes group"
          />
          <FindingMini
            sev="pass"
            label="Win — schema or canonical integrity"
          />
          <FindingMini
            sev="warn"
            label="Warning — sub-threshold metric on N pages"
          />
          <FindingMini
            sev="crit"
            label="Critical — top-priority remediation item"
          />
        </div>
      </div>

      {/* footer */}
      <div className="absolute bottom-3 left-7 right-7 flex items-center justify-between font-mono text-[7px] tracking-[0.14em] uppercase text-fg-faint">
        <span>Page 1 / 12</span>
        <span>crawliq.ai</span>
      </div>
    </div>
  );
}

function FindingMini({
  sev,
  label,
}: {
  sev: "pass" | "warn" | "crit";
  label: string;
}) {
  const map = {
    pass: { Icon: CheckCircle, color: "var(--color-pass)" },
    warn: { Icon: WarningCircle, color: "var(--color-warn)" },
    crit: { Icon: XCircle, color: "var(--color-crit)" },
  } as const;
  const Icon = map[sev].Icon;
  return (
    <div className="flex items-center gap-2 text-[9.5px] text-fg">
      <Icon size={10} weight="fill" style={{ color: map[sev].color }} />
      <span className="truncate">{label}</span>
    </div>
  );
}
