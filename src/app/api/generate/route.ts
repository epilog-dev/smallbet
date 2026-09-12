import { NextResponse } from "next/server";
import { z } from "zod";
import { createGenerator, GenerationError, IdeaBriefSchema, IdeaInputSchema } from "@/lib/ai/generator";
import { PageDocumentSchema } from "@/lib/page-schema";

export const runtime = "nodejs";
export const maxDuration = 120;

const BodySchema = z.discriminatedUnion("step", [
  z.object({ step: z.literal("brief"), input: IdeaInputSchema }),
  z.object({ step: z.literal("document"), input: IdeaInputSchema, brief: IdeaBriefSchema }),
  z.object({
    step: z.literal("section"),
    brief: IdeaBriefSchema,
    doc: PageDocumentSchema,
    sectionId: z.string().min(1),
    instruction: z.string().max(400).optional(),
  }),
]);

/** Minimum gap between streamed partial snapshots so the client isn't flooded. */
const PARTIAL_INTERVAL_MS = 120;

function errorResponse(e: unknown) {
  const err = e instanceof GenerationError ? e : new GenerationError(e instanceof Error ? e.message : "Generation failed");
  return NextResponse.json({ error: err.message, retryable: err.retryable }, { status: err.status });
}

export async function POST(req: Request) {
  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", issues: parsed.error.issues }, { status: 422 });
  }
  const body = parsed.data;
  const gen = createGenerator();

  if (body.step === "brief") {
    try {
      const r = await gen.brief(body.input);
      return NextResponse.json({ ...r, generator: gen.name });
    } catch (e) {
      return errorResponse(e);
    }
  }

  if (body.step === "section") {
    try {
      const r = await gen.section({ brief: body.brief, doc: body.doc, sectionId: body.sectionId, instruction: body.instruction });
      return NextResponse.json({ ...r, generator: gen.name });
    } catch (e) {
      return errorResponse(e);
    }
  }

  // step === "document": stream NDJSON — {type:"partial",doc} … {type:"final",doc,usage} | {type:"error",message}
  const stream = gen.document(body.input, body.brief);
  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (obj: unknown) => controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      let lastSent = 0;
      let pending: unknown = null;
      let timer: ReturnType<typeof setTimeout> | null = null;
      const flush = () => {
        if (pending !== null) {
          send({ type: "partial", doc: pending });
          pending = null;
          lastSent = Date.now();
        }
        timer = null;
      };
      try {
        // Consume partials; the final promise settles independently.
        void (async () => {
          try {
            for await (const p of stream.partials) {
              pending = p;
              const wait = PARTIAL_INTERVAL_MS - (Date.now() - lastSent);
              if (wait <= 0) flush();
              else if (!timer) timer = setTimeout(flush, wait);
            }
          } catch {
            /* the final promise reports the error */
          }
        })();
        const r = await stream.final;
        if (timer) clearTimeout(timer);
        send({ type: "final", doc: r.doc, usage: r.usage, generator: gen.name });
      } catch (e) {
        if (timer) clearTimeout(timer);
        const err = e instanceof GenerationError ? e : null;
        send({ type: "error", message: err?.message ?? (e instanceof Error ? e.message : "Generation failed"), retryable: err?.retryable ?? true });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store", "x-generator": gen.name },
  });
}
