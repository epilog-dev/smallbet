import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const sizes = {
  hero: "text-[calc(2.5rem*var(--vp-display-scale))] leading-[1.08] sm:text-[calc(3.5rem*var(--vp-display-scale))] sm:leading-[1.06] lg:text-[calc(4.25rem*var(--vp-display-scale))] lg:leading-[1.04]",
  section: "text-[calc(1.9rem*var(--vp-display-scale))] leading-[1.15] sm:text-[calc(2.5rem*var(--vp-display-scale))]",
  sub: "text-[calc(1.25rem*var(--vp-display-scale))] sm:text-[calc(1.5rem*var(--vp-display-scale))] leading-snug",
};

export function Heading({
  as: Tag = "h2",
  size = "section",
  className,
  children,
}: {
  as?: "h1" | "h2" | "h3";
  size?: keyof typeof sizes;
  className?: string;
  children: ReactNode;
}) {
  return <Tag className={cn("vp-display text-vp-fg", sizes[size], className)}>{children}</Tag>;
}

/** Renders `text` with `highlight` wrapped in a quiet secondary tone (styled per preset via `.vp-highlight`). */
export function HighlightedText({ text, highlight }: { text: string; highlight?: string }) {
  if (!highlight || !text.includes(highlight)) return <>{text}</>;
  const [before, after] = text.split(highlight, 2);
  return (
    <>
      {before}
      <span className="vp-highlight">{highlight}</span>
      {after}
    </>
  );
}

export function Lead({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-[1.05rem] leading-relaxed text-vp-muted text-pretty sm:text-lg", className)}>{children}</p>;
}
