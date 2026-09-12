"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container, SectionShell } from "../../primitives/Container";
import type { SectionProps } from "../../types";
import { SectionHeader } from "../SectionHeader";
import { AfterChoice, AnsweredNote, formatPrice, intervalLabel, usePricingIntent } from "./Widget";

/**
 * One product, one question: which of these prices would you pay?
 * No plans to compare — the visitor's pick *is* the data point. "Wouldn't pay" is an
 * equal-weight option, not a footnote, so the would-pay share isn't inflated.
 */
export function PricingIntentPriceLadder({ section, ctx }: SectionProps<"pricing-intent">) {
  const p = section.props;
  const w = usePricingIntent(p, ctx);
  const what = p.whatYouGet?.length ? p.whatYouGet : (p.tiers.find((t) => t.id === p.highlightedTierId) ?? p.tiers[0]).features;
  const per = p.interval === "month" ? "per month" : p.interval === "year" ? "per year" : "one-time";
  const { responses } = ctx.stats;

  return (
    <SectionShell id={section.id}>
      <Container size="md">
        <SectionHeader eyebrow="Pre-launch pricing" title={p.title} subtitle={p.subtitle} />
        {/* relative: the dialog anchors to this box inside preview frames */}
        <div className="relative mt-12">
          <div data-reveal className="vp-ladder mx-auto max-w-2xl overflow-hidden">
              {/* what they're pricing */}
              <div className="border-b border-vp-border bg-vp-surface-2/60 p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-vp-muted">{ctx.doc.meta.productName}</p>
                <p className="vp-display mt-1.5 text-xl text-vp-fg">{ctx.doc.meta.tagline}</p>
                {what.length > 0 && (
                  <ul className="mt-4 grid gap-2 text-sm text-vp-fg/85 sm:grid-cols-2">
                    {what.map((f, k) => (
                      <li key={k} className="flex gap-2.5">
                        <Check className="mt-0.5 size-4 shrink-0 text-vp-accent" strokeWidth={3} aria-hidden />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* the ladder */}
              <div className="p-6 sm:p-8">
                <p className="text-sm font-semibold text-vp-fg">
                  What would you pay for this, <span className="text-vp-muted">{per}</span>?
                </p>
                <div className={cn("mt-4 grid gap-2", p.tiers.length <= 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3 sm:grid-cols-5")} role="group" aria-label="Price options">
                  {p.tiers.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      disabled={w.busy}
                      aria-pressed={w.answered?.tierId === t.id}
                      onClick={() => void w.choose("would_pay", t)}
                      className={cn(
                        "group/opt flex h-16 flex-col items-center justify-center rounded-vp-md border transition-[transform,background-color,border-color,color] hover:-translate-y-0.5 hover:border-vp-accent hover:bg-vp-accent hover:text-vp-accent-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vp-accent focus-visible:ring-offset-2 focus-visible:ring-offset-vp-bg active:translate-y-0 disabled:opacity-60",
                        w.answered?.tierId === t.id ? "border-vp-accent bg-vp-accent text-vp-accent-fg" : "border-vp-border-strong bg-vp-surface text-vp-fg",
                      )}
                    >
                      <span className="vp-display text-xl tabular-nums sm:text-2xl">{formatPrice(t.price, p.currency)}</span>
                      <span className="text-[11px] opacity-70">{intervalLabel(p.interval).trim()}</span>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={w.busy}
                  aria-pressed={w.answered?.kind === "would_not_pay"}
                  onClick={() => void w.choose("would_not_pay")}
                  className={cn(
                    "mt-2 flex h-12 w-full items-center justify-center rounded-vp-md border border-dashed text-sm font-medium transition-colors hover:border-vp-fg hover:text-vp-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vp-accent focus-visible:ring-offset-2 focus-visible:ring-offset-vp-bg disabled:opacity-60",
                    w.answered?.kind === "would_not_pay" ? "border-vp-fg text-vp-fg" : "border-vp-border-strong text-vp-muted",
                  )}
                >
                  {p.noPayLabel}
                </button>
                {w.answered ? (
                  <AnsweredNote w={w} props={p} />
                ) : (
                  <p className="mt-4 text-center text-xs text-vp-muted">
                    {responses > 0 ? `${responses} ${responses === 1 ? "person has" : "people have"} answered · ` : ""}Nothing is charged. You&apos;ll see how others answered next.
                  </p>
                )}
                {w.error && <p className="mt-3 text-center text-sm vp-negative">{w.error}</p>}
              </div>
            </div>
          <AfterChoice w={w} props={p} productName={ctx.doc.meta.productName} />
        </div>
      </Container>
    </SectionShell>
  );
}
