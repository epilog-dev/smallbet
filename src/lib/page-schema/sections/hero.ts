import { z } from "zod";
import { baseSection, short } from "./shared";

export const HERO_VARIANTS = ["centered", "split", "minimal"] as const;

export const HeroVisualSchema = z.object({
  kind: z
    .enum(["mock-ui", "abstract", "none"])
    .describe("mock-ui: a stylised product window built from mockRows. abstract: decorative shapes. none: copy only."),
  mockTitle: z.string().max(40).optional().describe("Window title for the mock UI, e.g. 'Dashboard'."),
  mockRows: z
    .array(
      z.object({
        label: short(32),
        value: short(24),
        tone: z.enum(["neutral", "positive", "accent"]),
      }),
    )
    .max(5)
    .optional()
    .describe("3-5 rows of plausible product data shown inside the mock window."),
});

export const HeroPropsSchema = z.object({
  eyebrow: short(60, "Names the audience, e.g. 'For indie founders who ship weekly'."),
  headline: short(90, "Benefit-led headline, max ~10 words. No buzzwords."),
  headlineHighlight: z
    .string()
    .max(60)
    .optional()
    .describe("Exact substring of headline that gets the accent underline. Must appear verbatim in headline."),
  subheadline: short(220, "1-2 sentences: what it is, who it's for, why it's different. If chips are given, end mid-sentence so they complete it, e.g. 'through key metrics like'."),
  chips: z
    .array(short(18))
    .max(3)
    .optional()
    .describe("Up to 3 short nouns rendered as inline chips finishing the subheadline sentence, e.g. ['Visibility','Position','Sentiment']. Omit if unnatural."),
  primaryCta: short(30, "Button label that leads to the pricing section, e.g. 'See pricing'."),
  secondaryCta: z.string().max(30).optional().describe("Optional low-commitment link, e.g. 'How it works'."),
  visual: HeroVisualSchema,
});

export const HeroSectionSchema = baseSection("hero", [...HERO_VARIANTS]).extend({
  props: HeroPropsSchema,
});
export type HeroSection = z.infer<typeof HeroSectionSchema>;
export type HeroProps = z.infer<typeof HeroPropsSchema>;
