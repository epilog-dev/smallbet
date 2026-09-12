import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const sizes = {
  hero: "text-[2.6rem] leading-[1.04] sm:text-6xl sm:leading-[1.02] lg:text-[4.25rem]",
  section: "text-3xl leading-[1.1] sm:text-[2.6rem]",
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

/** Renders `text` with `highlight` wrapped in a squiggle-underlined (or accent-coloured) span. */
export function HighlightedText({
  text,
  highlight,
  squiggle,
}: {
  text: string;
  highlight?: string;
  squiggle: boolean;
}) {
  if (!highlight || !text.includes(highlight)) return <>{text}</>;
  const [before, after] = text.split(highlight, 2);
  // A squiggle only works under a short run that stays on one line; longer highlights get accent colour instead.
  const useSquiggle = squiggle && highlight.trim().split(/\s+/).length <= 3;
  return (
    <>
      {before}
      <span className={cn("relative", useSquiggle ? "whitespace-nowrap" : "text-vp-accent")}>
        {highlight}
        {useSquiggle && (
          <svg
            className="squiggle absolute -bottom-[0.08em] left-0 h-[0.22em] w-full text-vp-accent"
            viewBox="0 0 220 14"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M3 8c26-9 52 5 79-1s52-8 79-1 39 7 56 2" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
        )}
      </span>
      {after}
    </>
  );
}

export function Lead({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-lg leading-relaxed text-vp-muted text-pretty", className)}>{children}</p>;
}
