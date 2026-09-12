"use client";

import { Check } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { PriceTier, PricingIntentProps } from "@/lib/page-schema";
import { submitReason, submitResponse, type ResponseKind } from "@/lib/respond-client";
import { cn } from "@/lib/utils";
import { VpButton } from "../../primitives/Button";
import type { PageContextValue } from "../../types";

type Step = { name: "choose" } | { name: "confirm"; kind: ResponseKind; tier?: PriceTier } | { name: "followup"; responseId: string; kind: ResponseKind } | { name: "done" };

export function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: amount % 1 === 0 ? 0 : 2 }).format(amount);
}

export const intervalLabel = (interval: PricingIntentProps["interval"]) =>
  interval === "month" ? "/mo" : interval === "year" ? "/yr" : " once";

/**
 * The validation widget. Drives a small state machine:
 * choose tier or "wouldn't pay" → optional email → thank-you + follow-up question → done.
 * In preview/editor mode nothing is sent.
 */
export function usePricingIntent(props: PricingIntentProps, ctx: PageContextValue) {
  const [step, setStep] = useState<Step>({ name: "choose" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const live = ctx.mode === "live" && !!ctx.slug;

  const choose = (kind: ResponseKind, tier?: PriceTier) => {
    setError(null);
    if (props.askEmail) setStep({ name: "confirm", kind, tier });
    else void send(kind, tier);
  };

  const send = async (kind: ResponseKind, tier?: PriceTier, email?: string) => {
    setBusy(true);
    setError(null);
    try {
      const result = live
        ? await submitResponse({
            slug: ctx.slug!,
            kind,
            tierId: tier?.id,
            amount: tier?.price,
            currency: props.currency,
            interval: props.interval,
            email: email || undefined,
          })
        : { ok: true as const, responseId: "preview", stats: { responses: 0, wouldPay: 0 } };
      setStep({ name: "followup", responseId: result.responseId, kind });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const reason = async (responseId: string, text: string) => {
    if (!text.trim()) return setStep({ name: "done" });
    setBusy(true);
    try {
      if (live) await submitReason(responseId, text.trim());
      setStep({ name: "done" });
    } catch {
      setStep({ name: "done" });
    } finally {
      setBusy(false);
    }
  };

  return { step, busy, error, live, choose, send, reason, reset: () => setStep({ name: "choose" }) };
}

export function ConfirmPanel({
  kind,
  tier,
  props,
  busy,
  error,
  onSubmit,
  onBack,
}: {
  kind: ResponseKind;
  tier?: PriceTier;
  props: PricingIntentProps;
  busy: boolean;
  error: string | null;
  onSubmit: (email: string) => void;
  onBack: () => void;
}) {
  const [email, setEmail] = useState("");
  const handle = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(email);
  };
  return (
    <form onSubmit={handle} className="vp-ladder mx-auto max-w-md p-6 sm:p-8">
      <p className="text-sm font-semibold text-vp-accent-ink">
        {kind === "would_pay" && tier
          ? `You picked ${tier.name} · ${formatPrice(tier.price, props.currency)}${intervalLabel(props.interval)}`
          : "You said you wouldn't pay — that's useful too."}
      </p>
      <h3 className="vp-display mt-2 text-2xl text-vp-fg">Want to hear if this launches?</h3>
      <p className="mt-2 text-sm text-vp-muted">Optional. One email when there&apos;s news, nothing else.</p>
      <label className="sr-only" htmlFor="vp-email">
        Email
      </label>
      <input
        id="vp-email"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mt-5 h-12 w-full rounded-vp-md border border-vp-border bg-vp-bg px-4 text-vp-fg placeholder:text-vp-muted/70 focus:outline-none focus:ring-2 focus:ring-vp-accent"
      />
      {error && <p className="mt-3 text-sm vp-negative">{error}</p>}
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <VpButton type="submit" size="lg" disabled={busy} className="flex-1">
          {busy ? "Sending…" : email ? "Send my answer" : "Skip & send my answer"}
        </VpButton>
        <VpButton type="button" variant="ghost" size="lg" onClick={onBack} disabled={busy}>
          Back
        </VpButton>
      </div>
    </form>
  );
}

export function FollowUpPanel({
  kind,
  question,
  busy,
  onSubmit,
  live = true,
}: {
  kind: ResponseKind;
  question: string;
  busy: boolean;
  onSubmit: (text: string) => void;
  /** false in previews: say so instead of claiming the answer was recorded */
  live?: boolean;
}) {
  const [text, setText] = useState("");
  return (
    <div className="vp-ladder mx-auto max-w-md p-6 sm:p-8">
      <div className="mb-3 inline-flex size-9 items-center justify-center rounded-full bg-emerald-500/15 vp-positive">
        <Check className="size-5" strokeWidth={3} aria-hidden />
      </div>
      <h3 className="vp-display text-2xl text-vp-fg">{live ? "Thank you — recorded." : "Thank you — that's the whole flow."}</h3>
      <p className="mt-2 text-sm text-vp-muted">
        {kind === "would_pay" ? "One more thing, if you have 10 seconds:" : "Mind telling us why? It genuinely helps:"}
      </p>
      <label htmlFor="vp-reason" className="mt-5 block text-sm font-semibold text-vp-fg">
        {kind === "would_pay" ? question : "What would have to be true for you to pay?"}
      </label>
      <textarea
        id="vp-reason"
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="mt-2 w-full resize-none rounded-vp-md border border-vp-border bg-vp-bg px-4 py-3 text-vp-fg placeholder:text-vp-muted/70 focus:outline-none focus:ring-2 focus:ring-vp-accent"
        placeholder="Type a sentence or two…"
      />
      <div className="mt-4 flex gap-2">
        <VpButton size="lg" disabled={busy} onClick={() => onSubmit(text)} className="flex-1">
          {busy ? "Sending…" : text.trim() ? "Send" : "Skip"}
        </VpButton>
      </div>
    </div>
  );
}

export function DonePanel({ productName }: { productName: string }) {
  return (
    <div className="vp-ladder mx-auto max-w-md p-8 text-center">
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
