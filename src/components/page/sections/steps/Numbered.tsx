import { Container, SectionShell } from "../../primitives/Container";
import type { SectionProps } from "../../types";
import { SectionHeader } from "../SectionHeader";

/** Quiet numbered steps: small circled numerals, hairline-separated columns. */
export function StepsNumbered({ section }: SectionProps<"steps">) {
  const p = section.props;
  return (
    <SectionShell id={section.id}>
      <div id="how" className="absolute -top-16" aria-hidden />
      <Container>
        <SectionHeader eyebrow="How it works" title={p.title} />
        <ol className="mt-14 grid gap-10 border-t border-vp-border pt-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {p.items.map((s, i) => (
            <li key={i} data-reveal style={{ transitionDelay: `${i * 70}ms` }} className="relative lg:border-l lg:border-vp-border lg:pl-6 lg:first:border-l-0 lg:first:pl-0">
              <span className="inline-flex size-7 items-center justify-center rounded-full bg-vp-accent text-xs font-semibold text-vp-accent-fg tabular-nums">
                {i + 1}
              </span>
              <h3 className="vp-display mt-5 text-xl text-vp-fg">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-vp-muted">{s.description}</p>
            </li>
          ))}
        </ol>
      </Container>
    </SectionShell>
  );
}
