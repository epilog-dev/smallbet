"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";
import { unlockProjectAction } from "@/app/(app)/app/actions";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/analytics/pricing-stats";
import type { UnlockState } from "@/lib/billing/unlock";

const per = (interval: string) => (interval === "month" ? "/mo" : interval === "year" ? "/yr" : "");

/** Replaces the defensible-price tile until the result is unlocked. */
export function UnlockCard({ projectId, state, responses, interval }: { projectId: string; state: Exclude<UnlockState, { kind: "unlocked" }>; responses: number; interval: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const unlock = () =>
    start(async () => {
      const r = await unlockProjectAction(projectId);
      if (!r.ok) return void toast.error(r.message);
      if ("redirect" in r) return void (window.location.href = r.redirect);
      toast.success("Unlocked. Your result, reasons and leads are open.");
      router.refresh();
    });

  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">Your result</h2>
        <Lock className="size-3.5 text-muted-foreground" />
      </div>

      {state.kind === "collecting" && (
        <>
          <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
            {responses}
            <span className="text-base font-normal text-muted-foreground"> / 10 answers</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            The defensible price, every reason and the emails of people who&apos;d pay unlock once 10 people have answered. {state.need} to go.
          </p>
        </>
      )}

      {state.kind === "free" && (
        <>
          <p className="mt-2 text-3xl font-semibold tracking-tight">Free</p>
          <p className="mt-1 text-sm text-muted-foreground">The market said no — fewer than a quarter would pay. We don&apos;t charge for a no. Open the full result and read why.</p>
          <Button className="mt-4 w-full" onClick={unlock} disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : <Unlock />} Open the result
          </Button>
        </>
      )}

      {state.kind === "priced" && (
        <>
          <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
            ${state.usd}
            <span className="text-base font-normal text-muted-foreground"> once</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            One month of what your visitors said they&apos;d pay — they picked <span className="font-medium text-foreground">{formatMoney(state.basedOn.price, state.basedOn.currency)}{per(interval)}</span>. Unlocks the
            defensible price, every reason, and the emails of everyone who&apos;d pay.
          </p>
          <Button className="mt-4 w-full" onClick={unlock} disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : <Unlock />} Unlock for ${state.usd}
          </Button>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">One-time. Yours forever. Serial founders: $29/mo unlocks everything.</p>
        </>
      )}
    </section>
  );
}
