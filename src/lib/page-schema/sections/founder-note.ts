import { z } from "zod";
import { baseSection, short } from "./shared";

export const FOUNDER_NOTE_VARIANTS = ["letter", "quote"] as const;

export const FounderNotePropsSchema = z.object({
  title: z.string().max(60).optional().describe("e.g. 'Why I'm building this'."),
  body: z
    .array(short(320))
    .min(1)
    .max(4)
    .describe("Short first-person paragraphs. Honest, specific, no hype."),
  signature: short(60, "e.g. 'Sam, founder'."),
});

export const FounderNoteSectionSchema = baseSection("founder-note", [...FOUNDER_NOTE_VARIANTS]).extend({
  props: FounderNotePropsSchema,
});
export type FounderNoteSection = z.infer<typeof FounderNoteSectionSchema>;
