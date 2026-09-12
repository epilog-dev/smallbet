import { cn } from "@/lib/utils";

type Kind = "bubble" | "arrow" | "sparkle" | "loop";

/** Hand-drawn ink doodles for editorial/playful presets. Purely decorative. */
export function Doodle({ kind, className }: { kind: Kind; className?: string }) {
  const common = { "aria-hidden": true, fill: "none", className: cn("pointer-events-none absolute", className) } as const;
  switch (kind) {
    case "bubble":
      return (
        <svg {...common} viewBox="0 0 48 42">
          <path d="M4 8c0-3 3-5 6-5h28c3 0 6 2 6 5v17c0 3-3 5-6 5H15l-8 7 1-7c-3 0-4-2-4-5z" stroke="currentColor" strokeWidth="2.5" />
          <path d="M15 17c3 3.5 15 3.5 18 0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...common} viewBox="0 0 80 76">
          <path d="M70 8C44 20 34 40 60 66" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M48 60l12 8 4-16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "sparkle":
      return (
        <svg {...common} viewBox="0 0 40 40">
          <path d="M20 3c1 9 5 15 17 17-12 2-16 8-17 17-1-9-5-15-17-17 12-2 16-8 17-17z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
      );
    case "loop":
      return (
        <svg {...common} viewBox="0 0 90 40">
          <path d="M4 30c14-24 30-30 36-18s-14 26-8 8 30-22 54-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
  }
}

/** Soft pastel blobs for the playful preset. */
export function Blob({ className }: { className?: string }) {
  return <div aria-hidden className={cn("pointer-events-none absolute rounded-full blur-3xl", className)} />;
}
