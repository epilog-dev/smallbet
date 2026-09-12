import { MIN_SAMPLE, type PricingStats } from "@/lib/analytics/pricing-stats";

/**
 * Pay-on-yes. A page's full result is unlocked once, and the unlock costs one month of the
 * defensible price the founder's own visitors picked — capped so an enterprise-priced idea
 * doesn't produce a scary number. If the market said no, the unlock is free: we don't charge
 * for a no.
 */
export const UNLOCK_MIN_USD = 9;
export const UNLOCK_MAX_USD = 99;
/** Below this would-pay share the verdict is a "no" and the unlock is free. */
export const NO_THRESHOLD = 0.25;

/** Rough rates to USD for turning a page's defensible price into an unlock price. Refresh occasionally; precision isn't the point. */
const TO_USD: Record<string, number> = { USD: 1, EUR: 1.1, GBP: 1.3, INR: 0.012, CAD: 0.73, AUD: 0.66, SGD: 0.75, JPY: 0.0068, CHF: 1.15, BRL: 0.18, MXN: 0.055, NGN: 0.00065 };

export type UnlockState =
  | { kind: "unlocked" }
  | { kind: "collecting"; need: number }
  | { kind: "free"; reason: "no" }
  | { kind: "priced"; usd: number; basedOn: { price: number; currency: string; label: string } };

export function unlockState(stats: PricingStats, unlockedAt: string | null): UnlockState {
  if (unlockedAt) return { kind: "unlocked" };
  if (stats.responses < MIN_SAMPLE) return { kind: "collecting", need: MIN_SAMPLE - stats.responses };
  const d = stats.defensible;
  if (!d || d.price == null || (stats.wouldPayShare ?? 0) < NO_THRESHOLD) return { kind: "free", reason: "no" };
  const perMonth = stats.interval === "year" ? d.price / 12 : d.price; // one-time prices are taken as-is
  const usd = Math.round(Math.min(UNLOCK_MAX_USD, Math.max(UNLOCK_MIN_USD, perMonth * (TO_USD[stats.currency] ?? 1))));
  return { kind: "priced", usd, basedOn: { price: d.price, currency: stats.currency, label: d.label } };
}
