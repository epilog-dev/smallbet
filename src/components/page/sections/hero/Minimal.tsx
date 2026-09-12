import { Container, SectionShell } from "../../primitives/Container";
import { Eyebrow } from "../../primitives/Eyebrow";
import { Heading, HighlightedText } from "../../primitives/Heading";
import type { SectionProps } from "../../types";
import { HeroCtas, HeroLead } from "./shared";

export function HeroMinimal({ section, ctx }: SectionProps<"hero">) {
  const p = section.props;
  return (
    <SectionShell id={section.id} rule={false} className="pt-24 sm:pt-32">
      <Container size="md">
        <div data-reveal>
          <Eyebrow>{p.eyebrow}</Eyebrow>
        </div>
        <Heading as="h1" size="hero" className="mt-6 max-w-[20ch]">
          <span data-reveal className="block">
            <HighlightedText text={p.headline} highlight={p.headlineHighlight} />
          </span>
        </Heading>
        <HeroLead props={p} className="mt-6 max-w-2xl" />
        <div className="mt-8">
          <HeroCtas props={p} ctx={ctx} align="start" />
        </div>
      </Container>
    </SectionShell>
  );
}
