import { z } from "zod";
import { baseSection, short } from "./shared";

export const FAQ_VARIANTS = ["accordion", "two-column"] as const;

export const FaqPropsSchema = z.object({
  title: short(60),
  items: z
    .array(
      z.object({
        question: short(120),
        answer: short(320, "Direct answer. Cover pricing, timeline, refunds/risk, and 'why not X' objections."),
      }),
    )
    .min(3)
    .max(6),
});

export const FaqSectionSchema = baseSection("faq", [...FAQ_VARIANTS]).extend({
  props: FaqPropsSchema,
});
export type FaqSection = z.infer<typeof FaqSectionSchema>;
