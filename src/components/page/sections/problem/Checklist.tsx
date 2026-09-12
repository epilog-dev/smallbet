import { X } from "lucide-react";
import { Container, SectionShell } from "../../primitives/Container";
import type { SectionProps } from "../../types";
import { SectionHeader } from "../SectionHeader";

export function ProblemChecklist({ section }: SectionProps<"problem">) {
  const p = section.props;
  return (
    <SectionShell id={section.id}>
      <Container size="md" className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
        <SectionHeader eyebrow="Sound familiar?" title={p.title} align="start" />
        <ul className="vp-ladder divide-y divide-vp-border">
          {p.items.map((it, i) => (
            <li key={i} data-reveal style={{ transitionDelay: `${i * 60}ms` }} className="flex gap-4 p-5">
              <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-rose-500/12 vp-negative">
                <X className="size-3.5" strokeWidth={3} aria-hidden />
              </span>
              <div>
                <p className="font-semibold text-vp-fg">{it.title}</p>
                <p className="mt-1 text-[15px] leading-relaxed text-vp-muted">{it.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </SectionShell>
  );
}
