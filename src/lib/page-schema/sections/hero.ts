import { z } from "zod";
import { baseSection, short } from "./shared";

export const HERO_VARIANTS = ["centered", "split", "minimal"] as const;

export const VISUAL_KINDS = ["dashboard", "list", "mobile", "abstract", "none"] as const;
export type VisualKind = (typeof VISUAL_KINDS)[number];

export const MockRowSchema = z.object({
  label: short(32, "Row name: a customer, recipe, request, metric…"),
  value: short(24, "The number or status shown for it."),
  tone: z.enum(["neutral", "positive", "accent"]),
});

/**
 * A stylised product window drawn from data so it looks like *this* product.
 * Every label is filled by the AI with the product's real nouns.
 */
export const HeroVisualSchema = z.object({
  kind: z
    .enum(VISUAL_KINDS)
    .describe(
      "dashboard: analytics/ops/B2B tools (sidebar, chart, ranked table). list: inbox/queue/CRM/support/workflow tools (list + detail pane). mobile: consumer or on-the-go apps (phone frame with cards and bottom tabs). abstract: services with no UI. none: copy only.",
    ),
  title: z.string().max(40).optional().describe("App or window title, e.g. 'Pantry — This week'."),
  headline: z.string().max(70).optional().describe("Status line at the top of the content, e.g. 'Week 37 · 5 of 5 dinners planned' or 'Inbox · 12 waiting'."),
  nav: z.array(short(18)).max(6).optional().describe("3–6 navigation items using the product's own objects, e.g. ['Recipes','Pantry','Lists','Stores']. Sidebar on dashboard/list, bottom tabs on mobile."),
  tabs: z.array(short(16)).max(3).optional().describe("2–3 segment tabs above the main content, e.g. ['This week','Saved','History']."),
  series: z.array(short(16)).max(4).optional().describe("dashboard only: 2–4 chart line labels, e.g. ['Spend','Waste','Meals cooked']."),
  axis: z.enum(["months", "weeks", "days"]).optional().describe("dashboard only: x-axis unit."),
  actions: z.array(short(22)).max(2).optional().describe("1–2 button labels, e.g. ['Add recipe','Export list']."),
  rows: z.array(MockRowSchema).max(6).optional().describe("4–6 rows: the table (dashboard), list items (list) or cards (mobile). Use plausible, specific data."),
});
export type HeroVisual = z.infer<typeof HeroVisualSchema>;

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
