import type { IdeaBrief } from "@/lib/ai/types";
import type { PageDocument } from "./document";

/** Reconstructs a usable brief from a document when the original wasn't stored. */
export function briefFromDocument(doc: PageDocument): IdeaBrief {
  const hero = doc.sections.find((s) => s.type === "hero");
  const problem = doc.sections.find((s) => s.type === "problem");
  const features = doc.sections.find((s) => s.type === "features");
  const faq = doc.sections.find((s) => s.type === "faq");
  const pricing = doc.sections.find((s) => s.type === "pricing-intent");
  const eyebrow = hero?.type === "hero" ? hero.props.eyebrow : "";
  return {
    productName: doc.meta.productName,
    nameIdeas: [doc.meta.productName, doc.nav.logoText].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4),
    audience: eyebrow.replace(/^for\s+/i, "") || "people with this problem",
    problem: problem?.type === "problem" ? problem.props.items[0]?.description ?? problem.props.title : doc.meta.tagline,
    promise: hero?.type === "hero" ? hero.props.subheadline : doc.meta.tagline,
    differentiators: features?.type === "features" ? features.props.items.slice(0, 4).map((f) => f.title) : [doc.meta.tagline, "Built for this job"],
    objections: faq?.type === "faq" ? faq.props.items.slice(0, 4).map((q) => q.question) : ["We already have a tool", "Not sure I trust it"],
    currency: pricing?.type === "pricing-intent" ? pricing.props.currency : "USD",
    interval: pricing?.type === "pricing-intent" ? pricing.props.interval : "month",
    suggestedTiers:
      pricing?.type === "pricing-intent" ? pricing.props.tiers.map((t) => ({ name: t.name, price: t.price, blurb: t.blurb })) : [{ name: "Standard", price: 19, blurb: "For individuals" }],
    tone: "plain",
    theme: { accent: doc.theme.accent, mode: doc.theme.mode },
    heroVariant: hero?.type === "hero" ? hero.variant : "centered",
  };
}
