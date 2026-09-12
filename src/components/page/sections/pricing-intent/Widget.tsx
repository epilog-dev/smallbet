"use client";

import { Check } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { PriceTier, PricingIntentProps } from "@/lib/page-schema";
import { submitResponse, updateResponse, type RespondStats, type ResponseKind } from "@/lib/respond-client";
import { cn } from "@/lib/utils";
import { VpButton } from "../../primitives/Button";
import { VpModal } from "../../primitives/Modal";
import type { PageContextValue } from "../../types";

type Step =
  | { name: "choose" }
  | { name: "reveal"; responseId: string; kind: ResponseKind; tier?: PriceTier; stats: RespondStats }
  | { name: "followup"; responseId: string; kind: ResponseKind }
  | { name: "done" };

export function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, currencyDisplay: "narrowSymbol", maximumFractionDigits: amount % 1 === 0 ? 0 : 2 }).format(amount);
}

export const intervalLabel = (interval: PricingIntentProps["interval"]) =>
  interval === "month" ? "/mo" : interval === "year" ? "/yr" : " once";

/**
 * The validation widget. Answer first, then give something back:
 * choose → reveal how others answered (+ optional email) → one-tap reason → done.
 * In preview/editor mode nothing is sent and the reveal uses sample numbers.
 */
export function usePricingIntent(props: PricingIntentProps, ctx: PageContextValue) {
  const [step, setStep] = useState<Step>({ name: "choose" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** The recorded answer, kept after the dialog closes so the options can show it. */
  const [answered, setAnswered] = useState<{ kind: ResponseKind; tierId?: string } | null>(null);
  const live = ctx.mode === "live" && !!ctx.slug;

  const choose = async (kind: ResponseKind, tier?: PriceTier) => {
    setBusy(true);
    setError(null);
    try {
      const result = live
        ? await submitResponse({ slug: ctx.slug!, kind, tierId: tier?.id, amount: tier?.price, currency: props.currency, interval: props.interval })
        : { ok: true as const, responseId: "preview", stats: sampleStats(props, ctx, kind, tier) };
      setAnswered({ kind, tierId: tier?.id });
      setStep({ name: "reveal", responseId: result.responseId, kind, tier, stats: result.stats });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const email = async (responseId: string, kind: ResponseKind, value: string) => {
    if (!value.trim()) return setStep({ name: "followup", responseId, kind });
    setBusy(true);
    setError(null);
    try {
      if (live) await updateResponse(responseId, { email: value.trim() });
      setStep({ name: "followup", responseId, kind });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save that email.");
    } finally {
      setBusy(false);
    }
  };

  const reason = async (responseId: string, text: string) => {
    if (!text.trim()) return setStep({ name: "done" });
    setBusy(true);
    try {
      if (live) await updateResponse(responseId, { reason: text.trim() });
    } catch {
      /* the answer itself is already recorded; a lost reason isn't worth an error screen */
    } finally {
      setBusy(false);
      setStep({ name: "done" });
    }
  };

  return { step, busy, error, live, answered, choose, email, reason, reset: () => setStep({ name: "choose" }) };
}

/** Plausible numbers for previews: the page's sample stats spread over the options, plus this answer. */
function sampleStats(props: PricingIntentProps, ctx: PageContextValue, kind: ResponseKind, tier?: PriceTier): RespondStats {
  const { responses, wouldPay } = ctx.stats;
  const n = props.tiers.length;
  const hi = Math.max(0, props.tiers.findIndex((t) => t.id === props.highlightedTierId));
  // Bell-ish around the highlighted option.
  const weights = props.tiers.map((_, i) => 1 / (1 + Math.abs(i - hi)));
  const total = weights.reduce((a, b) => a + b, 0);
  const buckets = props.tiers.map((t, i) => ({ tierId: t.id as string | null, count: Math.round((wouldPay * weights[i]) / total) }));
  buckets.push({ tierId: null, count: Math.max(0, responses - wouldPay) });
  const mine = buckets.find((b) => b.tierId === (kind === "would_pay" ? (tier?.id ?? props.tiers[n - 1].id) : null));
  if (mine) mine.count += 1;
  return { responses: responses + 1, wouldPay: wouldPay + (kind === "would_pay" ? 1 : 0), buckets };
}

/* ---------------- Reveal: how everyone else answered, then an optional email ---------------- */

export function RevealPanel({
  kind,
  tier,
  stats,
  props,
  busy,
  error,
  live,
  onContinue,
}: {
  kind: ResponseKind;
  tier?: PriceTier;
  stats: RespondStats;
  props: PricingIntentProps;
  busy: boolean;
  error: string | null;
  live: boolean;
  onContinue: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const count = (id: string | null) => stats.buckets.find((b) => b.tierId === id)?.count ?? 0;
  const rows = [...props.tiers.map((t) => ({ key: t.id as string | null, label: formatPrice(t.price, props.currency) + intervalLabel(props.interval), count: count(t.id) })), { key: null, label: props.noPayLabel, count: count(null) }];
  const max = Math.max(1, ...rows.map((r) => r.count));
  const mineKey = kind === "would_pay" ? (tier?.id ?? null) : null;
  const enough = stats.responses >= 5;
  const pct = Math.round((stats.wouldPay / Math.max(1, stats.responses)) * 100);
  const handle = (e: FormEvent) => {
    e.preventDefault();
    onContinue(email);
  };

  return (
    <form onSubmit={handle} className="p-6 sm:p-8">
      <div className="mb-3 inline-flex size-9 items-center justify-center rounded-full bg-vp-accent text-vp-accent-fg">
        <Check className="size-5" strokeWidth={3} aria-hidden />
      </div>
      <h3 className="vp-display text-2xl text-vp-fg">
        {kind === "would_pay" && tier ? `You'd pay ${formatPrice(tier.price, props.currency)}${intervalLabel(props.interval)}.` : "You wouldn't pay. Noted — that counts too."}
      </h3>
      <p className="mt-1 text-sm text-vp-muted">
        {!live
          ? "Sample numbers — nothing is recorded in a preview."
          : enough
            ? kind === "would_pay"
              ? `You're with the ${pct}% who'd pay. Here's how ${stats.responses} people answered:`
              : `${100 - pct}% of ${stats.responses} people said the same. Here's the spread:`
            : `You're answer #${stats.responses}. Early days — the picture fills in as more people answer.`}
      </p>

      <ul className="mt-5 space-y-2" aria-label="How others answered">
        {rows.map((r) => {
          const mine = r.key === mineKey;
          return (
            <li key={r.key ?? "no"} className="grid grid-cols-[6.5rem_1fr_2rem] items-center gap-3 text-sm">
              <span className={cn("truncate tabular-nums", mine ? "font-semibold text-vp-fg" : "text-vp-muted")}>{r.label}</span>
              <span className="h-2.5 overflow-hidden rounded-full bg-vp-fg/10">
                <span
                  className={cn("block h-full rounded-full transition-[width] duration-700", mine ? "bg-vp-accent" : "bg-vp-fg/35")}
                  style={{ width: `${(r.count / max) * 100}%` }}
                />
              </span>
              <span className={cn("text-right tabular-nums", mine ? "font-semibold text-vp-fg" : "text-vp-muted")}>{r.count}</span>
            </li>
          );
        })}
      </ul>

      {props.askEmail && (
        <div className="mt-6 border-t border-vp-border pt-5">
          <label htmlFor="vp-email" className="block text-sm font-semibold text-vp-fg">
            Want to know where the price lands?
          </label>
          <p className="mt-1 text-xs text-vp-muted">Optional. One email when there&apos;s news, nothing else.</p>
          <input
            id="vp-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-3 h-11 w-full rounded-vp-md border border-vp-border bg-vp-bg px-4 text-vp-fg placeholder:text-vp-muted/70 focus:outline-none focus:ring-2 focus:ring-vp-accent"
          />
        </div>
      )}
      {error && <p className="mt-3 text-sm vp-negative">{error}</p>}
      <VpButton type="submit" size="lg" disabled={busy} className="mt-5 w-full">
        {busy ? "Saving…" : email.trim() ? "Keep me posted" : "Continue"}
      </VpButton>
    </form>
  );
}

/* ---------------- Follow-up: one-tap reasons ---------------- */

const NO_CHIPS = ["Too expensive", "I already have a tool for this", "I don't have this problem", "Not right now", "I'd need to try it first"];
const YES_CHIPS = ["Nothing — I'd pay today", "It needs to work with my tools", "I'd want a trial first", "Depends on the details"];

export function FollowUpPanel({
  kind,
  question,
  busy,
  onSubmit,
}: {
  kind: ResponseKind;
  question: string;
  busy: boolean;
  onSubmit: (text: string) => void;
}) {
  const [chip, setChip] = useState<string | null>(null);
  const [text, setText] = useState("");
  const chips = kind === "would_pay" ? YES_CHIPS : NO_CHIPS;
  const answer = [chip, text.trim()].filter(Boolean).join(" — ");
  return (
    <div className="p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-vp-muted">One more thing</p>
      <h3 className="vp-display mt-2 text-2xl text-vp-fg">{kind === "would_pay" ? question : "What would have to change?"}</h3>
      <div className="mt-5 flex flex-wrap gap-2">
        {chips.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setChip((cur) => (cur === c ? null : c))}
            aria-pressed={chip === c}
            className={cn(
              "rounded-full border px-3.5 py-2 text-sm transition-colors",
              chip === c ? "border-vp-accent bg-vp-accent text-vp-accent-fg" : "border-vp-border bg-vp-bg text-vp-fg hover:border-vp-border-strong",
            )}
          >
            {c}
          </button>
        ))}
      </div>
      <textarea
        id="vp-reason"
        rows={2}
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-label="Anything else?"
        className="mt-4 w-full resize-none rounded-vp-md border border-vp-border bg-vp-bg px-4 py-3 text-sm text-vp-fg placeholder:text-vp-muted/70 focus:outline-none focus:ring-2 focus:ring-vp-accent"
        placeholder="Anything else? (optional)"
      />
      <VpButton size="lg" disabled={busy} onClick={() => onSubmit(answer)} className="mt-4 w-full">
        {busy ? "Sending…" : answer ? "Send" : "Skip"}
      </VpButton>
    </div>
  );
}

export function DonePanel({ productName }: { productName: string }) {
  return (
    <div className="p-8 text-center">
      <div className="mx-auto mb-4 inline-flex size-12 items-center justify-center rounded-full bg-vp-accent text-vp-accent-fg">
        <Check className="size-6" strokeWidth={3} aria-hidden />
      </div>
      <h3 className="vp-display text-2xl text-vp-fg">That&apos;s it.</h3>
      <p className="mt-2 text-sm text-vp-muted">
        You just helped decide whether {productName} gets built. Feel free to share this page with someone who&apos;d have an opinion.
      </p>
    </div>
  );
}

export function NoPayLink({ label, onClick, className }: { label: string; onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("text-sm font-medium text-vp-muted underline decoration-vp-border underline-offset-4 transition-colors hover:text-vp-fg", className)}
    >
      {label}
    </button>
  );
}

/** Shared tail of every variant, in a dialog over the options: reveal → reason → done. Closing at any point keeps the recorded answer. */
export function AfterChoice({ w, props, productName }: { w: ReturnType<typeof usePricingIntent>; props: PricingIntentProps; productName: string }) {
  const { step } = w;
  const title = step.name === "reveal" ? "How others answered" : step.name === "followup" ? "One more thing" : "Thank you";
  return (
    <VpModal open={step.name !== "choose"} onClose={w.reset} title={title}>
      {step.name === "reveal" && (
        <RevealPanel
          kind={step.kind}
          tier={step.tier}
          stats={step.stats}
          props={props}
          busy={w.busy}
          error={w.error}
          live={w.live}
          onContinue={(email) => void w.email(step.responseId, step.kind, email)}
        />
      )}
      {step.name === "followup" && <FollowUpPanel kind={step.kind} question={props.followUpQuestion} busy={w.busy} onSubmit={(t) => void w.reason(step.responseId, t)} />}
      {step.name === "done" && (
        <div>
          <DonePanel productName={productName} />
          <div className="px-8 pb-8 text-center">
            <VpButton variant="secondary" size="md" onClick={w.reset}>
              Close
            </VpButton>
          </div>
        </div>
      )}
    </VpModal>
  );
}

/** Small line under the options once an answer is in. */
export function AnsweredNote({ w, props }: { w: ReturnType<typeof usePricingIntent>; props: PricingIntentProps }) {
  if (!w.answered) return null;
  const tier = props.tiers.find((t) => t.id === w.answered?.tierId);
  return (
    <p className="mt-4 text-center text-sm text-vp-muted">
      You answered{" "}
      <span className="font-medium text-vp-fg">{w.answered.kind === "would_pay" && tier ? `${formatPrice(tier.price, props.currency)}${intervalLabel(props.interval)}` : "you wouldn't pay"}</span>. Pick
      again to change it.
    </p>
  );
}
