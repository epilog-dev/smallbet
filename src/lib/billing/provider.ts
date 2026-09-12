import "server-only";

/**
 * Payment seam. The unlock flow calls `startCheckout` for priced unlocks; whatever provider
 * we wire in (Stripe Checkout is the obvious one) returns a URL to send the founder to, and
 * its webhook calls `recordUnlock` with the provider reference.
 *
 * Until a provider is configured, development gets an instant "dev" unlock so the whole flow
 * can be exercised; production refuses, so nothing is ever unlocked without a payment.
 */
export type CheckoutResult = { kind: "redirect"; url: string } | { kind: "settled"; provider: "dev"; ref: string };

export function paymentsConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export async function startCheckout(args: { projectId: string; userId: string; usd: number; returnUrl: string }): Promise<CheckoutResult> {
  if (paymentsConfigured()) {
    // TODO(stripe): create a Checkout Session for `args.usd` with metadata { projectId, userId }
    // and return { kind: "redirect", url: session.url }; the webhook then calls recordUnlock().
    throw new Error("Stripe checkout is not wired up yet.");
  }
  if (process.env.NODE_ENV === "production") throw new Error("Payments aren't set up yet. Unlocks are paused.");
  return { kind: "settled", provider: "dev", ref: `dev-${args.projectId.slice(0, 8)}-${Date.now()}` };
}
