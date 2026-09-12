import { Container, SectionShell } from "../../primitives/Container";
import { Eyebrow } from "../../primitives/Eyebrow";
import { Heading, HighlightedText } from "../../primitives/Heading";
import type { SectionProps } from "../../types";
import { HeroCtas, HeroLead, HeroVisual } from "./shared";

export function HeroSplit({ section, ctx }: SectionProps<"hero">) {
  const p = section.props;
  return (
    <SectionShell id={section.id} rule={false} className="overflow-hidden pt-16 sm:pt-24" tight>
      <Container className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <div data-reveal>
            <Eyebrow>{p.eyebrow}</Eyebrow>
          </div>
          <Heading as="h1" size="hero" className="mt-6 max-w-[16ch] lg:text-[3.25rem]">
            <span data-reveal className="block">
              <HighlightedText text={p.headline} highlight={p.headlineHighlight} />
            </span>
          </Heading>
          <HeroLead props={p} className="mt-6 max-w-lg" />
          <div className="mt-8">
            <HeroCtas props={p} ctx={ctx} align="start" />
          </div>
        </div>
        <div data-reveal style={{ transitionDelay: "160ms" }} className="relative">
          <HeroVisual props={{ ...p, visual: p.visual.kind === "none" ? { kind: "abstract" } : p.visual }} />
        </div>
      </Container>
    </SectionShell>
  );
}
