import { VpLinkButton } from "../../primitives/Button";
import { Container, SectionShell } from "../../primitives/Container";
import type { SectionProps } from "../../types";

export function CtaBandWithProgress({ section, ctx }: SectionProps<"cta-band">) {
  const p = section.props;
  const { responses, target, daysLeft } = ctx.stats;
  const pct = Math.min(100, Math.round((responses / Math.max(1, target)) * 100));
  return (
    <SectionShell id={section.id} tight>
      <Container size="md">
        <div data-reveal className="vp-ladder grid items-center gap-8 p-8 sm:grid-cols-[1.3fr_1fr] sm:p-10">
          <div>
            <h2 className="vp-display text-3xl text-vp-fg">{p.headline}</h2>
            {p.subheadline && <p className="mt-3 text-vp-muted">{p.subheadline}</p>}
            <div className="mt-6">
              <VpLinkButton href={`#${ctx.pricingAnchor}`} size="lg">
                {p.ctaLabel}
              </VpLinkButton>
            </div>
          </div>
          <div className="rounded-vp-lg bg-vp-surface-2 p-6">
            <div className="flex items-baseline justify-between">
              <span className="vp-display text-4xl text-vp-fg tabular-nums">{responses}</span>
              <span className="text-sm text-vp-muted">of {target} answers</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-vp-fg/10">
              <div className="h-full rounded-full bg-vp-accent transition-[width]" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-3 text-xs text-vp-muted">
              {daysLeft === null ? "Collecting answers" : daysLeft > 0 ? `${daysLeft} days left to decide` : "Decision window closed"}
            </p>
          </div>
        </div>
      </Container>
    </SectionShell>
  );
}
