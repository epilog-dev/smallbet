import { Container, SectionShell } from "../../primitives/Container";
import { Eyebrow } from "../../primitives/Eyebrow";
import { Heading, HighlightedText, Lead } from "../../primitives/Heading";
import type { SectionProps } from "../../types";
import { HeroBackdrop, HeroCtas, HeroVisual } from "./shared";

export function HeroSplit({ section, ctx }: SectionProps<"hero">) {
  const p = section.props;
  return (
    <SectionShell id={section.id} className="overflow-hidden pt-14 sm:pt-20" tight>
      <HeroBackdrop ctx={ctx} />
      <Container className="relative grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <div data-reveal>
            <Eyebrow pill>{p.eyebrow}</Eyebrow>
          </div>
          <Heading as="h1" size="hero" className="mt-6 max-w-[16ch] lg:text-[3.9rem]">
            <span data-reveal className="block">
              <HighlightedText text={p.headline} highlight={p.headlineHighlight} squiggle={ctx.preset.flags.squiggle} />
            </span>
          </Heading>
          <Lead className="mt-6 max-w-lg">
            <span data-reveal style={{ transitionDelay: "60ms" }} className="block">
              {p.subheadline}
            </span>
          </Lead>
          <div className="mt-9">
            <HeroCtas props={p} ctx={ctx} align="start" />
          </div>
        </div>
        <div data-reveal style={{ transitionDelay: "160ms" }} className="relative lg:pl-4">
          <HeroVisual props={{ ...p, visual: p.visual.kind === "none" ? { kind: "abstract" } : p.visual }} />
        </div>
      </Container>
    </SectionShell>
  );
}
