"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import type {
  ButtonHTMLAttributes,
  AnchorHTMLAttributes,
  ReactNode,
} from "react";

type DragKeys =
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onDragEnter"
  | "onDragLeave"
  | "onDragOver"
  | "onDragExit"
  | "onAnimationStart";

type Common = {
  children: ReactNode;
  className?: string;
  strength?: number;
};

type ButtonProps = Common &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, DragKeys> & { as?: "button" };

type AnchorProps = Common &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, DragKeys> & {
    as: "a";
    href: string;
  };

type AnyMagneticProps = ButtonProps | AnchorProps;

export function Magnetic(props: AnyMagneticProps) {
  const merged = props as Common & {
    as?: "button" | "a";
    [key: string]: unknown;
  };
  const { children, className, strength = 6, as = "button", ...rest } = merged;

  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 200, damping: 18, mass: 0.4 });

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left - r.width / 2) / (r.width / 2);
    const py = (e.clientY - r.top - r.height / 2) / (r.height / 2);
    x.set(px * strength);
    y.set(py * (strength * 0.66));
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const motionStyle = reduce ? undefined : { x: sx, y: sy };

  if (as === "a") {
    return (
      <motion.a
        {...rest}
        onMouseMove={onMove}
        onMouseLeave={reset}
        style={motionStyle}
        className={className}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      {...rest}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={motionStyle}
      className={className}
    >
      {children}
    </motion.button>
  );
}
