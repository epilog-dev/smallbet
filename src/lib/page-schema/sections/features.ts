import { z } from "zod";
import { IconNameSchema } from "../icons";
import { baseSection, short } from "./shared";

export const FEATURES_VARIANTS = ["grid", "alternating", "list"] as const;

export const FeaturesPropsSchema = z.object({
  title: short(80),
  subtitle: z.string().max(160).optional(),
  items: z
    .array(
      z.object({
        icon: IconNameSchema,
        title: short(50),
        description: short(180, "Concrete outcome, not a feature name. One or two sentences."),
      }),
    )
    .min(3)
    .max(6),
});

export const FeaturesSectionSchema = baseSection("features", [...FEATURES_VARIANTS]).extend({
  props: FeaturesPropsSchema,
});
export type FeaturesSection = z.infer<typeof FeaturesSectionSchema>;
