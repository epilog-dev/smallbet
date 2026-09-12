import { cn } from "@/lib/utils";

export interface AnswerExample {
  product: string;
  price: string;
  per: string;
  tier: string;
  answers: number;
  wouldPay: number;
  median: string;
  days: number;
  buckets: Array<{ label: string; price?: string; count: number; highlight?: boolean; no?: boolean }>;
  reasons: Array<{ kind: "yes" | "no"; text: string }>;
}

/** The thing a founder actually gets back: a number with the evidence under it. */
export function AnswerCard({ ex, className }: { ex: AnswerExample; className?: string }) {
  const max = Math.max(...ex.buckets.map((b) => b.count));
  const share = Math.round((ex.wouldPay / ex.answers) * 100);
  return (
    <div className={cn("rounded-xl border border-border bg-card p-5 text-left shadow-[0_24px_60px_-36px_rgba(0,0,0,0.3)] sm:p-6", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Defensible price · {ex.product}</p>
          <p className="mt-1 text-4xl font-semibold tracking-[-0.03em] tabular-nums">
            {ex.price}
            <span className="text-base font-normal text-muted-foreground">{ex.per}</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{ex.tier}</span> · the tier that maximises revenue
          </p>
        </div>
        <dl className="grid shrink-0 grid-cols-3 gap-4 text-right">
          <div>
            <dt className="text-[11px] text-muted-foreground">Answers</dt>
            <dd className="text-lg font-semibold tabular-nums">{ex.answers}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Would pay</dt>
            <dd className="text-lg font-semibold tabular-nums">{share}%</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Median</dt>
            <dd className="text-lg font-semibold tabular-nums">{ex.median}</dd>
          </div>
        </dl>
      </div>

      <ul className="mt-5 space-y-2">
        {ex.buckets.map((b) => (
          <li key={b.label} className="grid grid-cols-[9rem_1fr_2.5rem] items-center gap-3 text-sm">
            <span className={cn("truncate", b.no ? "text-muted-foreground" : "")}>
              {b.label}
              {b.price && <span className="text-muted-foreground"> · {b.price}</span>}
            </span>
            <span className="h-2.5 overflow-hidden rounded-[3px] bg-muted">
              <span className={cn("block h-full rounded-[3px]", b.no ? "bg-muted-foreground/40" : b.highlight ? "bg-foreground" : "bg-foreground/60")} style={{ width: `${(b.count / max) * 100}%` }} />
            </span>
            <span className="text-right text-xs tabular-nums text-muted-foreground">{b.count}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5 border-t border-border pt-4">
        <p className="text-[11px] text-muted-foreground">What they said</p>
        <ul className="mt-2 space-y-1.5">
          {ex.reasons.map((r, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", r.kind === "yes" ? "bg-emerald-500" : "bg-muted-foreground/60")} />
              <span className="text-muted-foreground">“{r.text}”</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-4 text-[11px] text-muted-foreground">Collected over {ex.days} days · illustrative</p>
    </div>
  );
}
