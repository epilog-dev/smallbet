import { formatMoney, type PricingStats } from "@/lib/analytics/pricing-stats";
import type { ResponseRow } from "@/lib/db/responses";
import { cn } from "@/lib/utils";
import { DistributionChart } from "./DistributionChart";
import { ResponsesTable } from "./ResponsesTable";

const pct = (v: number | null) => (v === null ? "—" : `${Math.round(v * 100)}%`);
const per = (interval: string) => (interval === "month" ? "/mo" : interval === "year" ? "/yr" : "");

export function Dashboard({ stats, rows, tierNames, projectName, published }: { stats: PricingStats; rows: ResponseRow[]; tierNames: Record<string, string>; projectName: string; published: boolean }) {
  return (
    <div className="space-y-8">
      {/* headline numbers */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Views" value={String(stats.views)} hint={published ? "unique visitors per day" : "publish to start counting"} />
        <Stat label="Answers" value={String(stats.responses)} hint={stats.conversion === null ? "—" : `${pct(stats.conversion)} of visitors`} />
        <Stat label="Would pay" value={pct(stats.wouldPayShare)} hint={`${stats.wouldPay} of ${stats.responses}`} />
        <Stat label="Median stated price" value={stats.medianPrice === null ? "—" : `${formatMoney(stats.medianPrice, stats.currency)}${per(stats.interval)}`} hint="among people who'd pay" />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* distribution */}
        <section className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-sm font-medium">What people picked</h2>
            <span className="text-xs text-muted-foreground">{stats.responses} answers</span>
          </div>
          {stats.responses === 0 ? (
            <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">No answers yet</div>
          ) : (
            <DistributionChart buckets={stats.buckets} currency={stats.currency} interval={stats.interval} />
          )}
        </section>

        {/* signal + goal */}
        <div className="space-y-6">
          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-sm font-medium">Defensible price</h2>
            {stats.defensible ? (
              <>
                <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
                  {formatMoney(stats.defensible.price ?? 0, stats.currency)}
                  <span className="text-base font-normal text-muted-foreground">{per(stats.interval)}</span>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{stats.defensible.label}</span> — {stats.defensible.count} {stats.defensible.count === 1 ? "person" : "people"} picked it, the most
                  revenue of any tier.
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Appears once someone picks a price.</p>
            )}
            {stats.lowSample && stats.responses > 0 && (
              <p className="mt-3 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">Fewer than 10 answers — treat this as a hint, not a result.</p>
            )}
          </section>

          <section className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-medium">Goal</h2>
              <span className="text-xs text-muted-foreground">
                {stats.goal.daysLeft === null ? `${stats.goal.deadlineDays}-day window` : stats.goal.daysLeft > 0 ? `${stats.goal.daysLeft} days left` : "Window closed"}
              </span>
            </div>
            <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
              {stats.responses}
              <span className="text-base font-normal text-muted-foreground"> / {stats.goal.target} answers</span>
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div className={cn("h-full rounded-full bg-foreground transition-[width]")} style={{ width: `${stats.goal.pct}%` }} />
            </div>
          </section>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-medium">Answers</h2>
        <ResponsesTable rows={rows} tierNames={tierNames} projectName={projectName} />
      </section>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 truncate text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
