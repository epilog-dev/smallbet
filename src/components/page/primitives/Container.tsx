import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** `lg` matches the rails (64rem); narrower sizes centre inside them. */
export function Container({ className, children, size = "lg" }: { className?: string; children: ReactNode; size?: "sm" | "md" | "lg" }) {
  return (
    <div className={cn("relative mx-auto w-full px-5 sm:px-8", { sm: "max-w-2xl", md: "max-w-3xl", lg: "max-w-5xl" }[size], className)}>
      {children}
    </div>
  );
}

/** Vertical rhythm + a hairline rule on top of every section after the hero. */
export function SectionShell({
  id,
  className,
  children,
  tight,
  rule = true,
}: {
  id: string;
  className?: string;
  children: ReactNode;
  tight?: boolean;
  rule?: boolean;
}) {
  return (
    <section
      id={id}
      data-section-id={id}
      className={cn("relative scroll-mt-14", rule && "border-t border-vp-border", tight ? "py-14 sm:py-20" : "py-20 sm:py-24", className)}
    >
      {children}
    </section>
  );
}
