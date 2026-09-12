"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { VpButton } from "../../primitives/Button";
import { Container, SectionShell } from "../../primitives/Container";
import type { SectionProps } from "../../types";
import { SectionHeader } from "../SectionHeader";
import { AfterChoice, AnsweredNote, NoPayLink, formatPrice, intervalLabel, usePricingIntent } from "./Widget";

/**
 * Price ladder: one connected container, tiers as columns divided by rules.
 * The highlighted tier is a tinted column with an accent top bar — no floating badge.
 */
export function PricingIntentTiers({ section, ctx }: SectionProps<"pricing-intent">) {
  const p = section.props;
  const w = usePricingIntent(p, ctx);
  const n = p.tiers.length;
  const cols = n === 1 ? "max-w-md" : n === 2 ? "max-w-3xl sm:grid-cols-2" : "sm:grid-cols-3";

  return (
    <SectionShell id={section.id}>
      <Container>
        <SectionHeader eyebrow="Pre-launch pricing" title={p.title} subtitle={p.subtitle} />
        <div className="relative mt-12">
          {(
            <>
              <div data-reveal className={cn("vp-ladder mx-auto grid divide-y divide-vp-border sm:divide-x sm:divide-y-0", cols)}>
                {p.tiers.map((t) => {
                  const hi = t.id === p.highlightedTierId;
                  const mine = w.answered?.tierId === t.id;
                  return (
                    <div
                      key={t.id}
                      className={cn(
                        "relative flex flex-col p-7 sm:p-8",
                        hi ? "bg-vp-surface-2 shadow-[inset_0_2px_0_0_var(--vp-accent)]" : "",
                        mine && "ring-2 ring-inset ring-vp-accent",
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="vp-display text-lg text-vp-fg">{t.name}</h3>
                        {hi && <span className="rounded-full bg-vp-accent-soft px-2 py-0.5 text-[11px] font-medium text-vp-accent-ink">Most likely</span>}
                      </div>
                      <p className="mt-1 text-sm text-vp-muted">{t.blurb}</p>
                      <p className="mt-6 flex items-baseline gap-1">
                        <span className="vp-display text-5xl text-vp-fg tabular-nums">{formatPrice(t.price, p.currency)}</span>
                        <span className="text-sm text-vp-muted">{intervalLabel(p.interval)}</span>
                      </p>
                      <ul className="mt-6 space-y-2.5 text-sm text-vp-fg/85">
                        {t.features.map((f, k) => (
                          <li key={k} className="flex gap-2.5">
                            <Check className="mt-0.5 size-4 shrink-0 text-vp-accent" strokeWidth={3} aria-hidden />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <div className="flex-1" />
                      <VpButton
                        variant={hi ? "primary" : "secondary"}
                        size="lg"
                        className="mt-8 w-full"
                        onClick={() => void w.choose("would_pay", t)}
                        disabled={w.busy}
                      >
                        {p.ctaLabel}
                      </VpButton>
                    </div>
                  );
                })}
              </div>
              <div data-reveal className="mt-8 text-center">
                <NoPayLink label={p.noPayLabel} onClick={() => void w.choose("would_not_pay")} />
                <AnsweredNote w={w} props={p} />
                {w.error && <p className="mt-3 text-sm vp-negative">{w.error}</p>}
              </div>
            </>
          )}
          <AfterChoice w={w} props={p} productName={ctx.doc.meta.productName} />
        </div>
      </Container>
    </SectionShell>
  );
}
