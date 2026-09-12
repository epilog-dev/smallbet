import { z } from "zod";
import { baseSection, short } from "./shared";

export const PROBLEM_VARIANTS = ["cards", "checklist"] as const;

export const ProblemPropsSchema = z.object({
  title: short(80, "Names the pain plainly, e.g. 'Validation today is guesswork'."),
  items: z
    .array(
      z.object({
        title: short(60),
        description: short(160, "Plain statement of the pain. No drama, no exclamation marks."),
      }),
    )
    .min(2)
    .max(4),
});

export const ProblemSectionSchema = baseSection("problem", [...PROBLEM_VARIANTS]).extend({
  props: ProblemPropsSchema,
});
export type ProblemSection = z.infer<typeof ProblemSectionSchema>;
