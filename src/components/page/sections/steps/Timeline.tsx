import { Container, SectionShell } from "../../primitives/Container";
import type { SectionProps } from "../../types";
import { SectionHeader } from "../SectionHeader";

export function StepsTimeline({ section }: SectionProps<"steps">) {
  const p = section.props;
  return (
    <SectionShell id={section.id} className="bg-vp-surface-2/50">
      <div id="how" className="absolute -top-16" aria-hidden />
      <Container size="sm">
        <SectionHeader eyebrow="How it works" title={p.title} />
        <ol className="relative mt-12 space-y-8 border-l-2 border-vp-border pl-8">
          {p.items.map((s, i) => (
            <li key={i} data-reveal style={{ transitionDelay: `${i * 70}ms` }} className="relative">
              <span className="absolute -left-[2.45rem] top-0.5 inline-flex size-7 items-center justify-center rounded-full bg-vp-accent text-xs font-bold text-vp-accent-fg ring-4 ring-vp-bg">
                {i + 1}
              </span>
              <h3 className="vp-display text-lg text-vp-fg">{s.title}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-vp-muted">{s.description}</p>
            </li>
          ))}
        </ol>
      </Container>
    </SectionShell>
  );
}
