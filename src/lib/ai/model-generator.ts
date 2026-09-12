import { generateText, NoObjectGeneratedError, Output, streamText, zodSchema, type FlexibleSchema } from "ai";
import { AiPageDocumentSchema, PageDocumentSchema, SECTION_SCHEMAS, repairDocument, type Section } from "@/lib/page-schema";
import { resolveModel, type ProviderName } from "./client";
import { BRIEF_SYSTEM, DOCUMENT_SYSTEM, SECTION_SYSTEM, briefUserMessage, documentUserMessage, sectionUserMessage } from "./prompts";
import { IdeaBriefSchema, type DocumentStream, type GenerationUsage, type IdeaBrief, type IdeaInput, type PageGenerator, type SectionContext } from "./types";

const MAX_OUTPUT_TOKENS = 16384;

/**
 * Gemini's native `responseSchema` (an OpenAPI subset) rejects the full PageDocument schema
 * as too large (400 INVALID_ARGUMENT once ~5 section variants are in the union). For Gemini
 * we keep JSON mode on but disable the native schema and embed the JSON Schema in the prompt;
 * the AI SDK still validates the parsed output against Zod. Anthropic uses native structured output.
 */
function providerOptionsFor(provider: ProviderName, opts: { thinking: "minimal" | "low" | "medium"; nativeSchema: boolean }) {
  if (provider === "google") {
    return { google: { structuredOutputs: opts.nativeSchema, thinkingConfig: { thinkingLevel: opts.thinking } } };
  }
  return undefined;
}

function schemaPromptBlock(schema: FlexibleSchema<unknown>): string {
  const json = JSON.stringify(zodSchema(schema as never).jsonSchema);
  return `\n\nRespond with a single JSON object and nothing else. It must validate against this JSON Schema exactly (respect every enum, minLength/maxLength, minItems/maxItems and required list):\n${json}`;
}

export class GenerationError extends Error {
  constructor(
    message: string,
    public readonly status: number = 500,
    public readonly retryable = false,
  ) {
    super(message);
  }
}

/** Map provider errors into something the UI can act on (429 → retry later, 401 → key problem). */
function toGenerationError(e: unknown): GenerationError {
  if (e instanceof GenerationError) return e;
  const msg = e instanceof Error ? e.message : String(e);
  const status = (e as { statusCode?: number; status?: number })?.statusCode ?? (e as { status?: number })?.status;
  if (status === 429 || /quota|rate limit|resource exhausted/i.test(msg)) {
    return new GenerationError("The AI provider is rate-limiting requests right now. Wait a minute and try again.", 429, true);
  }
  if (status === 401 || status === 403 || /api key/i.test(msg)) {
    return new GenerationError("The AI provider rejected the API key. Check the key in .env.local.", 401);
  }
  if (NoObjectGeneratedError.isInstance(e)) {
    return new GenerationError("The model returned something that wasn't a valid page. Try again or rephrase the idea.", 502, true);
  }
  return new GenerationError(msg || "Generation failed.", 500, true);
}

/** Vercel AI SDK-backed generator; the provider (Gemini / Claude) is decided by env. */
export class ModelGenerator implements PageGenerator {
  readonly name: string;
  private readonly model;
  private readonly id: string;
  private readonly provider: Exclude<ProviderName, "mock">;

  constructor(provider: Exclude<ProviderName, "mock">) {
    const r = resolveModel(provider);
    this.model = r.model;
    this.id = r.id;
    this.provider = provider;
    this.name = `${provider}:${r.id}`;
  }

  /** Native schema is fine for small schemas (brief, single section); the full document needs the prompt route on Gemini. */
  private systemFor(base: string, schema: FlexibleSchema<unknown>, large: boolean) {
    const native = !(this.provider === "google" && large);
    return { system: native ? base : base + schemaPromptBlock(schema), providerOptions: providerOptionsFor(this.provider, { thinking: "low", nativeSchema: native }) };
  }

  async brief(input: IdeaInput) {
    const t0 = Date.now();
    try {
      const cfg = this.systemFor(BRIEF_SYSTEM, IdeaBriefSchema, false);
      const r = await generateText({
        model: this.model,
        system: cfg.system,
        providerOptions: cfg.providerOptions,
        prompt: briefUserMessage(input),
        output: Output.object({ schema: IdeaBriefSchema, name: "IdeaBrief" }),
        maxOutputTokens: 4096,
      });
      return { brief: r.output, usage: this.usage(r.usage, t0) };
    } catch (e) {
      throw toGenerationError(e);
    }
  }

  document(input: IdeaInput, brief: IdeaBrief): DocumentStream {
    const t0 = Date.now();
    const cfg = this.systemFor(DOCUMENT_SYSTEM, AiPageDocumentSchema, true);
    const result = streamText({
      model: this.model,
      system: cfg.system,
      providerOptions: cfg.providerOptions,
      prompt: documentUserMessage(input, brief),
      output: Output.object({ schema: AiPageDocumentSchema, name: "PageDocument" }),
      maxOutputTokens: MAX_OUTPUT_TOKENS,
    });

    const final = (async () => {
      try {
        const raw = await result.output;
        const doc = repairDocument(raw);
        return { doc, usage: this.usage(await result.usage, t0) };
      } catch (e) {
        // A schema miss is usually one field out of bounds; try a one-shot non-streamed retry with the issues attached.
        if (NoObjectGeneratedError.isInstance(e)) {
          const issues = e.cause instanceof Error ? e.cause.message : String(e.cause ?? "");
          const retry = await this.retryDocument(input, brief, issues, t0);
          if (retry) return retry;
        }
        throw toGenerationError(e);
      }
    })();

    return { partials: result.partialOutputStream, final };
  }

  private async retryDocument(input: IdeaInput, brief: IdeaBrief, issues: string, t0: number) {
    try {
      const cfg = this.systemFor(DOCUMENT_SYSTEM, AiPageDocumentSchema, true);
      const r = await generateText({
        model: this.model,
        system: cfg.system,
        providerOptions: cfg.providerOptions,
        prompt: `${documentUserMessage(input, brief)}\n\nYour previous attempt failed schema validation with these issues — fix them:\n${issues.slice(0, 2000)}`,
        output: Output.object({ schema: AiPageDocumentSchema, name: "PageDocument" }),
        maxOutputTokens: MAX_OUTPUT_TOKENS,
      });
      return { doc: repairDocument(r.output), usage: this.usage(r.usage, t0) };
    } catch {
      return null;
    }
  }

  async section(ctx: SectionContext) {
    const t0 = Date.now();
    const current = ctx.doc.sections.find((s) => s.id === ctx.sectionId);
    if (!current) throw new GenerationError("Section not found", 404);
    // Union of section schemas is too wide for the generic; we re-narrow the result below.
    const schema = SECTION_SCHEMAS[current.type] as unknown as FlexibleSchema<Section>;
    const others = ctx.doc.sections
      .filter((s) => s.id !== ctx.sectionId)
      .map((s) => `- ${s.type} (${s.variant}): ${summarize(s)}`)
      .join("\n");
    try {
      const cfg = this.systemFor(SECTION_SYSTEM, schema, false);
      const r = await generateText({
        model: this.model,
        system: cfg.system,
        providerOptions: cfg.providerOptions,
        prompt: sectionUserMessage({ brief: ctx.brief, sectionJson: JSON.stringify(current, null, 2), others, instruction: ctx.instruction }),
        output: Output.object({ schema, name: `Section_${current.type.replace("-", "_")}` }),
        maxOutputTokens: 6000,
      });
      const section = { ...r.output, id: current.id, type: current.type } as Section;
      // Round-trip through the document validator so invariants (highlight substring, tier ids) hold.
      const doc = repairDocument({ ...ctx.doc, sections: ctx.doc.sections.map((s) => (s.id === current.id ? section : s)) });
      const repaired = doc.sections.find((s) => s.id === current.id)!;
      PageDocumentSchema.parse(doc);
      return { section: repaired, usage: this.usage(r.usage, t0) };
    } catch (e) {
      throw toGenerationError(e);
    }
  }

  private usage(u: { inputTokens?: number; outputTokens?: number } | undefined, t0: number): GenerationUsage {
    return { model: this.id, inputTokens: u?.inputTokens, outputTokens: u?.outputTokens, ms: Date.now() - t0 };
  }
}

function summarize(s: Section): string {
  const p = s.props as Record<string, unknown>;
  const title = (p.title ?? p.headline ?? "") as string;
  return title ? String(title).slice(0, 80) : s.id;
}
