import { z } from "zod";
import { SectionSchema } from "./sections";
import { ThemeSchema } from "./theme";

export const PAGE_DOCUMENT_VERSION = 1 as const;

export const PageMetaSchema = z.object({
  productName: z.string().min(1).max(40),
  tagline: z.string().min(1).max(90).describe("One line under the logo / in social previews."),
  seoTitle: z.string().min(1).max(70),
  seoDescription: z.string().min(1).max(160),
});

export const PageNavSchema = z.object({
  logoText: z.string().min(1).max(30),
  ctaLabel: z.string().min(1).max(24).describe("Top-right button; scrolls to pricing."),
});

export const PageGoalSchema = z.object({
  targetResponses: z.number().int().min(5).max(1000),
  deadlineDays: z.number().int().min(7).max(90),
});

export const PageDocumentSchema = z.object({
  version: z.literal(PAGE_DOCUMENT_VERSION),
  meta: PageMetaSchema,
  theme: ThemeSchema,
  nav: PageNavSchema,
  goal: PageGoalSchema,
  sections: z
    .array(SectionSchema)
    .min(4)
    .max(8)
    .describe("Ordered top to bottom. Must start with a hero and contain exactly one pricing-intent section."),
});

export type PageDocument = z.infer<typeof PageDocumentSchema>;
export type PageMeta = z.infer<typeof PageMetaSchema>;
export type PageNav = z.infer<typeof PageNavSchema>;
export type PageGoal = z.infer<typeof PageGoalSchema>;

/**
 * Schema handed to the model. Identical to PageDocumentSchema today; kept separate
 * so we can relax constraints for generation (e.g. optional ids) without touching
 * what the editor and renderer rely on.
 */
export const AiPageDocumentSchema = PageDocumentSchema;
