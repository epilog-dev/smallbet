import type { IdeaBrief, IdeaInput, GenerationUsage } from "@/lib/ai/types";
import type { PageDocument, Section } from "@/lib/page-schema";

export class GenerateClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly retryable: boolean,
  ) {
    super(message);
  }
}

async function readError(res: Response): Promise<GenerateClientError> {
  const body = await res.json().catch(() => ({}));
  return new GenerateClientError(body.error ?? `Request failed (${res.status})`, res.status, body.retryable ?? res.status >= 500);
}

export type Engine = "ai" | "template";

export async function requestBrief(input: IdeaInput, signal?: AbortSignal, engine: Engine = "ai") {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ step: "brief", input, engine }),
    signal,
  });
  if (!res.ok) throw await readError(res);
  return (await res.json()) as { brief: IdeaBrief; usage: GenerationUsage; generator: string };
}

export async function requestSection(args: { brief: IdeaBrief; doc: PageDocument; sectionId: string; instruction?: string }, signal?: AbortSignal) {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ step: "section", ...args }),
    signal,
  });
  if (!res.ok) throw await readError(res);
  return (await res.json()) as { section: Section; usage: GenerationUsage; generator: string };
}

export type DocumentEvent =
  | { type: "partial"; doc: unknown }
  | { type: "final"; doc: PageDocument; usage: GenerationUsage; generator: string }
  | { type: "error"; message: string; retryable: boolean };

/** Streams NDJSON events from the document step. */
export async function* streamDocument(input: IdeaInput, brief: IdeaBrief, signal?: AbortSignal, engine: Engine = "ai"): AsyncGenerator<DocumentEvent> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ step: "document", input, brief, engine }),
    signal,
  });
  if (!res.ok || !res.body) throw await readError(res);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (line) yield JSON.parse(line) as DocumentEvent;
    }
  }
  if (buf.trim()) yield JSON.parse(buf) as DocumentEvent;
}
