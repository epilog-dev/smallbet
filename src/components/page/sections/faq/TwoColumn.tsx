import { Container, SectionShell } from "../../primitives/Container";
import type { SectionProps } from "../../types";
import { SectionHeader } from "../SectionHeader";

export function FaqTwoColumn({ section }: SectionProps<"faq">) {
  const p = section.props;
  return (
    <SectionShell id={section.id} className="bg-vp-surface-2/50">
      <Container className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
        <SectionHeader eyebrow="FAQ" title={p.title} align="start" />
        <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {p.items.map((it, i) => (
            <div key={i} data-reveal style={{ transitionDelay: `${i * 40}ms` }}>
              <dt className="font-semibold text-vp-fg">{it.question}</dt>
              <dd className="mt-2 text-[15px] leading-relaxed text-vp-muted">{it.answer}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </SectionShell>
  );
}
