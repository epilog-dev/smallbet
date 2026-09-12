import { Container, SectionShell } from "../../primitives/Container";
import type { SectionProps } from "../../types";

export function FounderNoteQuote({ section }: SectionProps<"founder-note">) {
  const p = section.props;
  return (
    <SectionShell id={section.id} className="bg-vp-accent-soft/60">
      <Container size="md" className="text-center">
        <div data-reveal>
          <span aria-hidden className="vp-display block text-7xl leading-none text-vp-accent/50">“</span>
          <blockquote className="vp-display -mt-6 text-2xl leading-snug text-vp-fg sm:text-3xl">{p.body[0]}</blockquote>
          {p.body.slice(1).map((para, i) => (
            <p key={i} className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed text-vp-muted">
              {para}
            </p>
          ))}
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.14em] text-vp-accent-ink">{p.signature}</p>
        </div>
      </Container>
    </SectionShell>
  );
}
