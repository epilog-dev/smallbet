import { Container, SectionShell } from "../../primitives/Container";
import { Eyebrow } from "../../primitives/Eyebrow";
import { Heading, HighlightedText, Lead } from "../../primitives/Heading";
import type { SectionProps } from "../../types";
import { HeroBackdrop, HeroCtas, HeroVisual, Rails } from "./shared";

export function HeroCentered({ section, ctx }: SectionProps<"hero">) {
  const p = section.props;
  return (
    <SectionShell id={section.id} className="overflow-hidden pt-20 sm:pt-28" tight>
      <HeroBackdrop ctx={ctx} />
      <Rails />
      <Container className="relative flex flex-col items-center text-center">
        <div data-reveal>
          <Eyebrow>{p.eyebrow}</Eyebrow>
        </div>
        <Heading as="h1" size="hero" className="mt-7 max-w-[21ch]">
          <span data-reveal className="block">
            <HighlightedText text={p.headline} highlight={p.headlineHighlight} />
          </span>
        </Heading>
        <Lead className="mt-6 max-w-[38rem]">
          <span data-reveal style={{ transitionDelay: "60ms" }} className="block">
            {p.subheadline}
          </span>
        </Lead>
        <div className="mt-9">
          <HeroCtas props={p} ctx={ctx} />
        </div>
        {p.visual.kind !== "none" && (
          <div data-reveal style={{ transitionDelay: "200ms" }} className="mt-16 w-full max-w-5xl">
            <HeroVisual props={p} />
          </div>
        )}
      </Container>
    </SectionShell>
  );
}
