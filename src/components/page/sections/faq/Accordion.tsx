import { ChevronDown } from "lucide-react";
import { Container, SectionShell } from "../../primitives/Container";
import type { SectionProps } from "../../types";
import { SectionHeader } from "../SectionHeader";

export function FaqAccordion({ section }: SectionProps<"faq">) {
  const p = section.props;
  return (
    <SectionShell id={section.id}>
      <Container size="sm">
        <SectionHeader eyebrow="FAQ" title={p.title} />
        <div className="vp-ladder mt-10 divide-y divide-vp-border">
          {p.items.map((it, i) => (
            <details key={i} data-reveal style={{ transitionDelay: `${i * 40}ms` }} className="group px-6" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-semibold text-vp-fg [&::-webkit-details-marker]:hidden">
                {it.question}
                <ChevronDown className="size-4 shrink-0 text-vp-muted transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <p className="pb-5 text-[15px] leading-relaxed text-vp-muted">{it.answer}</p>
            </details>
          ))}
        </div>
      </Container>
    </SectionShell>
  );
}
