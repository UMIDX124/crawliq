"use client";

import { useEffect, useRef, useState } from "react";
import {
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

type Props = {
  to: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
};

export function CountUp({
  to,
  duration = 1.6,
  suffix = "",
  prefix = "",
  decimals = 0,
  className,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, {
    stiffness: 65,
    damping: 22,
    mass: 0.6,
  });
  const display = useTransform(spring, (v) => {
    const value = decimals > 0 ? v.toFixed(decimals) : Math.round(v).toString();
    return `${prefix}${value}${suffix}`;
  });

  const [text, setText] = useState(`${prefix}0${suffix}`);

  useEffect(() => {
    if (!inView) return;
    mv.set(to);
    const unsub = display.on("change", (v) => setText(v));
    return () => unsub();
  }, [inView, to, mv, display, duration]);

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  );
}
