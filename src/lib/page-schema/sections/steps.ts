import { z } from "zod";
import { baseSection, short } from "./shared";

export const STEPS_VARIANTS = ["numbered", "timeline"] as const;

export const StepsPropsSchema = z.object({
  title: short(80, "e.g. 'How it works'."),
  items: z
    .array(
      z.object({
        title: short(50),
        description: short(160),
      }),
    )
    .min(3)
    .max(4),
});

export const StepsSectionSchema = baseSection("steps", [...STEPS_VARIANTS]).extend({
  props: StepsPropsSchema,
});
export type StepsSection = z.infer<typeof StepsSectionSchema>;
