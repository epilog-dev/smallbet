"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createProjectAction } from "@/app/(app)/app/actions";
import { AlertCircle, Check, Loader2, RotateCcw } from "lucide-react";
import { PageRenderer } from "@/components/page/PageRenderer";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "../ThemeToggle";
import type { IdeaBrief, IdeaInput } from "@/lib/ai/types";
import { GenerateClientError, requestBrief, streamDocument } from "@/lib/generate-client";
import { coercePartialDocument, SECTION_LABELS, type PageDocument } from "@/lib/page-schema";
import { cn } from "@/lib/utils";
import { FramedPreview } from "../FramedPreview";
import { BriefCard } from "./BriefCard";
import { IdeaForm } from "./IdeaForm";

type Phase = "idea" | "brief" | "building" | "done";

export function NewProjectFlow() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idea");
  const [saving, setSaving] = useState(false);
  const [input, setInput] = useState<IdeaInput | null>(null);
  const [brief, setBrief] = useState<IdeaBrief | null>(null);
  const [generatorName, setGeneratorName] = useState<string | undefined>();
  const [doc, setDoc] = useState<PageDocument | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ message: string; retryable: boolean } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fail = (e: unknown) => {
    if (e instanceof DOMException && e.name === "AbortError") return;
    const err = e instanceof GenerateClientError ? e : null;
    setError({ message: err?.message ?? (e instanceof Error ? e.message : "Something went wrong"), retryable: err?.retryable ?? true });
  };

  const analyse = useCallback(async (next: IdeaInput) => {
    setInput(next);
    setBusy(true);
    setError(null);
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      const r = await requestBrief(next, ac.signal);
      setBrief(r.brief);
      setGeneratorName(r.generator);
      setPhase("brief");
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }, []);

  const build = useCallback(async () => {
    if (!input || !brief) return;
    setBusy(true);
    setError(null);
    setDoc(null);
    setPhase("building");
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      for await (const ev of streamDocument(input, brief, ac.signal)) {
        if (ev.type === "partial") {
          const partial = coercePartialDocument(ev.doc, brief.productName);
          if (partial) setDoc(partial);
        } else if (ev.type === "final") {
          setDoc(ev.doc);
          setGeneratorName(ev.generator);
          setPhase("done");
          setSaving(true);
          try {
            const { id } = await createProjectAction({
              idea: input,
              brief,
              document: ev.doc,
              usage: { generator: ev.generator, inputTokens: ev.usage.inputTokens, outputTokens: ev.usage.outputTokens, ms: ev.usage.ms },
            });
            router.push(`/app/projects/${id}/edit`);
          } catch (e) {
            setSaving(false);
            fail(e);
          }
        } else {
          setError({ message: ev.message, retryable: ev.retryable });
          setPhase("brief");
        }
      }
    } catch (e) {
      fail(e);
      setPhase("brief");
    } finally {
      setBusy(false);
    }
  }, [input, brief, router]);

  const expectedSections = ["hero", "problem", "features", "steps", "pricing-intent", "faq", "cta-band"] as const;
  const haveTypes = new Set(doc?.sections.map((s) => s.type) ?? []);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
        <Link href="/app" className="text-sm font-semibold tracking-tight">
          validate
        </Link>
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted-foreground">
            {phase === "idea" && "Step 1 of 3 · Describe"}
            {phase === "brief" && "Step 2 of 3 · Confirm"}
            {(phase === "building" || phase === "done") && "Step 3 of 3 · Build"}
          </p>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* left: controls */}
        <aside className="w-full shrink-0 overflow-y-auto border-b border-border p-6 lg:w-[440px] lg:border-b-0 lg:border-r">
          {error && (
            <div className="mb-5 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
              <div className="flex-1">
                <p>{error.message}</p>
                {error.retryable && phase === "brief" && (
                  <Button size="sm" variant="outline" className="mt-2" onClick={build}>
                    <RotateCcw /> Try again
                  </Button>
                )}
              </div>
            </div>
          )}

          {phase === "idea" && (
            <>
              <div className="mb-6">
                <h1 className="text-xl font-semibold tracking-tight">Describe your idea</h1>
                <p className="mt-1 text-sm text-muted-foreground">We&apos;ll turn it into a page that asks people what they&apos;d pay.</p>
              </div>
              <IdeaForm initial={input ?? undefined} busy={busy} onSubmit={analyse} />
            </>
          )}

          {phase === "brief" && brief && (
            <BriefCard brief={brief} onChange={setBrief} onBack={() => setPhase("idea")} onBuild={build} busy={busy} generatorName={generatorName} />
          )}

          {(phase === "building" || phase === "done") && brief && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Step 3 of 3</p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight">{phase === "done" ? "Your page is ready" : `Writing ${brief.productName}…`}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {phase === "done" ? "Saving it to your account and opening the editor." : "Sections appear on the right as they're written."}
                </p>
              </div>
              <ol className="space-y-1.5">
                {expectedSections.map((t) => {
                  const have = haveTypes.has(t);
                  return (
                    <li key={t} className={cn("flex items-center gap-2.5 text-sm", have ? "text-foreground" : "text-muted-foreground")}>
                      <span className={cn("inline-flex size-5 items-center justify-center rounded-full border", have ? "border-foreground bg-foreground text-background" : "border-border")}>
                        {have ? <Check className="size-3" strokeWidth={3} /> : phase === "building" ? <Loader2 className="size-3 animate-spin opacity-50" /> : null}
                      </span>
                      {SECTION_LABELS[t]}
                    </li>
                  );
                })}
                {doc?.sections.some((s) => s.type === "founder-note") && (
                  <li className="flex items-center gap-2.5 text-sm">
                    <span className="inline-flex size-5 items-center justify-center rounded-full border border-foreground bg-foreground text-background">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                    Founder note
                  </li>
                )}
              </ol>
              {phase === "done" && (
                <div className="flex flex-col gap-2">
                  <Button size="lg" disabled={saving}>
                    {saving ? <Loader2 className="animate-spin" /> : null}
                    {saving ? "Saving…" : "Opening editor…"}
                  </Button>
                  {!saving && (
                    <Button variant="outline" onClick={build}>
                      <RotateCcw /> Regenerate
                    </Button>
                  )}
                </div>
              )}
              {phase === "building" && (
                <Button
                  variant="outline"
                  onClick={() => {
                    abortRef.current?.abort();
                    setBusy(false);
                    setPhase("brief");
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          )}
        </aside>

        {/* right: preview */}
        <main className="relative flex-1 overflow-y-auto bg-muted/40 p-4 sm:p-6">
          {doc ? (
            <div className="mx-auto max-w-[1100px] overflow-hidden rounded-lg border border-border bg-background shadow-sm">
              <FramedPreview width={1280}>
                <PageRenderer doc={doc} mode="preview" noReveal />
              </FramedPreview>
            </div>
          ) : (
            <div className="flex h-full min-h-[50vh] items-center justify-center text-center">
              <div className="max-w-xs">
                <div className="mx-auto mb-4 grid size-10 grid-cols-2 gap-0.5 rounded-md border border-border bg-background p-1.5">
                  <span className="rounded-sm bg-foreground/80" />
                  <span className="rounded-sm bg-foreground/20" />
                  <span className="rounded-sm bg-foreground/20" />
                  <span className="rounded-sm bg-foreground/80" />
                </div>
                <p className="text-sm font-medium">Your page will appear here</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {phase === "idea" ? "Describe the idea to get started." : phase === "brief" ? "Confirm the brief, then build." : "Starting…"}
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
