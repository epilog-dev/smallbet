import { Container, SectionShell } from "../../primitives/Container";
import { Eyebrow } from "../../primitives/Eyebrow";
import { Heading, HighlightedText, Lead } from "../../primitives/Heading";
import type { SectionProps } from "../../types";
import { HeroBackdrop, HeroCtas, HeroDoodles, HeroVisual } from "./shared";

export function HeroCentered({ section, ctx }: SectionProps<"hero">) {
  const p = section.props;
  return (
    <SectionShell id={section.id} className="overflow-hidden pt-16 sm:pt-24" tight>
      <HeroBackdrop ctx={ctx} />
      <HeroDoodles ctx={ctx} />
      <Container className="relative flex flex-col items-center text-center">
        <div data-reveal>
          <Eyebrow pill>{p.eyebrow}</Eyebrow>
        </div>
        <Heading as="h1" size="hero" className="mt-6 max-w-[19ch]" >
          <span data-reveal className="block">
            <HighlightedText text={p.headline} highlight={p.headlineHighlight} squiggle={ctx.preset.flags.squiggle} />
          </span>
        </Heading>
        <Lead className="mt-6 max-w-xl">
          <span data-reveal style={{ transitionDelay: "60ms" }} className="block">
            {p.subheadline}
          </span>
        </Lead>
        <div className="mt-9">
          <HeroCtas props={p} ctx={ctx} />
        </div>
        {p.visual.kind !== "none" && (
          <div data-reveal style={{ transitionDelay: "200ms" }} className="mt-14 w-full max-w-4xl">
            <HeroVisual props={p} />
          </div>
        )}
      </Container>
    </SectionShell>
  );
}
