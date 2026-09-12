import type { SectionRegistry } from "./types";
import { HeroCentered } from "./sections/hero/Centered";
import { HeroSplit } from "./sections/hero/Split";
import { HeroMinimal } from "./sections/hero/Minimal";
import { ProblemCards } from "./sections/problem/Cards";
import { ProblemChecklist } from "./sections/problem/Checklist";
import { FeaturesGrid } from "./sections/features/Grid";
import { FeaturesAlternating } from "./sections/features/Alternating";
import { FeaturesList } from "./sections/features/List";
import { StepsNumbered } from "./sections/steps/Numbered";
import { StepsTimeline } from "./sections/steps/Timeline";
import { FounderNoteLetter } from "./sections/founder-note/Letter";
import { FounderNoteQuote } from "./sections/founder-note/Quote";
import { PricingIntentPriceLadder } from "./sections/pricing-intent/PriceLadder";
import { PricingIntentTiers } from "./sections/pricing-intent/Tiers";
import { PricingIntentSinglePrice } from "./sections/pricing-intent/SinglePrice";
import { FaqAccordion } from "./sections/faq/Accordion";
import { FaqTwoColumn } from "./sections/faq/TwoColumn";
import { CtaBandSimple } from "./sections/cta-band/Simple";
import { CtaBandWithProgress } from "./sections/cta-band/WithProgress";
import { StatsRow } from "./sections/stats/Row";
import { StatsCards } from "./sections/stats/Cards";

/** type → variant → component. Adding a variant = add it to the schema enum and here. */
export const SECTION_REGISTRY: SectionRegistry = {
  hero: { centered: HeroCentered, split: HeroSplit, minimal: HeroMinimal },
  problem: { cards: ProblemCards, checklist: ProblemChecklist },
  features: { grid: FeaturesGrid, alternating: FeaturesAlternating, list: FeaturesList },
  steps: { numbered: StepsNumbered, timeline: StepsTimeline },
  "founder-note": { letter: FounderNoteLetter, quote: FounderNoteQuote },
  "pricing-intent": { "price-ladder": PricingIntentPriceLadder, tiers: PricingIntentTiers, "single-price": PricingIntentSinglePrice },
  faq: { accordion: FaqAccordion, "two-column": FaqTwoColumn },
  "cta-band": { simple: CtaBandSimple, "with-progress": CtaBandWithProgress },
  stats: { row: StatsRow, cards: StatsCards },
};
