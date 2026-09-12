import { generateText, NoObjectGeneratedError, Output, streamText, type FlexibleSchema } from "ai";
import { AiPageDocumentSchema, PageDocumentSchema, SECTION_SCHEMAS, repairDocument, type Section } from "@/lib/page-schema";
import { resolveModel, type ProviderName } from "./client";
import { BRIEF_SYSTEM, DOCUMENT_SYSTEM, SECTION_SYSTEM, briefUserMessage, documentUserMessage, sectionUserMessage } from "./prompts";
import { IdeaBriefSchema, type DocumentStream, type GenerationUsage, type IdeaBrief, type IdeaInput, type PageGenerator, type SectionContext } from "./types";

const MAX_OUTPUT_TOKENS = 8192;

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

  constructor(provider: Exclude<ProviderName, "mock">) {
    const r = resolveModel(provider);
    this.model = r.model;
    this.id = r.id;
    this.name = `${provider}:${r.id}`;
  }

  async brief(input: IdeaInput) {
    const t0 = Date.now();
    try {
      const r = await generateText({
        model: this.model,
        system: BRIEF_SYSTEM,
        prompt: briefUserMessage(input),
        output: Output.object({ schema: IdeaBriefSchema, name: "IdeaBrief" }),
        maxOutputTokens: 2048,
      });
      return { brief: r.output, usage: this.usage(r.usage, t0) };
    } catch (e) {
      throw toGenerationError(e);
    }
  }

  document(input: IdeaInput, brief: IdeaBrief): DocumentStream {
    const t0 = Date.now();
    const result = streamText({
      model: this.model,
      system: DOCUMENT_SYSTEM,
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
      const r = await generateText({
        model: this.model,
        system: DOCUMENT_SYSTEM,
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
      const r = await generateText({
        model: this.model,
        system: SECTION_SYSTEM,
        prompt: sectionUserMessage({ brief: ctx.brief, sectionJson: JSON.stringify(current, null, 2), others, instruction: ctx.instruction }),
        output: Output.object({ schema, name: `Section_${current.type.replace("-", "_")}` }),
        maxOutputTokens: 3000,
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
