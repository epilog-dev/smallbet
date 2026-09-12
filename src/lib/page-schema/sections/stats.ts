import { z } from "zod";
import { baseSection, short } from "./shared";

export const STATS_VARIANTS = ["row", "cards"] as const;

/**
 * Big numbers with labels. Pre-launch these are facts about the problem or the founder
 * ("6 h a month lost to bookkeeping", "0 charged until launch"), never invented traction.
 */
export const StatsPropsSchema = z.object({
  title: z.string().max(80).optional().describe("Optional framing line, e.g. 'The cost of doing this by hand'."),
  items: z
    .array(
      z.object({
        value: short(12, "The number, short: '6 h', '32%', '$0', '3×'."),
        label: short(60, "What the number is, e.g. 'lost per month to categorising'."),
        note: z.string().max(60).optional().describe("Source or qualifier, e.g. 'founder's own books, 2024'."),
      }),
    )
    .min(2)
    .max(4),
});

export const StatsSectionSchema = baseSection("stats", [...STATS_VARIANTS]).extend({
  props: StatsPropsSchema,
});
export type StatsSection = z.infer<typeof StatsSectionSchema>;
