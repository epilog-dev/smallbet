import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const sizes = {
  hero: "text-[2.5rem] leading-[1.08] sm:text-[3.25rem] sm:leading-[1.06] lg:text-[3.75rem] lg:leading-[1.05]",
  section: "text-[1.75rem] leading-[1.15] sm:text-[2.25rem]",
  sub: "text-xl sm:text-2xl leading-snug",
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

/** Renders `text` with `highlight` in the faint secondary tone (the grey second line in the reference). */
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
  return <p className={cn("text-[1.05rem] leading-relaxed text-vp-muted text-pretty sm:text-[1.1rem]", className)}>{children}</p>;
}
