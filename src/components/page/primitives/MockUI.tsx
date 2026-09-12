import { cn } from "@/lib/utils";

export interface MockRow {
  label: string;
  value: string;
  tone: "neutral" | "positive" | "accent";
}

/** A stylised product window so hero visuals never need a real screenshot. */
export function MockUI({ title, rows, className }: { title?: string; rows?: MockRow[]; className?: string }) {
  const data = rows?.length
    ? rows
    : [
        { label: "This week", value: "+24%", tone: "positive" as const },
        { label: "Active", value: "1,284", tone: "neutral" as const },
        { label: "Queue", value: "12 pending", tone: "accent" as const },
        { label: "Status", value: "Healthy", tone: "positive" as const },
      ];
  const widths = [72, 56, 84, 64, 48];
  return (
    <div
      className={cn(
        "@container relative w-full overflow-hidden rounded-vp-xl border border-vp-border bg-vp-surface shadow-vp",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-vp-border bg-vp-surface-2/60 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-vp-fg/15" />
        <span className="size-2.5 rounded-full bg-vp-fg/15" />
        <span className="size-2.5 rounded-full bg-vp-fg/15" />
        <span className="ml-3 text-xs font-medium text-vp-muted">{title ?? "Dashboard"}</span>
      </div>
      <div className="grid @lg:grid-cols-[minmax(0,11rem)_1fr] gap-0">
        <aside className="hidden border-r border-vp-border p-3 @lg:block">
          <div className="mb-3 h-7 rounded-vp-sm bg-vp-accent-soft" />
          {widths.map((w, i) => (
            <div key={i} className="mb-2 h-2.5 rounded-full bg-vp-fg/8" style={{ width: `${w}%` }} />
          ))}
        </aside>
        <div className="p-4 sm:p-5">
          <div className="mb-4 h-3 w-1/3 rounded-full bg-vp-fg/10" />
          <div className="grid gap-2.5 @md:grid-cols-2">
            {data.map((r, i) => (
              <div key={i} className="flex items-center justify-between rounded-vp-md border border-vp-border bg-vp-bg/60 px-3.5 py-3">
                <span className="truncate text-xs font-medium text-vp-muted">{r.label}</span>
                <span
                  className={cn(
                    "ml-2 shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                    r.tone === "positive" && "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
                    r.tone === "accent" && "bg-vp-accent-soft text-vp-accent-ink",
                    r.tone === "neutral" && "bg-vp-fg/6 text-vp-fg",
                  )}
                >
                  {r.value}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex h-24 items-end gap-1.5">
            {[38, 52, 44, 66, 58, 74, 62, 84, 70, 92, 80, 96].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-sm bg-vp-accent/70" style={{ height: `${h}%`, opacity: 0.35 + (i / 12) * 0.65 }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Decorative alternative when no mock rows are wanted. */
export function AbstractVisual({ className }: { className?: string }) {
  return (
    <div className={cn("relative aspect-[4/3] w-full overflow-hidden rounded-vp-xl border border-vp-border bg-vp-surface-2", className)}>
      <div className="absolute -left-10 top-6 size-48 rounded-full bg-vp-accent/25 blur-2xl" />
      <div className="absolute right-6 top-10 size-40 rounded-full bg-vp-accent-soft blur-xl" />
      <div className="absolute inset-x-8 bottom-8 grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 rounded-vp-lg border border-vp-border bg-vp-surface/80 backdrop-blur" />
        ))}
      </div>
    </div>
  );
}
