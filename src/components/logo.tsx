import { cn } from "@/lib/cn";
import { LogoMark } from "@/components/logo-mark";

export function Logo({
  className,
  size = "md",
  withMark = true,
}: {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  withMark?: boolean;
}) {
  const wordSize = {
    sm: "text-[18px]",
    md: "text-[22px]",
    lg: "text-[26px]",
    xl: "text-[30px]",
  }[size];

  const markSize = {
    sm: 28,
    md: 34,
    lg: 40,
    xl: 48,
  }[size];

  const gap = {
    sm: "gap-2",
    md: "gap-2.5",
    lg: "gap-3",
    xl: "gap-3.5",
  }[size];

  return (
    <span
      className={cn(
        "inline-flex items-center font-display font-extrabold tracking-[-0.02em] select-none",
        gap,
        wordSize,
        className,
      )}
    >
      {withMark && <LogoMark size={markSize} />}
      <span className="leading-none">
        Crawl<span className="text-[color:var(--color-accent)]">IQ</span>
      </span>
    </span>
  );
}
