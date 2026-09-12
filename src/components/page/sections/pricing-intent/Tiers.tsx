"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { VpButton } from "../../primitives/Button";
import { Container, SectionShell } from "../../primitives/Container";
import type { SectionProps } from "../../types";
import { SectionHeader } from "../SectionHeader";
import { ConfirmPanel, DonePanel, FollowUpPanel, NoPayLink, formatPrice, intervalLabel, usePricingIntent } from "./Widget";

export function PricingIntentTiers({ section, ctx }: SectionProps<"pricing-intent">) {
  const p = section.props;
  const w = usePricingIntent(p, ctx);
  const { step } = w;
  const cols = p.tiers.length === 1 ? "max-w-sm" : p.tiers.length === 2 ? "max-w-3xl sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <SectionShell id={section.id} className="scroll-mt-16">
      <Container>
        <SectionHeader eyebrow="Pre-launch pricing" title={p.title} subtitle={p.subtitle} />
        <div className="mt-12 min-h-[22rem]">
          {step.name === "choose" && (
            <>
              <div className={cn("mx-auto grid gap-4", cols)}>
                {p.tiers.map((t, i) => {
                  const hi = t.id === p.highlightedTierId;
                  return (
                    <div
                      key={t.id}
                      data-reveal
                      style={{ transitionDelay: `${i * 60}ms` }}
                      className={cn(
                        "relative flex flex-col rounded-vp-xl border bg-vp-surface p-6",
                        hi ? "border-vp-accent shadow-vp ring-1 ring-vp-accent" : "border-vp-border",
                      )}
                    >
                      {hi && (
                        <span className="absolute -top-3 left-6 rounded-full bg-vp-accent px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-vp-accent-fg">
                          Most likely
                        </span>
                      )}
                      <h3 className="vp-display text-lg text-vp-fg">{t.name}</h3>
                      <p className="mt-1 text-sm text-vp-muted">{t.blurb}</p>
                      <p className="mt-5 flex items-baseline gap-1">
                        <span className="vp-display text-4xl text-vp-fg tabular-nums">{formatPrice(t.price, p.currency)}</span>
                        <span className="text-sm text-vp-muted">{intervalLabel(p.interval)}</span>
                      </p>
                      <ul className="mt-5 space-y-2.5 text-sm text-vp-fg/85">
                        {t.features.map((f, k) => (
                          <li key={k} className="flex gap-2.5">
                            <Check className="mt-0.5 size-4 shrink-0 text-vp-accent" strokeWidth={3} aria-hidden />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <VpButton
                        variant={hi ? "primary" : "secondary"}
                        size="lg"
                        className="mt-7 w-full"
                        onClick={() => w.choose("would_pay", t)}
                        disabled={w.busy}
                      >
                        {p.ctaLabel}
                      </VpButton>
                    </div>
                  );
                })}
              </div>
              <div data-reveal className="mt-8 text-center">
                <NoPayLink label={p.noPayLabel} onClick={() => w.choose("would_not_pay")} />
                {w.error && <p className="mt-3 text-sm text-rose-600 dark:text-rose-300">{w.error}</p>}
              </div>
            </>
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
            <FollowUpPanel kind={step.kind} question={p.followUpQuestion} busy={w.busy} onSubmit={(t) => w.reason(step.responseId, t)} />
          )}
          {step.name === "done" && <DonePanel productName={ctx.doc.meta.productName} />}
        </div>
      </Container>
    </SectionShell>
  );
}
