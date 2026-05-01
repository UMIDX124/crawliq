"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

type Word = string | { italic: string };

export function KineticHeading({
  words,
  className = "",
  delayBase = 0.05,
}: {
  words: Word[];
  className?: string;
  delayBase?: number;
}) {
  return (
    <h1 className={className}>
      {words.map((w, i) => {
        const text = typeof w === "string" ? w : w.italic;
        const isItalic = typeof w !== "string";
        return (
          <span key={i} className="inline-block whitespace-nowrap">
            {text.split("").map((ch, j) => (
              <motion.span
                key={`${i}-${j}`}
                initial={{ opacity: 0, y: "0.55em" }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.55,
                  ease: [0.16, 1, 0.3, 1],
                  delay: delayBase + (i * 0.04 + j * 0.012),
                }}
                className={
                  isItalic
                    ? "inline-block italic font-normal text-[color:var(--color-fg)] [font-family:var(--font-serif)] tracking-[-0.01em]"
                    : "inline-block"
                }
              >
                {ch === " " ? " " : ch}
              </motion.span>
            ))}
            {i < words.length - 1 && <span>&nbsp;</span>}
          </span>
        );
      })}
    </h1>
  );
}

export function FadeChildren({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
