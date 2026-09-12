import { z } from "zod";
import { HeroSectionSchema, HERO_VARIANTS } from "./hero";
import { ProblemSectionSchema, PROBLEM_VARIANTS } from "./problem";
import { FeaturesSectionSchema, FEATURES_VARIANTS } from "./features";
import { StepsSectionSchema, STEPS_VARIANTS } from "./steps";
import { FounderNoteSectionSchema, FOUNDER_NOTE_VARIANTS } from "./founder-note";
import { PricingIntentSectionSchema, PRICING_INTENT_VARIANTS } from "./pricing-intent";
import { FaqSectionSchema, FAQ_VARIANTS } from "./faq";
import { CtaBandSectionSchema, CTA_BAND_VARIANTS } from "./cta-band";
import { StatsSectionSchema, STATS_VARIANTS } from "./stats";

export * from "./hero";
export * from "./problem";
export * from "./features";
export * from "./steps";
export * from "./founder-note";
export * from "./pricing-intent";
export * from "./faq";
export * from "./cta-band";
export * from "./stats";

// z.union (not discriminatedUnion) so the JSON Schema uses anyOf, which Gemini structured output supports.
export const SectionSchema = z.union([
  HeroSectionSchema,
  ProblemSectionSchema,
  FeaturesSectionSchema,
  StepsSectionSchema,
  FounderNoteSectionSchema,
  PricingIntentSectionSchema,
  FaqSectionSchema,
  CtaBandSectionSchema,
  StatsSectionSchema,
]);
export type Section = z.infer<typeof SectionSchema>;
export type SectionType = Section["type"];
export type SectionOfType<T extends SectionType> = Extract<Section, { type: T }>;

export const SECTION_SCHEMAS = {
  hero: HeroSectionSchema,
  problem: ProblemSectionSchema,
  features: FeaturesSectionSchema,
  steps: StepsSectionSchema,
  "founder-note": FounderNoteSectionSchema,
  "pricing-intent": PricingIntentSectionSchema,
  faq: FaqSectionSchema,
  "cta-band": CtaBandSectionSchema,
  stats: StatsSectionSchema,
} as const;

export const SECTION_VARIANTS: Record<SectionType, readonly string[]> = {
  hero: HERO_VARIANTS,
  problem: PROBLEM_VARIANTS,
  features: FEATURES_VARIANTS,
  steps: STEPS_VARIANTS,
  "founder-note": FOUNDER_NOTE_VARIANTS,
  "pricing-intent": PRICING_INTENT_VARIANTS,
  faq: FAQ_VARIANTS,
  "cta-band": CTA_BAND_VARIANTS,
  stats: STATS_VARIANTS,
};

export const SECTION_TYPES = Object.keys(SECTION_SCHEMAS) as SectionType[];

export const SECTION_LABELS: Record<SectionType, string> = {
  hero: "Hero",
  problem: "Problem",
  features: "Features",
  steps: "How it works",
  "founder-note": "Founder note",
  "pricing-intent": "Pricing intent",
  faq: "FAQ",
  "cta-band": "Call to action",
  stats: "Numbers",
};
