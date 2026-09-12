import { ArrowUpRight, Bell, Calendar, Check, ChevronRight, Filter, House, Plus, Search, Settings, Tag } from "lucide-react";
import type { HeroVisual } from "@/lib/page-schema";
import { cn } from "@/lib/utils";

type Row = NonNullable<HeroVisual["rows"]>[number];

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

const DEFAULT_ROWS: Row[] = [
  { label: "Acme Ltd", value: "$4,200", tone: "positive" },
  { label: "Northwind", value: "$1,850", tone: "neutral" },
  { label: "Globex", value: "Overdue", tone: "accent" },
  { label: "Initech", value: "$920", tone: "neutral" },
  { label: "Umbrella", value: "$3,100", tone: "positive" },
];

const SERIES_COLORS = ["var(--vp-accent)", "oklch(0.7 0.15 55)", "oklch(0.7 0.14 163)", "var(--vp-fg-faint)"];

/** Deterministic, plausible-looking curve per series index. */
function seriesPath(i: number, n: number) {
  const base = 40 + i * (50 / Math.max(1, n));
  const pts = Array.from({ length: 7 }, (_, k) => {
    const x = k * (340 / 6);
    const wobble = Math.sin((k + i * 1.7) * 1.3) * 6;
    const y = base - k * (3.5 - i * 0.6) + wobble;
    return [x, Math.max(8, Math.min(104, y))] as const;
  });
  return pts.map(([x, y], k) => (k === 0 ? `M${x} ${y}` : `L${x} ${y}`)).join(" ");
}

const AXIS: Record<NonNullable<HeroVisual["axis"]>, string[]> = {
  months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  weeks: ["W1", "W2", "W3", "W4", "W5", "W6"],
  days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

function toneClass(t: Row["tone"]) {
  return t === "positive" ? "text-emerald-600 dark:text-emerald-400" : t === "accent" ? "text-vp-accent-ink" : "text-vp-muted";
}

function Pill({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-vp-sm border px-1.5 py-0.5 text-[10px]", active ? "border-vp-border-strong bg-vp-surface text-vp-fg" : "border-vp-border bg-vp-surface text-vp-muted")}>
      {children}
    </span>
  );
}

function Sidebar({ title, nav }: { title: string; nav: string[] }) {
  const icons = [House, Tag, Calendar, Bell, Settings, Search];
  return (
    <aside className="hidden border-r border-vp-border p-3 @3xl:block">
      <div className="flex items-center gap-2 rounded-vp-md border border-vp-border bg-vp-surface px-2 py-1.5">
        <span className="size-4 rounded-sm bg-vp-fg" />
        <span className="truncate text-[11px] font-medium text-vp-fg">{title}</span>
      </div>
      <div className="mt-3 flex items-center gap-1.5 rounded-vp-md border border-vp-border bg-vp-surface px-2 py-1.5 text-[10px] text-vp-muted">
        <Search className="size-3" /> Search
      </div>
      <ul className="mt-4 space-y-0.5 text-[11px]">
        {nav.slice(0, 6).map((label, i) => {
          const I = icons[i % icons.length];
          return (
            <li key={i} className={cn("flex items-center gap-2 rounded-vp-sm px-2 py-1", i === 0 ? "bg-vp-accent-soft text-vp-accent-ink" : "text-vp-muted")}>
              <I className="size-3" /> <span className="truncate">{label}</span>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

function Frame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("@container relative w-full overflow-hidden rounded-vp-lg border border-vp-border bg-vp-bg text-left shadow-vp-frame", className)} aria-hidden>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard: sidebar · filters · chart with legend · ranked table      */
/* ------------------------------------------------------------------ */

export function MockDashboard({ v }: { v: HeroVisual }) {
  const rows = (v.rows?.length ? v.rows : DEFAULT_ROWS).slice(0, 6);
  const title = v.title ?? "Overview";
  const nav = v.nav?.length ? v.nav : ["Overview", "Reports", "Customers", "Settings"];
  const tabs = v.tabs?.length ? v.tabs : ["Overview", "Trends"];
  const series = v.series?.length ? v.series : rows.slice(0, 3).map((r) => r.label);
  const axis = AXIS[v.axis ?? "months"];
  const headline = v.headline ?? `${title} · trending up this month`;
  const [action] = v.actions ?? ["Export"];
  const sortedRows = [...rows];

  return (
    <Frame>
      <div className="grid @3xl:grid-cols-[11rem_1fr]">
        <Sidebar title={title} nav={nav} />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 overflow-hidden border-b border-vp-border px-3 py-2">
            <Pill>
              <Filter className="size-2.5" /> All
            </Pill>
            <Pill>
              <Calendar className="size-2.5" /> Last 30 days
            </Pill>
            {nav[1] && (
              <Pill>
                <Tag className="size-2.5" /> All {nav[1].toLowerCase()}
              </Pill>
            )}
            <span className="ml-auto hidden @xl:inline-flex">
              <Pill>
                <ArrowUpRight className="size-2.5" /> {action}
              </Pill>
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 px-3 py-2 text-[10px]">
            <span className="flex min-w-0 items-center gap-1.5 text-vp-fg">
              <House className="size-3 shrink-0 text-vp-muted" /> <span className="truncate">{headline}</span>
            </span>
          </div>

          <div className="grid gap-2 px-3 pb-3 @2xl:grid-cols-[1.2fr_1fr]">
            <div className="relative rounded-vp-md border border-vp-border bg-vp-surface p-2.5">
              <div className="flex gap-1 text-[10px]">
                {tabs.slice(0, 3).map((t, i) => (
                  <span key={i} className={cn("rounded-vp-sm px-1.5 py-0.5", i === 0 ? "border border-vp-border-strong bg-vp-surface text-vp-fg" : "text-vp-muted")}>
                    {t}
                  </span>
                ))}
              </div>
              <svg viewBox="0 0 340 110" className="mt-2 h-28 w-full overflow-visible">
                {[20, 45, 70, 95].map((y) => (
                  <line key={y} x1="0" x2="340" y1={y} y2={y} stroke="var(--vp-border)" strokeWidth="1" />
                ))}
                {series.slice(0, 4).map((_, i) => (
                  <path key={i} d={seriesPath(i, series.length)} fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" stroke={SERIES_COLORS[i]} />
                ))}
                <line x1="226" x2="226" y1="10" y2="100" stroke="var(--vp-border-strong)" strokeDasharray="2 3" />
              </svg>
              <div className="absolute right-3 top-9 hidden w-32 rounded-vp-md bg-[oklch(0.17_0_0)] p-2 text-[9px] text-white shadow-lg @xl:block">
                <p className="mb-1 font-medium">{axis[4]}</p>
                {series.slice(0, 4).map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-0.5">
                    <span className="flex items-center gap-1.5 truncate text-white/80">
                      <span className="size-1.5 shrink-0 rounded-full" style={{ background: SERIES_COLORS[i] }} />
                      <span className="truncate">{s}</span>
                    </span>
                    <span className="tabular-nums">{[64, 52, 41, 28][i]}%</span>
                  </div>
                ))}
              </div>
              <div className="mt-1 flex justify-between px-1 text-[9px] text-vp-faint">
                {axis.map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-vp-muted">
                {series.slice(0, 4).map((s, i) => (
                  <span key={i} className="inline-flex items-center gap-1">
                    <span className="size-1.5 rounded-full" style={{ background: SERIES_COLORS[i] }} /> {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-vp-md border border-vp-border bg-vp-surface">
              <div className="flex items-start justify-between p-2.5">
                <div>
                  <p className="text-[11px] font-medium text-vp-fg">{nav[1] ?? "Ranking"}</p>
                  <p className="text-[9px] text-vp-muted">Top {sortedRows.length} this period</p>
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
                    <th className="px-2.5 py-1 text-right font-normal">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRows.map((r, i) => (
                    <tr key={i} className="border-b border-vp-border last:border-0">
                      <td className="px-2.5 py-1.5 text-vp-faint tabular-nums">{i + 1}</td>
                      <td className="py-1.5 text-vp-fg">
                        <span className="flex items-center gap-1.5">
                          <span className="size-3 shrink-0 rounded-sm border border-vp-border bg-vp-surface-2" />
                          <span className="truncate">{r.label}</span>
                        </span>
                      </td>
                      <td className={cn("px-2.5 py-1.5 text-right tabular-nums", toneClass(r.tone))}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* List: sidebar · queue of items · detail pane                          */
/* ------------------------------------------------------------------ */

export function MockList({ v }: { v: HeroVisual }) {
  const rows = (v.rows?.length ? v.rows : DEFAULT_ROWS).slice(0, 6);
  const title = v.title ?? "Inbox";
  const nav = v.nav?.length ? v.nav : ["Inbox", "Assigned", "Done", "Settings"];
  const tabs = v.tabs?.length ? v.tabs : ["Open", "Waiting", "Done"];
  const headline = v.headline ?? `${nav[0]} · ${rows.length} waiting`;
  const [action, action2] = v.actions ?? ["Assign"];
  const first = rows[0];

  return (
    <Frame>
      <div className="grid @3xl:grid-cols-[10rem_1fr]">
        <Sidebar title={title} nav={nav} />
        <div className="grid min-w-0 @xl:grid-cols-[1fr_1.1fr]">
          {/* queue */}
          <div className="border-r border-vp-border">
            <div className="flex items-center justify-between border-b border-vp-border px-3 py-2">
              <span className="truncate text-[11px] font-medium text-vp-fg">{headline}</span>
              <Pill>
                <Plus className="size-2.5" /> New
              </Pill>
            </div>
            <div className="flex gap-1 border-b border-vp-border px-3 py-1.5 text-[10px]">
              {tabs.slice(0, 3).map((t, i) => (
                <span key={i} className={cn("rounded-vp-sm px-1.5 py-0.5", i === 0 ? "border border-vp-border-strong bg-vp-surface text-vp-fg" : "text-vp-muted")}>
                  {t}
                </span>
              ))}
            </div>
            <ul>
              {rows.map((r, i) => (
                <li key={i} className={cn("flex items-center gap-2.5 border-b border-vp-border px-3 py-2 text-[10px] last:border-0", i === 0 && "bg-vp-surface-2")}>
                  <span className={cn("size-1.5 shrink-0 rounded-full", r.tone === "positive" ? "bg-emerald-500" : r.tone === "accent" ? "bg-vp-accent" : "bg-vp-fg-faint")} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-vp-fg">{r.label}</span>
                    <span className="block truncate text-[9px] text-vp-muted">{["2m ago", "14m ago", "1h ago", "3h ago", "Yesterday", "2d ago"][i]}</span>
                  </span>
                  <span className={cn("shrink-0 tabular-nums", toneClass(r.tone))}>{r.value}</span>
                  <ChevronRight className="size-3 shrink-0 text-vp-faint" />
                </li>
              ))}
            </ul>
          </div>
          {/* detail */}
          <div className="hidden min-w-0 p-3 @xl:block">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-[12px] font-medium text-vp-fg">{first?.label}</p>
                <p className="text-[9px] text-vp-muted">{tabs[0]} · assigned to you</p>
              </div>
              <span className={cn("shrink-0 rounded-vp-sm border border-vp-border bg-vp-surface px-1.5 py-0.5 text-[10px] tabular-nums", toneClass(first?.tone ?? "neutral"))}>{first?.value}</span>
            </div>
            <div className="mt-3 space-y-1.5">
              {[92, 70, 84, 55].map((w, i) => (
                <div key={i} className="h-2 rounded-full bg-vp-surface-2" style={{ width: `${w}%` }} />
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              {rows.slice(1, 5).map((r, i) => (
                <div key={i} className="rounded-vp-sm border border-vp-border bg-vp-surface px-2 py-1.5">
                  <p className="truncate text-[9px] text-vp-muted">{r.label}</p>
                  <p className={cn("text-[10px] tabular-nums", toneClass(r.tone))}>{r.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-vp-sm bg-vp-btn px-2 py-1 text-[10px] font-medium text-vp-btn-fg">
                <Check className="size-2.5" /> {action}
              </span>
              {action2 && <Pill>{action2}</Pill>}
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile: phone frame · status headline · cards · bottom tabs           */
/* ------------------------------------------------------------------ */

export function MockMobile({ v, className }: { v: HeroVisual; className?: string }) {
  const rows = (v.rows?.length ? v.rows : DEFAULT_ROWS).slice(0, 5);
  const title = v.title ?? "App";
  const nav = (v.nav?.length ? v.nav : ["Home", "Plan", "Shop", "Saved"]).slice(0, 4);
  const tabs = v.tabs?.length ? v.tabs : ["This week", "Saved"];
  const headline = v.headline ?? `${title} · today`;
  const [action] = v.actions ?? ["Add"];
  const icons = [House, Calendar, Tag, Bell];

  return (
    <div className={cn("mx-auto w-[260px] max-w-full", className)} aria-hidden>
      <div className="overflow-hidden rounded-[2rem] border border-vp-border-strong bg-vp-bg p-2 shadow-vp-frame">
        <div className="overflow-hidden rounded-[1.5rem] border border-vp-border bg-vp-surface">
          {/* status bar */}
          <div className="flex items-center justify-between px-5 pt-3 text-[10px] text-vp-fg">
            <span className="font-medium">9:41</span>
            <span className="mx-auto h-4 w-16 rounded-full bg-vp-fg" />
            <span className="flex items-center gap-1">
              <span className="h-2 w-3 rounded-[2px] border border-vp-fg" />
            </span>
          </div>
          <div className="px-4 pb-2 pt-3">
            <p className="text-[10px] text-vp-muted">{title}</p>
            <p className="mt-0.5 text-[13px] font-semibold leading-tight text-vp-fg">{headline}</p>
            <div className="mt-2.5 flex gap-1 text-[10px]">
              {tabs.slice(0, 3).map((t, i) => (
                <span key={i} className={cn("rounded-full px-2 py-0.5", i === 0 ? "bg-vp-accent text-vp-accent-fg" : "bg-vp-surface-2 text-vp-muted")}>
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-1.5 px-3 pb-3">
            {rows.map((r, i) => (
              <div key={i} className="flex items-center gap-2.5 rounded-vp-md border border-vp-border bg-vp-bg px-2.5 py-2">
                <span className={cn("size-7 shrink-0 rounded-vp-sm", i % 3 === 0 ? "bg-vp-accent-soft" : "bg-vp-surface-2")} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[11px] font-medium text-vp-fg">{r.label}</span>
                  <span className="block truncate text-[9px] text-vp-muted">{["Ready", "Needs you", "Planned", "Done", "Later"][i]}</span>
                </span>
                <span className={cn("shrink-0 text-[10px] tabular-nums", toneClass(r.tone))}>{r.value}</span>
              </div>
            ))}
            <div className="flex justify-center pt-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-vp-btn px-3 py-1.5 text-[10px] font-medium text-vp-btn-fg">
                <Plus className="size-3" /> {action}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-4 border-t border-vp-border px-2 py-2 text-[8px] text-vp-muted">
            {nav.map((n, i) => {
              const I = icons[i % icons.length];
              return (
                <span key={i} className={cn("flex flex-col items-center gap-0.5", i === 0 && "text-vp-fg")}>
                  <I className="size-3.5" /> <span className="truncate">{n}</span>
                </span>
              );
            })}
          </div>
          <div className="mx-auto mb-1.5 h-1 w-20 rounded-full bg-vp-fg/60" />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

/** Quiet alternative when no product visual is wanted: a stack of ruled cards. */
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

/** Picks the frame for a visual. */
export function ProductVisual({ v, className }: { v: HeroVisual; className?: string }) {
  switch (v.kind) {
    case "none":
      return null;
    case "abstract":
      return <AbstractVisual className={className} />;
    case "list":
      return (
        <div className={className}>
          <MockList v={v} />
        </div>
      );
    case "mobile":
      return <MockMobile v={v} className={className} />;
    case "dashboard":
    default:
      return (
        <div className={className}>
          <MockDashboard v={v} />
        </div>
      );
  }
}
