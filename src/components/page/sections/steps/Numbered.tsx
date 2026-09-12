import { Container, SectionShell } from "../../primitives/Container";
import type { SectionProps } from "../../types";
import { SectionHeader } from "../SectionHeader";

export function StepsNumbered({ section }: SectionProps<"steps">) {
  const p = section.props;
  return (
    <SectionShell id={section.id}>
      <div id="how" className="absolute -top-16" aria-hidden />
      <Container>
        <SectionHeader eyebrow="How it works" title={p.title} />
        <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {p.items.map((s, i) => (
            <li key={i} data-reveal style={{ transitionDelay: `${i * 70}ms` }} className="relative">
              <div className="vp-display text-5xl text-vp-accent/60">{String(i + 1).padStart(2, "0")}</div>
              <h3 className="vp-display mt-3 text-lg text-vp-fg">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-vp-muted">{s.description}</p>
            </li>
          ))}
        </ol>
      </Container>
    </SectionShell>
  );
}
