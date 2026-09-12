import { z } from "zod";
import { baseSection, short } from "./shared";

export const CTA_BAND_VARIANTS = ["simple", "with-progress"] as const;

export const CtaBandPropsSchema = z.object({
  headline: short(80),
  subheadline: z.string().max(160).optional(),
  ctaLabel: short(30, "Scrolls to the pricing section."),
});

export const CtaBandSectionSchema = baseSection("cta-band", [...CTA_BAND_VARIANTS]).extend({
  props: CtaBandPropsSchema,
});
export type CtaBandSection = z.infer<typeof CtaBandSectionSchema>;
