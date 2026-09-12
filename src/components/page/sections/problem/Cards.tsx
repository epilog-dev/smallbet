import { Container, SectionShell } from "../../primitives/Container";
import type { SectionProps } from "../../types";
import { SectionHeader } from "../SectionHeader";

export function ProblemCards({ section }: SectionProps<"problem">) {
  const p = section.props;
  return (
    <SectionShell id={section.id}>
      <Container>
        <SectionHeader eyebrow="The problem" title={p.title} />
        <div className="vp-grid mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {p.items.map((it, i) => (
            <div
              key={i}
              data-reveal
              style={{ transitionDelay: `${i * 60}ms` }}
              className="vp-card rounded-vp-lg border border-vp-border bg-vp-surface p-6"
            >
              <p className="vp-num mb-4">Problem {i + 1}</p>
              <h3 className="vp-display text-lg text-vp-fg">{it.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-vp-muted">{it.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </SectionShell>
  );
}
