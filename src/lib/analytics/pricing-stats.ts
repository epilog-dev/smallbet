import type { PageDocument, PriceTier } from "@/lib/page-schema";

export interface ResponseLike {
  kind: string;
  tier_id: string | null;
  amount_cents: number | null;
  created_at: string;
}

export interface TierBucket {
  id: string;
  label: string;
  price: number | null;
  count: number;
  share: number;
  /** count × price, the simple revenue proxy used to pick the defensible tier */
  revenue: number;
}

export interface PricingStats {
  views: number;
  responses: number;
  wouldPay: number;
  wouldNotPay: number;
  conversion: number | null;
  wouldPayShare: number | null;
  medianPrice: number | null;
  currency: string;
  interval: string;
  buckets: TierBucket[];
  /** tier maximising count × price; null until there are enough answers */
  defensible: TierBucket | null;
  lowSample: boolean;
  goal: { target: number; deadlineDays: number; daysLeft: number | null; pct: number };
}

export const MIN_SAMPLE = 10;

export function computePricingStats(doc: PageDocument, responses: ResponseLike[], views: number, publishedAt: string | null): PricingStats {
  const pricing = doc.sections.find((s) => s.type === "pricing-intent");
  const tiers: PriceTier[] = pricing?.type === "pricing-intent" ? pricing.props.tiers : [];
  const currency = pricing?.type === "pricing-intent" ? pricing.props.currency : "USD";
  const interval = pricing?.type === "pricing-intent" ? pricing.props.interval : "month";

  const wouldPayRows = responses.filter((r) => r.kind === "would_pay");
  const wouldNotPay = responses.length - wouldPayRows.length;

  const byTier = new Map<string, number>();
  for (const r of wouldPayRows) byTier.set(r.tier_id ?? "unknown", (byTier.get(r.tier_id ?? "unknown") ?? 0) + 1);

  const total = responses.length || 1;
  const buckets: TierBucket[] = tiers.map((t) => {
    const count = byTier.get(t.id) ?? 0;
    return { id: t.id, label: t.name, price: t.price, count, share: count / total, revenue: count * t.price };
  });
  // Answers for tiers that no longer exist on the page (renamed/removed) still count.
  for (const [id, count] of byTier) {
    if (!tiers.some((t) => t.id === id)) {
      const cents = wouldPayRows.find((r) => r.tier_id === id)?.amount_cents ?? null;
      const price = cents != null ? cents / 100 : null;
      buckets.push({ id, label: id === "unknown" ? "Other" : `${id} (removed)`, price, count, share: count / total, revenue: price ? count * price : 0 });
    }
  }
  buckets.push({ id: "would_not_pay", label: "Wouldn't pay", price: null, count: wouldNotPay, share: wouldNotPay / total, revenue: 0 });

  const prices = wouldPayRows.map((r) => (r.amount_cents ?? 0) / 100).filter((p) => p > 0).sort((a, b) => a - b);
  const medianPrice = prices.length ? (prices.length % 2 ? prices[(prices.length - 1) / 2] : (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2) : null;

  const candidates = buckets.filter((b) => b.price != null && b.count > 0);
  const defensible = candidates.length ? candidates.reduce((best, b) => (b.revenue > best.revenue ? b : best)) : null;

  const start = publishedAt ? new Date(publishedAt) : null;
  const deadline = start ? new Date(start.getTime() + doc.goal.deadlineDays * 86400000) : null;
  const daysLeft = deadline ? Math.max(0, Math.ceil((deadline.getTime() - Date.now()) / 86400000)) : null;

  return {
    views,
    responses: responses.length,
    wouldPay: wouldPayRows.length,
    wouldNotPay,
    conversion: views > 0 ? responses.length / views : null,
    wouldPayShare: responses.length ? wouldPayRows.length / responses.length : null,
    medianPrice,
    currency,
    interval,
    buckets,
    defensible,
    lowSample: responses.length < MIN_SAMPLE,
    goal: { target: doc.goal.targetResponses, deadlineDays: doc.goal.deadlineDays, daysLeft, pct: Math.min(100, Math.round((responses.length / Math.max(1, doc.goal.targetResponses)) * 100)) },
  };
}

export function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: amount % 1 === 0 ? 0 : 2 }).format(amount);
}
