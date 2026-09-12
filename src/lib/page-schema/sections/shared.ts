import { z } from "zod";

/** Short, stable identifier for a section. The AI proposes one; `repair()` guarantees uniqueness. */
export const SectionIdSchema = z
  .string()
  .min(1)
  .max(40)
  .describe("Short unique id for this section, e.g. 'hero', 'features-1'.");

export const short = (max: number, desc?: string) =>
  desc ? z.string().min(1).max(max).describe(desc) : z.string().min(1).max(max);

export const baseSection = <T extends string, V extends [string, ...string[]]>(type: T, variants: V) =>
  z.object({
    id: SectionIdSchema,
    type: z.literal(type),
    variant: z.enum(variants),
    hidden: z.boolean().describe("Hidden sections are kept in the document but not rendered."),
  });
