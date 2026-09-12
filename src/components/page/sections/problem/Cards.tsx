import { Container, SectionShell } from "../../primitives/Container";
import type { SectionProps } from "../../types";
import { SectionHeader } from "../SectionHeader";

export function ProblemCards({ section }: SectionProps<"problem">) {
  const p = section.props;
  return (
    <SectionShell id={section.id}>
      <Container>
        <SectionHeader eyebrow="The problem" title={p.title} />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {p.items.map((it, i) => (
            <div
              key={i}
              data-reveal
              style={{ transitionDelay: `${i * 60}ms` }}
              className="rounded-vp-lg border border-vp-border bg-vp-surface p-6"
            >
              <div className="mb-4 inline-flex size-8 items-center justify-center rounded-full bg-vp-fg/6 text-sm font-semibold text-vp-muted">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="vp-display text-lg text-vp-fg">{it.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-vp-muted">{it.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </SectionShell>
  );
}
