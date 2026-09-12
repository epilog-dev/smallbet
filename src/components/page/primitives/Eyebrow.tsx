import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Small, quiet pill above the headline ("For product teams shipping from Figma"). */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-vp-border bg-vp-surface px-3 py-1.5 text-xs font-medium text-vp-muted",
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
