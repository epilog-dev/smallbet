import { Container, SectionShell } from "../../primitives/Container";
import { Eyebrow } from "../../primitives/Eyebrow";
import { Heading, HighlightedText } from "../../primitives/Heading";
import type { SectionProps } from "../../types";
import { HatchBand, HeroCtas, HeroLead, HeroVisual } from "./shared";

export function HeroCentered({ section, ctx }: SectionProps<"hero">) {
  const p = section.props;
  return (
    <SectionShell id={section.id} rule={false} className="overflow-hidden pt-16 pb-0 sm:pt-24 sm:pb-0">
      <Container className="flex flex-col items-center text-center">
        <div data-reveal>
          <Eyebrow>{p.eyebrow}</Eyebrow>
        </div>
        <Heading as="h1" size="hero" className="mt-6 max-w-[20ch]">
          <span data-reveal className="block">
            <HighlightedText text={p.headline} highlight={p.headlineHighlight} />
          </span>
        </Heading>
        <HeroLead props={p} className="mt-6 max-w-[36rem]" />
        <div className="mt-8 pb-12">
          <HeroCtas props={p} ctx={ctx} />
        </div>
      </Container>
      {p.visual.kind !== "none" ? (
        <>
          <HatchBand />
          <Container className="px-0 sm:px-0">
            <div
              data-reveal
              style={{ transitionDelay: "160ms" }}
              className={p.visual.kind === "mobile" ? "border-b border-vp-border bg-vp-surface-2/60 px-4 pt-8 pb-0 [&>div]:mb-[-3.5rem]" : "border-b border-vp-border bg-vp-surface-2/60 p-2 sm:p-3"}
            >
              <HeroVisual props={p} />
            </div>
          </Container>
        </>
      ) : (
        <div className="h-px w-full bg-vp-border" />
      )}
    </SectionShell>
  );
}
