import { SectionSchema, type Section } from "./sections";
import type { PageDocument } from "./document";

/**
 * Turn a streaming partial document into something the renderer can show:
 * keeps only sections that already validate, fills document-level fields with
 * placeholders. Used while generation is in flight.
 */
export function coercePartialDocument(partial: unknown, fallbackName = "Your product"): PageDocument | null {
  if (!partial || typeof partial !== "object") return null;
  const p = partial as Record<string, unknown>;
  const rawSections = Array.isArray(p.sections) ? p.sections : [];
  const sections: Section[] = [];
  const seen = new Set<string>();
  for (const s of rawSections) {
    const r = SectionSchema.safeParse(s);
    if (!r.success) continue;
    if (seen.has(r.data.id)) continue;
    seen.add(r.data.id);
    sections.push(r.data);
  }
  if (sections.length === 0) return null;
  const meta = (p.meta ?? {}) as Partial<PageDocument["meta"]>;
  const theme = (p.theme ?? {}) as Partial<PageDocument["theme"]>;
  const nav = (p.nav ?? {}) as Partial<PageDocument["nav"]>;
  const goal = (p.goal ?? {}) as Partial<PageDocument["goal"]>;
  const productName = meta.productName || fallbackName;
  return {
    version: 1,
    meta: {
      productName,
      tagline: meta.tagline || "",
      seoTitle: meta.seoTitle || productName,
      seoDescription: meta.seoDescription || "",
    },
    theme: {
      accent: theme.accent ?? "blue",
      mode: theme.mode ?? "light",
      rationale: theme.rationale,
    },
    nav: { logoText: nav.logoText || productName, ctaLabel: nav.ctaLabel || "Pricing" },
    goal: { targetResponses: goal.targetResponses ?? 25, deadlineDays: goal.deadlineDays ?? 30 },
    sections,
  };
}
