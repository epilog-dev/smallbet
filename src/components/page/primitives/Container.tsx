import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Container({ className, children, size = "lg" }: { className?: string; children: ReactNode; size?: "sm" | "md" | "lg" }) {
  return (
    <div className={cn("mx-auto w-full px-5 sm:px-8", { sm: "max-w-2xl", md: "max-w-4xl", lg: "max-w-6xl" }[size], className)}>
      {children}
    </div>
  );
}

/** Vertical rhythm + reveal hook for every section. */
export function SectionShell({
  id,
  className,
  children,
  tight,
}: {
  id: string;
  className?: string;
  children: ReactNode;
  tight?: boolean;
}) {
  return (
    <section id={id} data-section-id={id} className={cn("relative", tight ? "py-14 sm:py-20" : "py-20 sm:py-28", className)}>
      {children}
    </section>
  );
}
