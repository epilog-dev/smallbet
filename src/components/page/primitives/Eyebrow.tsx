import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Small pill above the headline, "● We are hiring" style. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-vp-border-strong bg-vp-surface px-3 py-1 text-[13px] font-medium text-vp-fg shadow-[0_1px_0_oklch(0_0_0/0.03)]",
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-vp-accent" />
      {children}
    </span>
  );
}

/** Small label above a section title. */
export function Label({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("vp-label", className)}>{children}</p>;
}

/** Inline metric chip used inside the hero subhead ("through key metrics like [Visibility]"). */
export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="vp-chip">
      <span aria-hidden className="size-1.5 rounded-sm bg-vp-accent" />
      {children}
    </span>
  );
}
