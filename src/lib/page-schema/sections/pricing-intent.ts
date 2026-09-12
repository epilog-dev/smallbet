import { z } from "zod";
import { baseSection, short } from "./shared";

export const PRICING_INTENT_VARIANTS = ["tiers", "single-price"] as const;

export const CURRENCIES = ["USD", "EUR", "GBP", "INR", "CAD", "AUD", "SGD", "JPY", "CHF", "BRL", "MXN", "NGN"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const CURRENCY_LABELS: Record<Currency, string> = {
  USD: "US dollar",
  EUR: "Euro",
  GBP: "British pound",
  INR: "Indian rupee",
  CAD: "Canadian dollar",
  AUD: "Australian dollar",
  SGD: "Singapore dollar",
  JPY: "Japanese yen",
  CHF: "Swiss franc",
  BRL: "Brazilian real",
  MXN: "Mexican peso",
  NGN: "Nigerian naira",
};

/** "$", "€", "₹"… — the symbol Intl uses for this currency in en-US. */
export function currencySymbol(currency: string): string {
  const part = new Intl.NumberFormat("en-US", { style: "currency", currency, currencyDisplay: "narrowSymbol" })
    .formatToParts(0)
    .find((x) => x.type === "currency");
  return part?.value ?? currency;
}
export const INTERVALS = ["month", "year", "one-time"] as const;

export const PriceTierSchema = z.object({
  id: short(24, "Stable id, e.g. 'starter'."),
  name: short(30),
  price: z.number().min(0).max(100000).describe("Price in major currency units, e.g. 19 for $19."),
  blurb: short(90, "Who this tier is for, one line."),
  features: z.array(short(60)).min(2).max(5),
});

export const PricingIntentPropsSchema = z.object({
  title: short(80, "e.g. 'What would you pay?'"),
  subtitle: short(200, "Explain honestly that this is pre-launch and their answer shapes the price."),
  currency: z.enum(CURRENCIES),
  interval: z.enum(INTERVALS),
  tiers: z.array(PriceTierSchema).min(1).max(3),
  highlightedTierId: z.string().optional().describe("id of the tier to visually emphasise."),
  ctaLabel: short(30, "Button on each tier, e.g. \"I'd pay this\"."),
  noPayLabel: short(60, "e.g. \"I wouldn't pay for this\"."),
  askEmail: z.boolean().describe("Ask for an optional email after a choice so the founder can follow up."),
  followUpQuestion: short(120, "Asked after the choice, e.g. 'What would make this a must-have for you?'"),
});

export const PricingIntentSectionSchema = baseSection("pricing-intent", [...PRICING_INTENT_VARIANTS]).extend({
  props: PricingIntentPropsSchema,
});
export type PricingIntentSection = z.infer<typeof PricingIntentSectionSchema>;
export type PricingIntentProps = z.infer<typeof PricingIntentPropsSchema>;
export type PriceTier = z.infer<typeof PriceTierSchema>;
