import { Container, SectionShell } from "../../primitives/Container";
import type { SectionProps } from "../../types";
import { SectionHeader } from "../SectionHeader";

/** Steps on a horizontal track: square markers joined by a rule, mono "Step n" labels. */
export function StepsNumbered({ section }: SectionProps<"steps">) {
  const p = section.props;
  return (
    <SectionShell id={section.id}>
      <div id="how" className="absolute -top-16" aria-hidden />
      <Container>
        <SectionHeader eyebrow="How it works" title={p.title} />
        <ol className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {p.items.map((s, i) => {
            const last = i === p.items.length - 1;
            return (
              <li key={i} data-reveal style={{ transitionDelay: `${i * 70}ms` }} className="relative">
                <div className="flex items-center gap-3">
                  <span className="size-3 shrink-0 rotate-45 bg-vp-accent" aria-hidden />
                  <span className={last ? "h-px flex-1 bg-transparent" : "h-px flex-1 bg-vp-border"} aria-hidden />
                </div>
                <p className="vp-num mt-5">Step {i + 1}</p>
                <h3 className="vp-display mt-2 text-xl text-vp-fg">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-vp-muted">{s.description}</p>
              </li>
            );
          })}
        </ol>
      </Container>
    </SectionShell>
  );
}
