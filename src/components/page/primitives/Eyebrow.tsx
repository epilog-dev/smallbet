import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Hero eyebrow. Its look is preset-driven (pill / label / bracket / sticker) via `.vp-eyebrow` CSS. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("vp-eyebrow", className)}>
      <span aria-hidden className="vp-eyebrow-dot size-1.5 rounded-full bg-vp-accent" />
      {children}
    </span>
  );
}

/** Small label above a section title. */
export function Label({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("vp-label", className)}>{children}</p>;
}
