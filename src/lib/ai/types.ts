import { z } from "zod";
import { AccentHueSchema, ColorModeSchema, CURRENCIES, INTERVALS, type PageDocument, type Section } from "@/lib/page-schema";

export const TONES = ["plain", "bold", "friendly", "premium"] as const;

/** What the founder types in. */
export const IdeaInputSchema = z.object({
  idea: z.string().min(12).max(1200),
  audience: z.string().max(200).optional(),
  priceHint: z.string().max(120).optional().describe("e.g. '$20/mo', 'one-time $99', 'free tier + $10'"),
  tone: z.enum(TONES).optional(),
});
export type IdeaInput = z.infer<typeof IdeaInputSchema>;

/** Step 1 output: a compact strategic read of the idea, confirmed by the founder before the page is built. */
export const IdeaBriefSchema = z.object({
  productName: z.string().min(1).max(30).describe("A short, pronounceable product name. Invent one if the idea has none."),
  nameIdeas: z.array(z.string().min(1).max(30)).min(2).max(4).describe("Alternative names."),
  audience: z.string().min(1).max(120).describe("Who it's for, specific. 'Solo consultants who bill hourly', not 'businesses'."),
  problem: z.string().min(1).max(220).describe("The pain in one plain sentence."),
  promise: z.string().min(1).max(160).describe("The core outcome in one sentence, no hype."),
  differentiators: z.array(z.string().min(1).max(120)).min(2).max(4),
  objections: z.array(z.string().min(1).max(120)).min(2).max(4).describe("Why a sceptic would not pay. Used for FAQ."),
  currency: z.enum(CURRENCIES),
  interval: z.enum(INTERVALS),
  suggestedTiers: z
    .array(z.object({ name: z.string().min(1).max(30), price: z.number().min(0).max(100000), blurb: z.string().min(1).max(90) }))
    .min(1)
    .max(3)
    .describe("Realistic price points anchored to the priceHint and market norms."),
  tone: z.enum(TONES),
  theme: z.object({ accent: AccentHueSchema, mode: ColorModeSchema }),
  heroVariant: z.enum(["centered", "split", "minimal"]).describe("centered for most; split when the product visual matters; minimal for services."),
});
export type IdeaBrief = z.infer<typeof IdeaBriefSchema>;

export interface GenerationUsage {
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  ms: number;
}

/** Streamed document generation: partial snapshots, then the final repaired document. */
export interface DocumentStream {
  partials: AsyncIterable<unknown>;
  final: Promise<{ doc: PageDocument; usage: GenerationUsage }>;
}

export interface SectionContext {
  brief: IdeaBrief;
  doc: PageDocument;
  sectionId: string;
  instruction?: string;
}

export interface PageGenerator {
  readonly name: string;
  brief(input: IdeaInput): Promise<{ brief: IdeaBrief; usage: GenerationUsage }>;
  document(input: IdeaInput, brief: IdeaBrief): DocumentStream;
  section(ctx: SectionContext): Promise<{ section: Section; usage: GenerationUsage }>;
}
