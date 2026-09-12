import { useId } from "react";
import type { PageDocument, Section } from "@/lib/page-schema";
import { cn } from "@/lib/utils";
import { PageProvider } from "./context";
import { Footer } from "./Footer";
import { Nav } from "./Nav";
import { RevealController } from "./primitives/Reveal";
import { SECTION_REGISTRY } from "./registry";
import { PRESETS } from "./theme/presets";
import { ThemeScope } from "./theme/ThemeScope";
import type { PageContextValue, PageMode, PageStats } from "./types";

export interface PageRendererProps {
  doc: PageDocument;
  mode: PageMode;
  slug?: string;
  stats?: Partial<PageStats>;
  /** editor: highlight + click-to-select */
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  className?: string;
  /** disable scroll reveal (editor thumbnails, tests) */
  noReveal?: boolean;
}

function renderSection(section: Section, ctx: PageContextValue) {
  const byVariant = SECTION_REGISTRY[section.type] as Record<
    string,
    (p: { section: Section; ctx: PageContextValue }) => React.ReactNode
  >;
  const Component = byVariant[section.variant] ?? Object.values(byVariant)[0];
  return <Component section={section} ctx={ctx} />;
}

export function PageRenderer({
  doc,
  mode,
  slug,
  stats,
  selectedId,
  onSelect,
  className,
  noReveal,
}: PageRendererProps) {
  const rootId = `vp-${useId().replace(/[:]/g, "")}`;
  const pricing = doc.sections.find((s) => s.type === "pricing-intent");
  const ctx: PageContextValue = {
    mode,
    slug,
    doc,
    theme: doc.theme,
    preset: PRESETS[doc.theme.preset],
    pricingAnchor: pricing?.id ?? "pricing",
    stats: {
      responses: stats?.responses ?? (mode === "live" ? 0 : 12),
      wouldPay: stats?.wouldPay ?? (mode === "live" ? 0 : 9),
      target: stats?.target ?? doc.goal.targetResponses,
      daysLeft:
        stats?.daysLeft ?? (mode === "live" ? null : doc.goal.deadlineDays - 4),
    },
  };
  const editor = mode === "editor";

  return (
    <PageProvider value={ctx}>
      <ThemeScope
        id={rootId}
        theme={doc.theme}
        className={cn("relative min-h-full", className)}
        style={{ isolation: "isolate" }}
      >
        <span id="top" />
        <Nav ctx={ctx} />
        <main>
          {doc.sections
            .filter((s) => !s.hidden || editor)
            .map((s) => (
              <div
                key={s.id}
                data-section={s.id}
                onClick={editor && onSelect ? () => onSelect(s.id) : undefined}
                className={cn(
                  editor &&
                    "relative cursor-pointer outline-offset-[-3px] transition-[outline-color] hover:outline hover:outline-2 hover:outline-vp-accent/40",
                  editor &&
                    selectedId === s.id &&
                    "outline outline-2 outline-vp-accent",
                  editor && s.hidden && "opacity-40 grayscale",
                )}
              >
                {renderSection(s, ctx)}
              </div>
            ))}
        </main>
        <Footer ctx={ctx} />
        {!noReveal && !editor && <RevealController rootId={rootId} />}
      </ThemeScope>
    </PageProvider>
  );
}
