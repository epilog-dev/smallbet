import { nanoid } from "nanoid";
import { PageDocumentSchema, type PageDocument } from "./document";
import { defaultSection } from "./defaults";
import type { Section } from "./sections";

/**
 * Enforces document invariants the schema alone cannot express, without failing:
 *  - unique, non-empty section ids
 *  - hero first (a missing hero is inserted)
 *  - exactly one pricing-intent section (extras removed, missing one inserted before FAQ/CTA)
 *  - headlineHighlight is a literal substring of headline
 *  - unique tier ids; highlightedTierId points at a real tier
 *  - 4..8 sections (pads with FAQ / trims trailing non-essential sections)
 * Returns a fresh, schema-valid document. Throws only if the input is unrecoverable.
 */
export function repairDocument(input: unknown): PageDocument {
  const draft = structuredClone(input) as PageDocument;
  if (!draft || typeof draft !== "object") throw new Error("repairDocument: not an object");
  draft.version = 1;
  if (!Array.isArray(draft.sections)) draft.sections = [];

  // Drop anything that isn't a plausible section object.
  let sections = draft.sections.filter(
    (s): s is Section => !!s && typeof s === "object" && typeof (s as Section).type === "string",
  );

  // Unique ids.
  const seen = new Set<string>();
  sections = sections.map((s) => {
    let id = typeof s.id === "string" && s.id.trim() ? s.id.trim() : `${s.type}-${nanoid(6)}`;
    while (seen.has(id)) id = `${s.type}-${nanoid(6)}`;
    seen.add(id);
    return { ...s, id, hidden: Boolean(s.hidden) };
  });

  // Hero first.
  const heroIdx = sections.findIndex((s) => s.type === "hero");
  if (heroIdx === -1) sections.unshift(defaultSection("hero"));
  else if (heroIdx > 0) sections.unshift(...sections.splice(heroIdx, 1));

  // Exactly one pricing-intent.
  const pricingIdxs = sections.map((s, i) => (s.type === "pricing-intent" ? i : -1)).filter((i) => i >= 0);
  if (pricingIdxs.length === 0) {
    const insertAt = sections.findIndex((s) => s.type === "faq" || s.type === "cta-band");
    sections.splice(insertAt === -1 ? sections.length : insertAt, 0, defaultSection("pricing-intent"));
  } else if (pricingIdxs.length > 1) {
    sections = sections.filter((s, i) => s.type !== "pricing-intent" || i === pricingIdxs[0]);
  }

  // Per-section fixes.
  sections = sections.map((s) => {
    if (s.type === "hero") {
      let props = s.props;
      // Legacy visual shape: { kind: "mock-ui", mockTitle, mockRows } → { kind: "dashboard", title, rows }
      const v = props.visual as unknown as Record<string, unknown> | undefined;
      if (v && (v.kind === "mock-ui" || "mockRows" in v || "mockTitle" in v)) {
        const { mockTitle, mockRows, kind, ...rest } = v;
        props = { ...props, visual: { ...rest, kind: kind === "mock-ui" ? "dashboard" : (kind as "dashboard"), title: (rest.title as string | undefined) ?? (mockTitle as string | undefined), rows: (rest.rows as never) ?? (mockRows as never) } as typeof props.visual };
      }
      const { headline, headlineHighlight } = props;
      if (headlineHighlight && !headline.includes(headlineHighlight)) props = { ...props, headlineHighlight: undefined };
      return props === s.props ? s : { ...s, props };
    }
    if (s.type === "pricing-intent") {
      const tierIds = new Set<string>();
      const tiers = s.props.tiers.map((t, i) => {
        let id = t.id?.trim() || `tier-${i + 1}`;
        while (tierIds.has(id)) id = `${id}-${i + 1}`;
        tierIds.add(id);
        return { ...t, id };
      });
      const highlightedTierId =
        s.props.highlightedTierId && tierIds.has(s.props.highlightedTierId)
          ? s.props.highlightedTierId
          : tiers[Math.min(1, tiers.length - 1)]?.id;
      return { ...s, props: { ...s.props, tiers, highlightedTierId } };
    }
    return s;
  });

  // Size bounds.
  while (sections.length < 4) sections.push(defaultSection(sections.some((s) => s.type === "faq") ? "cta-band" : "faq"));
  while (sections.length > 8) {
    const idx = [...sections].reverse().findIndex((s) => s.type !== "hero" && s.type !== "pricing-intent");
    if (idx === -1) break;
    sections.splice(sections.length - 1 - idx, 1);
  }

  draft.sections = sections;
  draft.goal = draft.goal ?? { targetResponses: 25, deadlineDays: 30 };

  const parsed = PageDocumentSchema.safeParse(draft);
  if (!parsed.success) {
    throw new Error(`repairDocument: still invalid after repair: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
  }
  return parsed.data;
}
