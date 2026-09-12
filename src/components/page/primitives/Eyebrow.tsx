import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Eyebrow({ children, className, pill }: { children: ReactNode; className?: string; pill?: boolean }) {
  if (pill) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-vp-border bg-vp-surface/70 px-3.5 py-1.5 text-xs font-semibold text-vp-muted backdrop-blur",
          className,
        )}
      >
        <span aria-hidden className="size-1.5 rounded-full bg-vp-accent" />
        {children}
      </span>
    );
  }
  return <p className={cn("text-xs font-semibold uppercase tracking-[0.14em] text-vp-accent-ink", className)}>{children}</p>;
}
