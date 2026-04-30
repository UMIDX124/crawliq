import { cn } from "@/lib/cn";

export function Logo({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
  } as const;

  return (
    <span
      className={cn(
        "font-display font-extrabold tracking-tight select-none",
        sizes[size],
        className,
      )}
    >
      Crawl<span className="text-[color:var(--color-accent)]">IQ</span>
    </span>
  );
}
