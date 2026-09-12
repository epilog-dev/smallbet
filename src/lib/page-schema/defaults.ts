import { nanoid } from "nanoid";
import type { Section, SectionType } from "./sections";
import type { PageDocument } from "./document";

export const newSectionId = (type: SectionType) => `${type}-${nanoid(6)}`;

/** Sensible placeholder content for a freshly added section. */
export function defaultSection<T extends SectionType>(type: T, variant?: string): Extract<Section, { type: T }> {
  const id = newSectionId(type);
  const s = ((): Section => {
    switch (type) {
      case "hero":
        return {
          id,
          type: "hero",
          variant: (variant as "centered") ?? "centered",
          hidden: false,
          props: {
            eyebrow: "For people who need this",
            headline: "A clear promise in ten words or fewer",
            headlineHighlight: "clear promise",
            subheadline: "One or two sentences on what it is, who it is for and why it is different.",
            primaryCta: "See pricing",
            secondaryCta: "How it works",
            visual: { kind: "abstract" },
          },
        };
      case "problem":
        return {
          id,
          type: "problem",
          variant: (variant as "cards") ?? "cards",
          hidden: false,
          props: {
            title: "The problem today",
            items: [
              { title: "It takes too long", description: "Describe the pain plainly." },
              { title: "It costs too much", description: "Describe the pain plainly." },
              { title: "Nobody trusts the result", description: "Describe the pain plainly." },
            ],
          },
        };
      case "features":
        return {
          id,
          type: "features",
          variant: (variant as "grid") ?? "grid",
          hidden: false,
          props: {
            title: "What you get",
            items: [
              { icon: "zap", title: "Fast", description: "A concrete outcome." },
              { icon: "shield-check", title: "Safe", description: "A concrete outcome." },
              { icon: "sparkles", title: "Simple", description: "A concrete outcome." },
            ],
          },
        };
      case "steps":
        return {
          id,
          type: "steps",
          variant: (variant as "numbered") ?? "numbered",
          hidden: false,
          props: {
            title: "How it works",
            items: [
              { title: "Describe", description: "Tell us what you need." },
              { title: "Review", description: "We prepare it for you." },
              { title: "Launch", description: "Share it with the world." },
            ],
          },
        };
      case "founder-note":
        return {
          id,
          type: "founder-note",
          variant: (variant as "letter") ?? "letter",
          hidden: false,
          props: {
            title: "Why I'm building this",
            body: ["I ran into this problem myself and could not find a tool that solved it honestly."],
            signature: "The founder",
          },
        };
      case "pricing-intent":
        return {
          id,
          type: "pricing-intent",
          variant: (variant as "price-ladder") ?? "price-ladder",
          hidden: false,
          props: {
            title: "What would you pay for this?",
            subtitle:
              "This product is not built yet. Your answer decides whether it gets built and what it will cost. Nothing is charged.",
            currency: "USD",
            interval: "month",
            tiers: [
              { id: "hobby", name: "Hobby", price: 9, blurb: "For personal use", features: [] },
              { id: "solo", name: "Solo", price: 19, blurb: "For one professional", features: [] },
              { id: "pro", name: "Pro", price: 39, blurb: "For serious daily use", features: [] },
              { id: "team", name: "Team", price: 79, blurb: "For a small team", features: [] },
              { id: "business", name: "Business", price: 149, blurb: "For a company", features: [] },
            ],
            whatYouGet: ["Does the core job automatically", "Tells you when it needs a decision", "Works with what you already use"],
            highlightedTierId: "pro",
            ctaLabel: "I'd pay this",
            noPayLabel: "I wouldn't pay for this",
            askEmail: true,
            followUpQuestion: "What would make this a must-have for you?",
          },
        };
      case "faq":
        return {
          id,
          type: "faq",
          variant: (variant as "accordion") ?? "accordion",
          hidden: false,
          props: {
            title: "Questions",
            items: [
              { question: "Is this available now?", answer: "Not yet. We are validating demand before we build." },
              { question: "Will I be charged?", answer: "No. Choosing a price is a signal, not a purchase." },
              { question: "When would it launch?", answer: "If enough people want it, within a few months." },
            ],
          },
        };
      case "stats":
        return {
          id,
          type: "stats",
          variant: (variant as "row") ?? "row",
          hidden: false,
          props: {
            title: "The cost of doing this by hand",
            items: [
              { value: "6 h", label: "lost per month", note: "founder's own experience" },
              { value: "3×", label: "the same number checked", note: "" },
              { value: "$0", label: "charged until it exists" },
            ],
          },
        };
      case "cta-band":
        return {
          id,
          type: "cta-band",
          variant: (variant as "simple") ?? "simple",
          hidden: false,
          props: {
            headline: "Help decide if this gets built",
            subheadline: "Thirty seconds. No card, no signup.",
            ctaLabel: "Pick a price",
          },
        };
    }
  })();
  return s as Extract<Section, { type: T }>;
}

export function emptyDocument(productName = "Untitled"): PageDocument {
  return {
    version: 1,
    meta: {
      productName,
      tagline: "A short tagline",
      seoTitle: productName,
      seoDescription: "Tell us what you would pay for this before it is built.",
    },
    theme: { accent: "blue", mode: "light" },
    nav: { logoText: productName, ctaLabel: "See pricing" },
    goal: { targetResponses: 25, deadlineDays: 30 },
    sections: [
      defaultSection("hero"),
      defaultSection("features"),
      defaultSection("pricing-intent"),
      defaultSection("faq"),
    ],
  };
}
