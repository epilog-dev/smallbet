import { PageProvider } from "@/components/page/context";
import { PricingIntentPriceLadder } from "@/components/page/sections/pricing-intent/PriceLadder";
import { ThemeScope } from "@/components/page/theme/ThemeScope";
import type { PageContextValue } from "@/components/page/types";
import type { PageDocument } from "@/lib/page-schema";

/** The real pricing-intent widget, in preview mode (nothing is recorded), embedded on the landing page. */
export function TryTheQuestion({ doc }: { doc: PageDocument }) {
  const section = doc.sections.find((s) => s.type === "pricing-intent");
  if (!section || section.type !== "pricing-intent") return null;
  // Ink buttons like the rest of the landing page, with an emerald accent for ticks, chips and the
  // reveal bars. The Ledgerly fixture keeps its own colour elsewhere.
  const theme: PageDocument["theme"] = { ...doc.theme, button: "ink", accent: "emerald", accentHex: undefined };
  const ctx: PageContextValue = {
    mode: "preview",
    doc,
    theme,
    rootId: "try-question",
    pricingAnchor: section.id,
    stats: { responses: 41, wouldPay: 28, target: 50, daysLeft: 12 },
  };
  return (
    <PageProvider value={ctx}>
      <ThemeScope id="try-question" theme={theme} persistMode={false} followApp className="rounded-xl border border-border">
        <div className="[&_section]:!border-t-0 [&_section]:!py-10 sm:[&_section]:!py-12">
          <PricingIntentPriceLadder section={{ ...section, props: { ...section.props, title: "What would you pay for a month-end that closes itself?" } }} ctx={ctx} />
        </div>
      </ThemeScope>
    </PageProvider>
  );
}
