"use client";

import { Check } from "lucide-react";
import { VpButton } from "../../primitives/Button";
import { Container, SectionShell } from "../../primitives/Container";
import type { SectionProps } from "../../types";
import { SectionHeader } from "../SectionHeader";
import { ConfirmPanel, DonePanel, FollowUpPanel, NoPayLink, formatPrice, intervalLabel, usePricingIntent } from "./Widget";

export function PricingIntentSinglePrice({ section, ctx }: SectionProps<"pricing-intent">) {
  const p = section.props;
  const w = usePricingIntent(p, ctx);
  const { step } = w;
  const tier = p.tiers.find((t) => t.id === p.highlightedTierId) ?? p.tiers[0];

  return (
    <SectionShell id={section.id} className="scroll-mt-16 bg-vp-surface-2/50">
      <Container size="md">
        <SectionHeader eyebrow="Pre-launch pricing" title={p.title} subtitle={p.subtitle} />
        <div className="mt-12 min-h-[20rem]">
          {step.name === "choose" && (
            <div data-reveal className="vp-ladder mx-auto grid max-w-3xl sm:grid-cols-[1fr_1.1fr]">
              <div className="bg-vp-accent p-8 text-vp-accent-fg sm:p-10">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] opacity-80">{tier.name}</p>
                <p className="mt-4 flex items-baseline gap-1">
                  <span className="vp-display text-6xl tabular-nums">{formatPrice(tier.price, p.currency)}</span>
                  <span className="text-base opacity-80">{intervalLabel(p.interval)}</span>
                </p>
                <p className="mt-3 text-sm opacity-85">{tier.blurb}</p>
              </div>
              <div className="p-8 sm:p-10">
                <ul className="space-y-3 text-[15px] text-vp-fg/85">
                  {tier.features.map((f, k) => (
                    <li key={k} className="flex gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-vp-accent" strokeWidth={3} aria-hidden />
                      {f}
                    </li>
                  ))}
                </ul>
                <VpButton size="lg" className="mt-8 w-full" onClick={() => w.choose("would_pay", tier)} disabled={w.busy}>
                  {p.ctaLabel}
                </VpButton>
                <div className="mt-4 text-center">
                  <NoPayLink label={p.noPayLabel} onClick={() => w.choose("would_not_pay")} />
                </div>
                {w.error && <p className="mt-3 text-center text-sm text-rose-600 dark:text-rose-300">{w.error}</p>}
              </div>
            </div>
          )}
          {step.name === "confirm" && (
            <ConfirmPanel
              kind={step.kind}
              tier={step.tier}
              props={p}
              busy={w.busy}
              error={w.error}
              onSubmit={(email) => w.send(step.kind, step.tier, email)}
              onBack={w.reset}
            />
          )}
          {step.name === "followup" && (
            <FollowUpPanel kind={step.kind} question={p.followUpQuestion} busy={w.busy} live={w.live} onSubmit={(t) => w.reason(step.responseId, t)} />
          )}
          {step.name === "done" && <DonePanel productName={ctx.doc.meta.productName} />}
        </div>
      </Container>
    </SectionShell>
  );
}
