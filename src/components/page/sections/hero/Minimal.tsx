import { Container, SectionShell } from "../../primitives/Container";
import { Eyebrow } from "../../primitives/Eyebrow";
import { Heading, HighlightedText, Lead } from "../../primitives/Heading";
import type { SectionProps } from "../../types";
import { HeroBackdrop, HeroCtas, Rails } from "./shared";

export function HeroMinimal({ section, ctx }: SectionProps<"hero">) {
  const p = section.props;
  return (
    <SectionShell id={section.id} className="overflow-hidden pt-24 sm:pt-36">
      <HeroBackdrop ctx={ctx} />
      <Rails />
      <Container size="md" className="relative">
        <div data-reveal>
          <Eyebrow>{p.eyebrow}</Eyebrow>
        </div>
        <Heading as="h1" size="hero" className="mt-7 max-w-[20ch]">
          <span data-reveal className="block">
            <HighlightedText text={p.headline} highlight={p.headlineHighlight} />
          </span>
        </Heading>
        <Lead className="mt-6 max-w-2xl text-xl">
          <span data-reveal style={{ transitionDelay: "60ms" }} className="block">
            {p.subheadline}
          </span>
        </Lead>
        <div className="mt-9">
          <HeroCtas props={p} ctx={ctx} align="start" />
        </div>
      </Container>
    </SectionShell>
  );
}
