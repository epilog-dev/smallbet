import { Container, SectionShell } from "../../primitives/Container";
import { Icon } from "../../primitives/Icon";
import type { SectionProps } from "../../types";
import { SectionHeader } from "../SectionHeader";

export function FeaturesList({ section }: SectionProps<"features">) {
  const p = section.props;
  return (
    <SectionShell id={section.id}>
      <Container size="md" className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        <SectionHeader eyebrow="What you get" title={p.title} subtitle={p.subtitle} align="start" />
        <ul className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
          {p.items.map((f, i) => (
            <li key={i} data-reveal style={{ transitionDelay: `${i * 40}ms` }} className="flex gap-4">
              <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-vp-sm bg-vp-accent-soft text-vp-accent-ink">
                <Icon name={f.icon} className="size-4" />
              </span>
              <div>
                <p className="font-semibold text-vp-fg">{f.title}</p>
                <p className="mt-1 text-[15px] leading-relaxed text-vp-muted">{f.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </SectionShell>
  );
}
