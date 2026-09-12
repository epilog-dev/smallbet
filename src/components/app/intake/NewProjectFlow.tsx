"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createProjectAction } from "@/app/(app)/app/actions";
import { AlertCircle, Check, Loader2, PenLine, RotateCcw } from "lucide-react";
import { PageRenderer } from "@/components/page/PageRenderer";
import { Button } from "@/components/ui/button";
import type { IdeaBrief, IdeaInput } from "@/lib/ai/types";
import { GenerateClientError, requestBrief, streamDocument, type Engine } from "@/lib/generate-client";
import { coercePartialDocument, SECTION_LABELS, type PageDocument } from "@/lib/page-schema";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { FramedPreview, type FramedPreviewHandle } from "../FramedPreview";
import { BriefCard } from "./BriefCard";
import { IdeaForm } from "./IdeaForm";
import { progress } from "@/lib/progress";

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
  /** `step` says what to redo; `offerTemplate` is false when the failure wasn't the model's (e.g. saving). */
  const [error, setError] = useState<{ message: string; retryable: boolean; step: "brief" | "document"; offerTemplate: boolean } | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const previewRef = useRef<FramedPreviewHandle>(null);
  const isMobile = useIsMobile();

  // On a phone the page scrolls as a whole, so follow the newest section as it streams in.
  const sectionCount = doc?.sections.length ?? 0;
  useEffect(() => {
    if (!isMobile || phase !== "building" || sectionCount === 0) return;
    const last = doc?.sections[sectionCount - 1];
    if (!last) return;
    const t = setTimeout(() => previewRef.current?.scrollToSelector(`[data-section="${CSS.escape(last.id)}"]`, 96), 120);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionCount, isMobile, phase]);

  const fail = (e: unknown, step: "brief" | "document") => {
    if (e instanceof DOMException && e.name === "AbortError") return;
    const err = e instanceof GenerateClientError ? e : null;
    setError({ message: err?.message ?? (e instanceof Error ? e.message : "Something went wrong"), retryable: err?.retryable ?? true, step, offerTemplate: true });
  };

  const analyse = useCallback(async (next: IdeaInput, engine: Engine = "ai") => {
    setInput(next);
    setBusy(true);
    setError(null);
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      const r = await requestBrief(next, ac.signal, engine);
      setBrief(r.brief);
      setGeneratorName(r.generator);
      setPhase("brief");
    } catch (e) {
      fail(e, "brief");
    } finally {
      setBusy(false);
    }
  }, []);

  const build = useCallback(async (engine: Engine = "ai") => {
    if (!input || !brief) return;
    setBusy(true);
    setError(null);
    setDoc(null);
    setPhase("building");
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      for await (const ev of streamDocument(input, brief, ac.signal, engine)) {
        const withBrand = (d: PageDocument): PageDocument => (brief.theme.accentHex ? { ...d, theme: { ...d.theme, accentHex: brief.theme.accentHex } } : d);
        if (ev.type === "partial") {
          const partial = coercePartialDocument(ev.doc, brief.productName);
          if (partial) setDoc(withBrand(partial));
        } else if (ev.type === "final") {
          const final = withBrand(ev.doc);
          setDoc(final);
          setGeneratorName(ev.generator);
          setPhase("done");
          setSaving(true);
          try {
            const { id } = await createProjectAction({
              idea: input,
              brief,
              document: final,
              usage: { generator: ev.generator, inputTokens: ev.usage.inputTokens, outputTokens: ev.usage.outputTokens, ms: ev.usage.ms },
            });
            progress.start();
            router.push(`/app/projects/${id}/edit`);
          } catch (e) {
            // The page was written; only saving failed. That's not an AI problem, so no template offer.
            setSaving(false);
            setError({ message: e instanceof Error ? e.message : "Couldn't save the page.", retryable: true, step: "document", offerTemplate: false });
          }
        } else {
          setError({ message: ev.message, retryable: ev.retryable, step: "document", offerTemplate: true });
          setPhase("brief");
        }
      }
    } catch (e) {
      fail(e, "document");
      setPhase("brief");
    } finally {
      setBusy(false);
    }
  }, [input, brief, router]);

  const expectedSections = ["hero", "problem", "features", "steps", "pricing-intent", "faq", "cta-band"] as const;
  const haveTypes = new Set(doc?.sections.map((s) => s.type) ?? []);
  const building = phase === "building" || phase === "done";
  const haveCount = expectedSections.filter((t) => haveTypes.has(t)).length;

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-border px-4 text-xs text-muted-foreground">
        <Link href="/app" className="hover:text-foreground">
          ← Your ideas
        </Link>
        <p>
          {phase === "idea" && "Step 1 of 3 · Describe"}
          {phase === "brief" && "Step 2 of 3 · Confirm"}
          {(phase === "building" || phase === "done") && "Step 3 of 3 · Build"}
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Phone, while building: a one-line stepper pinned above the preview. */}
        {building && brief && (
          <div className="sticky top-0 z-10 border-b border-border bg-background/95 px-4 py-2.5 backdrop-blur lg:hidden">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                {phase === "done" ? <Check className="size-4 shrink-0" strokeWidth={3} /> : <Loader2 className="size-4 shrink-0 animate-spin" />}
                <span className="truncate">{phase === "done" ? (saving ? "Saving…" : "Your page is ready") : `Writing ${brief.productName}…`}</span>
              </span>
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                {haveCount} of {expectedSections.length}
              </span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-foreground transition-[width] duration-300" style={{ width: `${(haveCount / expectedSections.length) * 100}%` }} />
            </div>
          </div>
        )}

        {/* left: controls (on phones this drops below the preview while building) */}
        <aside className={cn("w-full shrink-0 border-b border-border p-5 sm:p-6 lg:w-[440px] lg:overflow-y-auto lg:border-b-0 lg:border-r", building && "order-2 lg:order-none")}>
          {error && (
            <div className="mb-5 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
              <div className="flex-1">
                <p className="font-medium">{!error.offerTemplate ? "Couldn't save the page." : error.step === "brief" ? "The AI couldn't read your idea." : "The AI couldn't write the page."}</p>
                <p className="mt-0.5 text-muted-foreground">{error.message}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {error.retryable && (
                    <Button size="sm" variant="outline" disabled={busy} onClick={() => (error.step === "brief" && input ? void analyse(input) : void build())}>
                      <RotateCcw /> Try again
                    </Button>
                  )}
                  {error.offerTemplate && (
                    <Button size="sm" variant="outline" disabled={busy} onClick={() => (error.step === "brief" && input ? void analyse(input, "template") : void build("template"))}>
                      <PenLine /> Continue without AI
                    </Button>
                  )}
                </div>
                {error.offerTemplate && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Without AI you get a sensible template built from what you typed — every line is editable, and you can ask the AI to rewrite any section later.
                  </p>
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
              <IdeaForm initial={input ?? undefined} busy={busy} onSubmit={(next) => void analyse(next)} />
            </>
          )}

          {phase === "brief" && brief && (
            <BriefCard brief={brief} onChange={setBrief} onBack={() => setPhase("idea")} onBuild={() => void build()} busy={busy} generatorName={generatorName} />
          )}

          {(phase === "building" || phase === "done") && brief && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Step 3 of 3</p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight">{phase === "done" ? "Your page is ready" : `Writing ${brief.productName}…`}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {phase === "done" ? "Saving it to your account and opening the editor." : isMobile ? "Sections appear above as they're written." : "Sections appear on the right as they're written."}
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
                    <Button variant="outline" onClick={() => void build()}>
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

        {/* right: preview (first on phones; hidden there until something exists to show) */}
        <main className={cn("relative flex-1 bg-muted/40 p-3 sm:p-6 lg:overflow-y-auto", !doc && "hidden lg:block", building && "order-1 lg:order-none")}>
          {doc ? (
            <div className="mx-auto max-w-[1100px] overflow-hidden rounded-lg border border-border bg-background shadow-sm">
              <FramedPreview ref={previewRef} width={1280} narrowWidth={390}>
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
