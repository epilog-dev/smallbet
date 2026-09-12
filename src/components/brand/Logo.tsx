import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * smallbet mark: a single poker chip — the smallest stake you can put down.
 * Monochrome, drawn in `currentColor`, so it follows whatever text colour it sits in.
 * Outer ring is dashed into six edge notches; inner disc is the chip's inlay.
 */
export function SmallbetMark({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={cn("size-4 shrink-0", className)} {...props}>
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="3" strokeDasharray="6.95 3" strokeDashoffset="1.5" />
      <circle cx="12" cy="12" r="3.75" fill="currentColor" />
    </svg>
  );
}

/** Mark + wordmark, used in headers. */
export function SmallbetLogo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <SmallbetMark className={markClassName} />
      smallbet
    </span>
  );
}
