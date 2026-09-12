import { ArrowUpRight, Calendar, Filter, House, Layers, Search, Settings, Sparkles, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MockRow {
  label: string;
  value: string;
  tone: "neutral" | "positive" | "accent";
}

const DEFAULT_ROWS: MockRow[] = [
  { label: "HubSpot", value: "65%", tone: "neutral" },
  { label: "Salesforce", value: "62%", tone: "neutral" },
  { label: "Attio", value: "47%", tone: "positive" },
  { label: "Pipedrive", value: "41%", tone: "neutral" },
  { label: "Zero", value: "28%", tone: "accent" },
];

const SERIES = [
  "M0 62 C 40 58, 70 50, 110 44 S 180 36, 230 34 S 300 30, 340 28",
  "M0 70 C 40 66, 80 60, 120 58 S 190 52, 240 46 S 300 44, 340 42",
  "M0 84 C 40 80, 80 74, 120 72 S 190 66, 240 62 S 300 58, 340 54",
  "M0 96 C 40 96, 80 92, 120 88 S 190 84, 240 80 S 300 78, 340 74",
];

/**
 * A dense analytics dashboard, drawn with real chrome (sidebar, filter chips, chart with
 * a tooltip, a ranked table) so a validation page never needs a screenshot.
 * `rows` become the table on the right; the chart is decorative.
 */
export function MockUI({ title, rows, className }: { title?: string; rows?: MockRow[]; className?: string }) {
  const data = (rows?.length ? rows : DEFAULT_ROWS).slice(0, 5);
  const heading = title ?? "Overview";
  return (
    <div
      className={cn(
        "@container relative w-full overflow-hidden rounded-vp-lg border border-vp-border bg-vp-bg text-left shadow-vp-frame",
        className,
      )}
      aria-hidden
    >
      <div className="grid @3xl:grid-cols-[11rem_1fr]">
        {/* sidebar */}
        <aside className="hidden border-r border-vp-border p-3 @3xl:block">
          <div className="flex items-center gap-2 rounded-vp-md border border-vp-border bg-vp-surface px-2 py-1.5">
            <span className="size-4 rounded-sm bg-vp-fg" />
            <span className="truncate text-[11px] font-medium text-vp-fg">Workspace</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 rounded-vp-md border border-vp-border bg-vp-surface px-2 py-1.5 text-[10px] text-vp-muted">
            <Search className="size-3" /> Quick actions
          </div>
          <p className="mt-4 px-1 text-[9px] font-medium uppercase tracking-wide text-vp-faint">Pages</p>
          <ul className="mt-1.5 space-y-0.5 text-[11px]">
            {[
              [House, "Overview", true],
              [Layers, "Prompts", false],
              [Tag, "Sources", false],
              [Sparkles, "Models", false],
              [Settings, "Settings", false],
            ].map(([Icon, label, active], i) => {
              const I = Icon as typeof House;
              return (
                <li
                  key={i}
                  className={cn("flex items-center gap-2 rounded-vp-sm px-2 py-1", active ? "bg-vp-surface-2 text-vp-fg" : "text-vp-muted")}
                >
                  <I className="size-3" /> {label as string}
                </li>
              );
            })}
          </ul>
        </aside>

        {/* main */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 overflow-hidden border-b border-vp-border px-3 py-2 text-[10px] text-vp-muted">
            {[
              [Filter, "All"],
              [Calendar, "Last 7 days"],
              [Tag, "All tags"],
              [Sparkles, "All models"],
            ].map(([Icon, label], i) => {
              const I = Icon as typeof Filter;
              return (
                <span key={i} className="inline-flex shrink-0 items-center gap-1 rounded-vp-sm border border-vp-border bg-vp-surface px-1.5 py-0.5">
                  <I className="size-2.5" /> {label as string}
                </span>
              );
            })}
            <span className="ml-auto hidden shrink-0 items-center gap-1 rounded-vp-sm border border-vp-border bg-vp-surface px-1.5 py-0.5 @xl:inline-flex">
              <ArrowUpRight className="size-2.5" /> Export
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 px-3 py-2 text-[10px]">
            <span className="flex items-center gap-1.5 text-vp-fg">
              <House className="size-3 text-vp-muted" /> {heading}
              <span className="text-vp-muted">· trending up 5.2% this month</span>
            </span>
            <span className="hidden text-vp-muted @xl:inline">
              Visibility <b className="font-medium text-vp-fg">3/14</b> · Sentiment <b className="font-medium text-vp-fg">2/14</b>
            </span>
          </div>

          <div className="grid gap-2 px-3 pb-3 @2xl:grid-cols-[1.2fr_1fr]">
            {/* chart card */}
            <div className="relative rounded-vp-md border border-vp-border bg-vp-surface p-2.5">
              <div className="flex gap-1 text-[10px]">
                <span className="rounded-vp-sm border border-vp-border-strong bg-vp-surface px-1.5 py-0.5 text-vp-fg">Visibility</span>
                <span className="px-1.5 py-0.5 text-vp-muted">Sentiment</span>
                <span className="px-1.5 py-0.5 text-vp-muted">Position</span>
              </div>
              <svg viewBox="0 0 340 110" className="mt-2 h-28 w-full overflow-visible">
                {[20, 45, 70, 95].map((y) => (
                  <line key={y} x1="0" x2="340" y1={y} y2={y} stroke="var(--vp-border)" strokeWidth="1" />
                ))}
                {SERIES.map((d, i) => (
                  <path
                    key={i}
                    d={d}
                    fill="none"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    stroke={
                      i === 0
                        ? "var(--vp-accent)"
                        : i === 1
                          ? "oklch(0.7 0.15 55)"
                          : i === 2
                            ? "oklch(0.7 0.14 163)"
                            : "var(--vp-fg-faint)"
                    }
                  />
                ))}
                <line x1="230" x2="230" y1="10" y2="100" stroke="var(--vp-border-strong)" strokeDasharray="2 3" />
              </svg>
              <div className="absolute right-3 top-9 hidden w-32 rounded-vp-md bg-[oklch(0.17_0_0)] p-2 text-[9px] text-white shadow-lg @xl:block">
                <p className="mb-1 font-medium">April 2025</p>
                {data.slice(0, 4).map((r, i) => (
                  <div key={i} className="flex items-center justify-between py-0.5">
                    <span className="flex items-center gap-1.5 text-white/80">
                      <span
                        className="size-1.5 rounded-full"
                        style={{ background: ["var(--vp-accent)", "oklch(0.7 0.15 55)", "oklch(0.7 0.14 163)", "oklch(0.75 0 0)"][i] }}
                      />
                      {r.label}
                    </span>
                    <span className="tabular-nums">{r.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-1 flex justify-between px-1 text-[9px] text-vp-faint">
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>
            </div>

            {/* table card */}
            <div className="rounded-vp-md border border-vp-border bg-vp-surface">
              <div className="flex items-start justify-between p-2.5">
                <div>
                  <p className="text-[11px] font-medium text-vp-fg">Ranking</p>
                  <p className="text-[9px] text-vp-muted">Compared with the field</p>
                </div>
                <span className="rounded-vp-sm border border-vp-border p-1 text-vp-muted">
                  <ArrowUpRight className="size-2.5" />
                </span>
              </div>
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="border-y border-vp-border text-left text-vp-muted">
                    <th className="px-2.5 py-1 font-normal">#</th>
                    <th className="py-1 font-normal">Name</th>
                    <th className="py-1 text-right font-normal">Value</th>
                    <th className="px-2.5 py-1 text-right font-normal">Δ</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((r, i) => (
                    <tr key={i} className="border-b border-vp-border last:border-0">
                      <td className="px-2.5 py-1.5 text-vp-faint tabular-nums">{i + 1}</td>
                      <td className="flex items-center gap-1.5 py-1.5 text-vp-fg">
                        <span className="size-3 rounded-sm border border-vp-border bg-vp-surface-2" />
                        <span className="truncate">{r.label}</span>
                      </td>
                      <td className="py-1.5 text-right tabular-nums text-vp-fg">{r.value}</td>
                      <td
                        className={cn(
                          "px-2.5 py-1.5 text-right tabular-nums",
                          r.tone === "positive" && "text-emerald-600 dark:text-emerald-400",
                          r.tone === "accent" && "text-vp-accent-ink",
                          r.tone === "neutral" && "text-vp-muted",
                        )}
                      >
                        {r.tone === "positive" ? "↗ 0.4" : r.tone === "accent" ? "↗ 0.2" : "↘ 0.1"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Quiet alternative when no product visual is wanted: a stack of empty ruled cards. */
export function AbstractVisual({ className }: { className?: string }) {
  return (
    <div className={cn("relative grid grid-cols-3 gap-2 rounded-vp-lg border border-vp-border bg-vp-bg p-3 shadow-vp-frame", className)} aria-hidden>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-32 rounded-vp-md border border-vp-border bg-vp-surface p-3">
          <div className="h-2 w-1/2 rounded-full bg-vp-surface-2" />
          <div className="mt-6 text-2xl font-semibold tabular-nums text-vp-fg">{["64%", "1.2k", "3/14"][i]}</div>
          <div className="mt-1 h-2 w-3/4 rounded-full bg-vp-surface-2" />
        </div>
      ))}
    </div>
  );
}
