import { VpLinkButton } from "../../primitives/Button";
import { Container, SectionShell } from "../../primitives/Container";
import type { SectionProps } from "../../types";

/** A bordered card on the page background with a soft accent gradient; the accent button carries the weight. */
export function CtaBandSimple({ section, ctx }: SectionProps<"cta-band">) {
  const p = section.props;
  return (
    <SectionShell id={section.id} tight>
      <Container>
        <div
          data-reveal
          className="relative overflow-hidden rounded-vp-xl border border-vp-border px-8 py-14 text-center sm:px-14"
          style={{
            background:
              "radial-gradient(70% 120% at 50% 0%, color-mix(in oklab, var(--vp-accent) 22%, var(--vp-surface)) 0%, var(--vp-surface) 70%)",
          }}
        >
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--vp-accent),transparent)]" />
          <h2 className="vp-display relative text-3xl text-vp-fg sm:text-4xl">{p.headline}</h2>
          {p.subheadline && <p className="relative mx-auto mt-3 max-w-xl text-base text-vp-muted">{p.subheadline}</p>}
          <div className="relative mt-8">
            <VpLinkButton href={`#${ctx.pricingAnchor}`} size="lg">
              {p.ctaLabel}
            </VpLinkButton>
          </div>
        </div>
      </Container>
    </SectionShell>
  );
}
