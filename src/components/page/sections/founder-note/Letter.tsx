import { Container, SectionShell } from "../../primitives/Container";
import { Eyebrow } from "../../primitives/Eyebrow";
import { Heading } from "../../primitives/Heading";
import type { SectionProps } from "../../types";

export function FounderNoteLetter({ section }: SectionProps<"founder-note">) {
  const p = section.props;
  return (
    <SectionShell id={section.id}>
      <Container size="sm">
        <div data-reveal className="rounded-vp-xl border border-vp-border bg-vp-surface p-8 shadow-vp sm:p-12">
          <Eyebrow className="mb-3">A note from the founder</Eyebrow>
          {p.title && <Heading size="sub">{p.title}</Heading>}
          <div className="mt-5 space-y-4 text-[17px] leading-relaxed text-vp-fg/85">
            {p.body.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          <p className="vp-display mt-8 text-xl italic text-vp-fg">— {p.signature}</p>
        </div>
      </Container>
    </SectionShell>
  );
}
