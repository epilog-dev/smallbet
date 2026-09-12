import { Container, SectionShell } from "../../primitives/Container";
import { Icon } from "../../primitives/Icon";
import { cn } from "@/lib/utils";
import type { SectionProps } from "../../types";
import { SectionHeader } from "../SectionHeader";

export function FeaturesAlternating({ section }: SectionProps<"features">) {
  const p = section.props;
  return (
    <SectionShell id={section.id}>
      <Container size="md">
        <SectionHeader eyebrow="What you get" title={p.title} subtitle={p.subtitle} />
        <div className="mt-14 space-y-10">
          {p.items.map((f, i) => (
            <div
              key={i}
              data-reveal
              className={cn("grid items-center gap-6 sm:grid-cols-[1fr_1fr] sm:gap-12", i % 2 === 1 && "sm:[&>*:first-child]:order-2")}
            >
              <div>
                <div className="mb-4 inline-flex size-10 items-center justify-center rounded-vp-md bg-vp-accent-soft text-vp-accent-ink">
                  <Icon name={f.icon} className="size-5" />
                </div>
                <h3 className="vp-display text-2xl text-vp-fg">{f.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-vp-muted">{f.description}</p>
              </div>
              <div className="relative aspect-[5/3] overflow-hidden rounded-vp-lg border border-vp-border bg-vp-surface-2">
                <div className="absolute inset-x-6 top-6 h-3 w-1/2 rounded-full bg-vp-fg/10" />
                <div className="absolute inset-x-6 top-12 grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((k) => (
                    <div key={k} className={cn("h-16 rounded-vp-md border border-vp-border bg-vp-surface", k === i % 3 && "ring-2 ring-vp-accent")} />
                  ))}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-vp-accent/15 to-transparent" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </SectionShell>
  );
}
