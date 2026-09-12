import { VpLinkButton } from "../../primitives/Button";
import { Container, SectionShell } from "../../primitives/Container";
import type { SectionProps } from "../../types";

export function CtaBandSimple({ section, ctx }: SectionProps<"cta-band">) {
  const p = section.props;
  return (
    <SectionShell id={section.id} tight>
      <Container>
        <div data-reveal className="relative overflow-hidden rounded-vp-xl bg-vp-accent px-8 py-14 text-center text-vp-accent-fg sm:px-14">
          <div aria-hidden className="absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl" />
          <h2 className="vp-display relative text-3xl sm:text-4xl">{p.headline}</h2>
          {p.subheadline && <p className="relative mx-auto mt-3 max-w-xl text-base opacity-85">{p.subheadline}</p>}
          <div className="relative mt-8">
            <VpLinkButton
              href={`#${ctx.pricingAnchor}`}
              size="lg"
              className="bg-vp-accent-fg text-vp-accent hover:bg-vp-accent-fg/90"
            >
              {p.ctaLabel}
            </VpLinkButton>
          </div>
        </div>
      </Container>
    </SectionShell>
  );
}
