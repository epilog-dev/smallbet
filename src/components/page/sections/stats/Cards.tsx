import { Container, SectionShell } from "../../primitives/Container";
import { Heading } from "../../primitives/Heading";
import type { SectionProps } from "../../types";

/** Numbers on accent-tinted cards. */
export function StatsCards({ section }: SectionProps<"stats">) {
  const p = section.props;
  const cols = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[Math.min(4, Math.max(2, p.items.length)) as 2 | 3 | 4];
  return (
    <SectionShell id={section.id} tight>
      <Container>
        {p.title && (
          <div data-reveal className="mx-auto mb-10 max-w-2xl text-center">
            <Heading size="sub">{p.title}</Heading>
          </div>
        )}
        <div className={`grid gap-3 ${cols}`}>
          {p.items.map((it, i) => (
            <div key={i} data-reveal style={{ transitionDelay: `${i * 60}ms` }} className="rounded-vp-lg bg-vp-accent-soft p-6">
              <p className="vp-display text-4xl text-vp-accent-ink tabular-nums sm:text-5xl">{it.value}</p>
              <p className="mt-2 text-[15px] leading-snug text-vp-fg">{it.label}</p>
              {it.note && <p className="mt-1 text-xs text-vp-muted">{it.note}</p>}
            </div>
          ))}
        </div>
      </Container>
    </SectionShell>
  );
}
