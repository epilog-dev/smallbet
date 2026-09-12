import { Container, SectionShell } from "../../primitives/Container";
import { Icon } from "../../primitives/Icon";
import type { SectionProps } from "../../types";
import { SectionHeader } from "../SectionHeader";

export function FeaturesGrid({ section }: SectionProps<"features">) {
  const p = section.props;
  return (
    <SectionShell id={section.id}>
      <Container>
        <SectionHeader eyebrow="What you get" title={p.title} subtitle={p.subtitle} />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {p.items.map((f, i) => (
            <div
              key={i}
              data-reveal
              style={{ transitionDelay: `${i * 50}ms` }}
              className="vp-card group p-6"
            >
              <div className="mb-5 inline-flex size-9 items-center justify-center rounded-vp-md bg-vp-accent-soft text-vp-accent-ink">
                <Icon name={f.icon} className="size-4" strokeWidth={1.75} />
              </div>
              <h3 className="vp-display text-lg text-vp-fg">{f.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-vp-muted">{f.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </SectionShell>
  );
}
